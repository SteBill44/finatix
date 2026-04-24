import { getCorsHeaders, corsResponse } from "../_shared/cors.ts";
import { authenticate, isAuthFailure } from "../_shared/auth.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  syllabus_area_index: number | null;
}

interface QuestionResult {
  questionId: string;
  syllabusAreaIndex: number | null;
  isCorrect: boolean;
  userAnswer: QuizAnswer["answer"];
}

function isAnswerCorrect(question: QuizQuestion, answer: QuizAnswer["answer"]): boolean {
  if (answer === null || answer === undefined) return false;

  switch (question.question_type) {
    case "multiple_choice":
      return answer === question.correct_answer;

    case "multiple_response":
    case "multiple_select":
      if (!Array.isArray(answer) || !question.correct_answers) return false;
      const sortedUser = [...answer].sort();
      const sortedCorrect = [...question.correct_answers].sort();
      return (
        sortedUser.length === sortedCorrect.length &&
        sortedUser.every((val, idx) => val === sortedCorrect[idx])
      );

    case "number_entry":
    case "number_input":
      if (typeof answer !== "number" || question.number_answer === null) return false;
      const tolerance = question.number_tolerance || 0;
      return Math.abs(answer - question.number_answer) <= tolerance;

    case "drag_drop":
      if (!Array.isArray(answer)) return false;
      return answer.every((val, idx) => val === idx);

    default:
      return answer === question.correct_answer;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return corsResponse(req);
  }

  try {
    // Original behaviour: missing auth → 401 with message "No authorization header",
    // invalid token → 401 with message "Unauthorized". Preserve both.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("No authorization header", 401, corsHeaders);
    }

    const auth = await authenticate(req, corsHeaders, { invalidTokenMessage: "Unauthorized" });
    if (isAuthFailure(auth)) return auth.response;
    const { user, adminClient: supabaseAdmin } = auth;

    const { quizId, answers, timeTakenSeconds, focusViolations } = await req.json();

    if (!quizId || !answers) {
      return errorResponse("Missing quizId or answers", 400, corsHeaders);
    }

    // Get quiz details including type for pass/fail calculation
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("id, course_id, title, quiz_type")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return errorResponse("Quiz not found", 400, corsHeaders);
    }

    // Verify enrollment
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", quiz.course_id)
      .single();

    if (enrollmentError || !enrollment) {
      return errorResponse("You must be enrolled in this course to take this quiz", 400, corsHeaders);
    }

    // Fetch questions server-side (correct answers never sent to client)
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, correct_answer, correct_answers, number_answer, number_tolerance, question_type, order_index, syllabus_area_index")
      .eq("quiz_id", quizId)
      .is("deleted_at", null)
      .order("order_index");

    if (questionsError || !questions) {
      return errorResponse("Failed to fetch quiz questions", 400, corsHeaders);
    }

    // For mock exams, fetch the passing threshold
    let passingScorePct = 50;
    if (quiz.quiz_type === "mock_exam") {
      const { data: mockSpec } = await supabaseAdmin
        .from("mock_exam_specifications")
        .select("passing_score_percentage")
        .eq("quiz_id", quizId)
        .maybeSingle();
      if (mockSpec) passingScorePct = mockSpec.passing_score_percentage;
    }

    // Get syllabus for title mapping
    const { data: syllabus } = await supabaseAdmin
      .from("course_syllabuses")
      .select("syllabus_areas")
      .eq("course_id", quiz.course_id)
      .maybeSingle();

    const syllabusAreas = (syllabus?.syllabus_areas as Array<{ title: string }>) || [];

    // Calculate score — server-side only
    let score = 0;
    const maxScore = questions.length;
    const questionResults: QuestionResult[] = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = isAnswerCorrect(question, userAnswer);
      if (isCorrect) score++;
      questionResults.push({
        questionId: question.id,
        syllabusAreaIndex: question.syllabus_area_index,
        isCorrect,
        userAnswer,
      });
    });

    // Determine pass/fail for mock exams
    const passed: boolean | null = quiz.quiz_type === "mock_exam"
      ? (score / maxScore) * 100 >= passingScorePct
      : null;

    // Record the attempt
    const { data: attempt, error: insertError } = await supabaseAdmin
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        course_id: quiz.course_id,
        quiz_id: quiz.id,
        score,
        max_score: maxScore,
        time_taken_seconds: timeTakenSeconds || null,
        focus_violations: focusViolations || 0,
        passed,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return errorResponse("Failed to record quiz attempt", 400, corsHeaders);
    }

    // Track per-question attempts — now includes the student's actual answer
    const questionAttempts = questionResults.map((result) => ({
      user_id: user.id,
      question_id: result.questionId,
      course_id: quiz.course_id,
      syllabus_area_index: result.syllabusAreaIndex,
      is_correct: result.isCorrect,
      user_answer: result.userAnswer !== undefined ? result.userAnswer : null,
      time_taken_seconds: timeTakenSeconds ? Math.floor(timeTakenSeconds / questions.length) : null,
    }));

    const { error: attemptInsertError } = await supabaseAdmin
      .from("user_question_attempts")
      .insert(questionAttempts);

    if (attemptInsertError) {
      console.error("Question attempts insert error:", attemptInsertError);
    }

    // Update question statistics
    for (const result of questionResults) {
      const { data: current } = await supabaseAdmin
        .from("quiz_questions")
        .select("times_shown, times_correct")
        .eq("id", result.questionId)
        .single();

      if (current) {
        await supabaseAdmin
          .from("quiz_questions")
          .update({
            times_shown: (current.times_shown || 0) + 1,
            times_correct: result.isCorrect
              ? (current.times_correct || 0) + 1
              : current.times_correct,
          })
          .eq("id", result.questionId);
      }
    }

    // Update syllabus mastery per area
    const uniqueAreas = new Map<number, { correct: number; total: number }>();
    for (const result of questionResults) {
      if (result.syllabusAreaIndex !== null) {
        const existing = uniqueAreas.get(result.syllabusAreaIndex) || { correct: 0, total: 0 };
        existing.total++;
        if (result.isCorrect) existing.correct++;
        uniqueAreas.set(result.syllabusAreaIndex, existing);
      }
    }

    for (const [areaIndex] of uniqueAreas.entries()) {
      const areaTitle = syllabusAreas[areaIndex]?.title || `Area ${areaIndex + 1}`;
      const areaResults = questionResults.filter(r => r.syllabusAreaIndex === areaIndex);
      for (const result of areaResults) {
        await supabaseAdmin.rpc("update_syllabus_mastery", {
          p_user_id: user.id,
          p_course_id: quiz.course_id,
          p_syllabus_area_index: areaIndex,
          p_syllabus_area_title: areaTitle,
          p_is_correct: result.isCorrect,
        });
      }
    }

    console.log(`Quiz ${quizId} submitted by user ${user.id}: ${score}/${maxScore}${passed !== null ? ` (${passed ? "PASS" : "FAIL"})` : ""}`);

    return jsonResponse(
      {
        success: true,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        passed,
        passingScorePct: quiz.quiz_type === "mock_exam" ? passingScorePct : null,
        attemptId: attempt.id,
        questionResults: questionResults.map((r, i) => ({
          index: i,
          isCorrect: r.isCorrect,
        })),
      },
      200,
      corsHeaders
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Submit quiz error:", errorMessage);
    return errorResponse(errorMessage, 400, corsHeaders);
  }
});
