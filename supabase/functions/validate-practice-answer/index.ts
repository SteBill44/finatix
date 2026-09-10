import { getCorsHeaders, corsResponse } from "../_shared/cors.ts";
import { authenticate, isAuthFailure } from "../_shared/auth.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";
import { isAnswerCorrect, type GradableQuestion } from "../_shared/grading.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return corsResponse(req);
  }

  try {
    const auth = await authenticate(req, corsHeaders);
    if (isAuthFailure(auth)) return auth.response;
    const { user, userClient, adminClient } = auth;

    // Rate limit: 60 practice checks per minute, 300 per hour
    const limited = await enforceRateLimit(userClient, corsHeaders, {
      userId: user.id,
      actionType: "practice_answer",
      maxPerMinute: 60,
      maxPerHour: 300,
    });
    if (limited) return limited;

    // Parse and validate input
    let body: { questionId?: unknown; answer?: unknown };
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400, corsHeaders);
    }

    const { questionId, answer } = body;
    if (!questionId || typeof questionId !== "string") {
      return errorResponse("questionId is required", 400, corsHeaders);
    }

    // Use service role to fetch the question (bypasses RLS; answer never sent back)
    const { data: question, error: qError } = await adminClient
      .from("quiz_questions")
      .select(
        "correct_answer, correct_answers, question_type, number_answer, number_tolerance, hotspot_regions, drag_items, drag_targets"
      )
      .eq("id", questionId)
      .is("deleted_at", null)
      .single();

    if (qError || !question) {
      return errorResponse("Question not found", 404, corsHeaders);
    }

    const isCorrect = isAnswerCorrect(question as unknown as GradableQuestion, answer);

    // SECURITY: Never return the correct answer or explanation in the response.
    // The client receives only a boolean result.
    return jsonResponse({ isCorrect }, 200, corsHeaders);
  } catch (_error) {
    // Generic error — never leak internal details
    return errorResponse("An unexpected error occurred", 500, corsHeaders);
  }
});
