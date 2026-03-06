import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  course_id: string;
  quiz_type: "lesson_quiz" | "mock_exam" | "final_exam" | "practice";
  lesson_id?: string;
  batch_index?: number; // For practice pool batching (0-4, each generates 100 questions)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check admin role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    const { data: isMaster } = await supabaseAdmin.rpc("is_master_admin", { _user_id: user.id });
    if (!isAdmin && !isMaster) throw new Error("Admin access required");

    const { course_id, quiz_type, lesson_id, batch_index = 0 }: GenerateRequest = await req.json();
    if (!course_id || !quiz_type) throw new Error("Missing course_id or quiz_type");

    // Get course info
    const { data: course } = await supabaseAdmin
      .from("courses").select("id, title, level, slug").eq("id", course_id).single();
    if (!course) throw new Error("Course not found");

    // Get syllabus
    const { data: syllabus } = await supabaseAdmin
      .from("course_syllabuses").select("syllabus_areas, objective").eq("course_id", course_id).maybeSingle();
    const syllabusAreas = (syllabus?.syllabus_areas as Array<{ title: string; topics?: string[] }>) || [];

    // Get lessons for context
    const { data: lessons } = await supabaseAdmin
      .from("lessons").select("id, title, description, order_index")
      .eq("course_id", course_id).order("order_index");

    let targetQuizId: string;
    let questionCount: number;
    let prompt: string;

    const syllabusContext = syllabusAreas.length > 0
      ? `\nSyllabus Areas:\n${syllabusAreas.map((a, i) => `${i + 1}. ${a.title}${a.topics ? ` (Topics: ${a.topics.join(', ')})` : ''}`).join('\n')}`
      : '';

    const courseContext = `Course: ${course.title} (${course.level} level, CIMA qualification)${syllabusContext}`;

    if (quiz_type === "lesson_quiz") {
      if (!lesson_id) throw new Error("lesson_id required for lesson_quiz");
      
      const lesson = lessons?.find(l => l.id === lesson_id);
      if (!lesson) throw new Error("Lesson not found");

      // Find or create quiz for this lesson
      let { data: existingQuiz } = await supabaseAdmin
        .from("quizzes").select("id")
        .eq("course_id", course_id).eq("lesson_id", lesson_id).eq("quiz_type", "lesson_quiz").maybeSingle();

      if (!existingQuiz) {
        const { data: newQuiz } = await supabaseAdmin
          .from("quizzes").insert({
            course_id, lesson_id, title: `Quiz: ${lesson.title}`,
            description: `Chapter quiz for ${lesson.title}`, order_index: lesson.order_index, quiz_type: "lesson_quiz"
          }).select("id").single();
        existingQuiz = newQuiz;
      }
      targetQuizId = existingQuiz!.id;
      questionCount = 10;

      prompt = `${courseContext}\n\nGenerate ${questionCount} multiple choice questions for chapter "${lesson.title}"${lesson.description ? ` (${lesson.description})` : ''}.
Questions should test understanding of the specific chapter content. Mix difficulty: 4 easy, 4 medium, 2 hard.
Each question should have 4 options (A-D) with exactly one correct answer.`;

    } else if (quiz_type === "mock_exam") {
      // Get existing mock exams to find which ones need questions
      const { data: mocks } = await supabaseAdmin
        .from("quizzes").select("id, title")
        .eq("course_id", course_id).eq("quiz_type", "mock_exam").order("order_index");

      if (!mocks || mocks.length === 0) {
        // Create 5 mock exams
        const mockInserts = Array.from({ length: 5 }, (_, i) => ({
          course_id, title: `Mock Exam ${i + 1} - ${course.title}`,
          description: `CIMA-style mock examination ${i + 1}`, order_index: 100 + i, quiz_type: "mock_exam"
        }));
        await supabaseAdmin.from("quizzes").insert(mockInserts);
        const { data: newMocks } = await supabaseAdmin
          .from("quizzes").select("id, title")
          .eq("course_id", course_id).eq("quiz_type", "mock_exam").order("order_index");
        if (!newMocks || newMocks.length === 0) throw new Error("Failed to create mock exams");
        targetQuizId = newMocks[0].id;
      } else {
        // Find first mock with no questions
        for (const mock of mocks) {
          const { count } = await supabaseAdmin
            .from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", mock.id);
          if (!count || count === 0) {
            targetQuizId = mock.id;
            break;
          }
        }
        if (!targetQuizId!) {
          return new Response(JSON.stringify({ message: "All mock exams already have questions" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      questionCount = 45;

      const lessonsContext = lessons?.map(l => `- ${l.title}`).join('\n') || '';
      prompt = `${courseContext}\n\nChapters:\n${lessonsContext}\n\nGenerate ${questionCount} CIMA-style exam questions for a mock examination.
Distribute questions across all syllabus areas proportionally. Mix difficulty: 30% easy, 50% medium, 20% hard.
Questions should be exam-standard with scenario-based questions where appropriate.`;

    } else if (quiz_type === "final_exam") {
      const { data: finalQuiz } = await supabaseAdmin
        .from("quizzes").select("id")
        .eq("course_id", course_id).eq("quiz_type", "final_exam").maybeSingle();
      if (!finalQuiz) throw new Error("Final exam quiz entry not found");
      targetQuizId = finalQuiz.id;
      questionCount = 60;

      const lessonsContext = lessons?.map(l => `- ${l.title}`).join('\n') || '';
      prompt = `${courseContext}\n\nChapters:\n${lessonsContext}\n\nGenerate ${questionCount} comprehensive final exam questions.
This is the most rigorous assessment. Cover ALL syllabus areas thoroughly.
Difficulty: 20% easy, 45% medium, 35% hard. Include scenario-based and applied questions.
These MUST be different from practice and mock exam questions.`;

    } else if (quiz_type === "practice") {
      const { data: practiceQuiz } = await supabaseAdmin
        .from("quizzes").select("id")
        .eq("course_id", course_id).eq("quiz_type", "practice").maybeSingle();
      if (!practiceQuiz) throw new Error("Practice quiz entry not found");
      targetQuizId = practiceQuiz.id;
      questionCount = 100; // Generate 100 at a time, call 5 times for 500

      const lessonsContext = lessons?.map(l => `- ${l.title}`).join('\n') || '';
      prompt = `${courseContext}\n\nChapters:\n${lessonsContext}\n\nGenerate ${questionCount} practice questions (batch ${batch_index + 1} of 5).
These are for a practice question bank. Cover all syllabus areas.
Difficulty distribution: 25% easy, 50% medium, 25% hard.
Vary question styles: straightforward recall, application, analysis, and scenario-based.
Make each question unique and different from typical exam questions.`;

    } else {
      throw new Error("Invalid quiz_type");
    }

    const systemPrompt = `You are a CIMA (Chartered Institute of Management Accountants) exam question writer.
Generate professional, accurate accounting and finance questions.
Return a JSON array of question objects with this exact structure:
[{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "explanation": "Brief explanation of why this answer is correct",
  "difficulty_level": "easy" | "medium" | "hard",
  "syllabus_area_index": 0
}]
- correct_answer is the 0-based index of the correct option
- syllabus_area_index is the 0-based index matching the syllabus areas provided (use 0 if no syllabus)
- ONLY return the JSON array, no other text`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    console.log(`Generating ${questionCount} ${quiz_type} questions for ${course.title}...`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a minute." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from AI");

    // Parse JSON from response (handle markdown code blocks)
    let questionsJson: string = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) questionsJson = jsonMatch[1];
    
    let questions: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
      difficulty_level: string;
      syllabus_area_index: number;
    }>;
    
    try {
      questions = JSON.parse(questionsJson.trim());
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI returned empty or invalid questions array");
    }

    // Get current max order_index for this quiz
    const { data: maxOrderData } = await supabaseAdmin
      .from("quiz_questions").select("order_index")
      .eq("quiz_id", targetQuizId).order("order_index", { ascending: false }).limit(1);
    let startIndex = (maxOrderData?.[0]?.order_index ?? -1) + 1;

    // Insert questions in batches
    const questionInserts = questions.map((q, i) => ({
      quiz_id: targetQuizId,
      question: q.question,
      options: JSON.stringify(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      difficulty_level: q.difficulty_level || "medium",
      syllabus_area_index: q.syllabus_area_index ?? null,
      question_type: "multiple_choice",
      order_index: startIndex + i,
      is_practice_pool: quiz_type === "practice",
    }));

    const { error: insertError } = await supabaseAdmin
      .from("quiz_questions").insert(questionInserts);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to insert questions");
    }

    console.log(`Successfully generated ${questions.length} questions for quiz ${targetQuizId}`);

    return new Response(JSON.stringify({
      success: true,
      questionsGenerated: questions.length,
      quizId: targetQuizId,
      quizType: quiz_type,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate questions error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
