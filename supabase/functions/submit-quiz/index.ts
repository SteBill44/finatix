import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizAnswer {
  questionIndex: number;
  answer: number | number[] | string | null;
}

interface QuizQuestion {
  id: string;
  correct_answer: number;
  correct_answers: number[] | null;
  number_answer: number | null;
  number_tolerance: number;
  question_type: string;
}

function isAnswerCorrect(question: QuizQuestion, answer: QuizAnswer["answer"]): boolean {
  if (answer === null || answer === undefined) return false;

  switch (question.question_type) {
    case "multiple_choice":
      return answer === question.correct_answer;

    case "multiple_select":
      if (!Array.isArray(answer) || !question.correct_answers) return false;
      const sortedUser = [...answer].sort();
      const sortedCorrect = [...question.correct_answers].sort();
      return (
        sortedUser.length === sortedCorrect.length &&
        sortedUser.every((val, idx) => val === sortedCorrect[idx])
      );

    case "number_input":
      if (typeof answer !== "number" || question.number_answer === null) return false;
      const tolerance = question.number_tolerance || 0;
      return Math.abs(answer - question.number_answer) <= tolerance;

    case "fill_blank":
      if (typeof answer !== "string") return false;
      // For fill_blank, correct answer is stored in options[correct_answer]
      return false; // Needs special handling based on your implementation

    default:
      return answer === question.correct_answer;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create client with user's auth token for authentication
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Create service role client to access questions with correct answers
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { quizId, answers, timeTakenSeconds } = await req.json();

    if (!quizId || !answers) {
      throw new Error("Missing quizId or answers");
    }

    // Get quiz details
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("id, course_id, title")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      throw new Error("Quiz not found");
    }

    // Verify user is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", quiz.course_id)
      .single();

    if (enrollmentError || !enrollment) {
      throw new Error("You must be enrolled in this course to take this quiz");
    }

    // Fetch questions with correct answers (server-side only)
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, correct_answer, correct_answers, number_answer, number_tolerance, question_type, order_index")
      .eq("quiz_id", quizId)
      .order("order_index");

    if (questionsError || !questions) {
      throw new Error("Failed to fetch quiz questions");
    }

    // Calculate score SERVER-SIDE
    let score = 0;
    const maxScore = questions.length;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (isAnswerCorrect(question, userAnswer)) {
        score++;
      }
    });

    // Record the attempt using service role (bypasses RLS)
    const { data: attempt, error: insertError } = await supabaseAdmin
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        course_id: quiz.course_id,
        quiz_id: quiz.id,
        score,
        max_score: maxScore,
        time_taken_seconds: timeTakenSeconds || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to record quiz attempt");
    }

    console.log(`Quiz ${quizId} submitted by user ${user.id}: ${score}/${maxScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        attemptId: attempt.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Submit quiz error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
