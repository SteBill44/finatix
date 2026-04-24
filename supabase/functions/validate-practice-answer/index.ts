import { getCorsHeaders, corsResponse } from "../_shared/cors.ts";
import { authenticate, isAuthFailure } from "../_shared/auth.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { errorResponse, jsonResponse } from "../_shared/response.ts";

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
        "correct_answer, correct_answers, question_type, number_answer, number_tolerance, hotspot_regions, drag_items, explanation"
      )
      .eq("id", questionId)
      .is("deleted_at", null)
      .single();

    if (qError || !question) {
      return errorResponse("Question not found", 404, corsHeaders);
    }

    let isCorrect = false;

    switch (question.question_type) {
      case "multiple_choice":
        isCorrect = answer === question.correct_answer;
        break;

      case "multiple_response": {
        const correctAnswers = (question.correct_answers as number[]) || [];
        const selected = answer as number[];
        if (Array.isArray(selected) && selected.length === correctAnswers.length) {
          isCorrect =
            correctAnswers.every((a) => selected.includes(a)) &&
            selected.every((a) => correctAnswers.includes(a));
        }
        break;
      }

      case "number_entry": {
        const numAnswer = parseFloat(answer as string);
        if (!isNaN(numAnswer)) {
          const correctNum = (question.number_answer as number) || 0;
          const tolerance = (question.number_tolerance as number) || 0;
          isCorrect = Math.abs(numAnswer - correctNum) <= tolerance;
        }
        break;
      }

      case "hotspot": {
        const regions = (question.hotspot_regions as Array<{ id: string; isCorrect: boolean }>) || [];
        const selectedRegion = regions.find((r) => r.id === answer);
        isCorrect = selectedRegion?.isCorrect ?? false;
        break;
      }

      case "drag_drop": {
        const dragItems = (question.drag_items as Array<{ id: string; correctPosition: number }>) || [];
        const orderedIds = answer as string[];
        if (Array.isArray(orderedIds)) {
          isCorrect = dragItems.every(
            (item) => orderedIds.indexOf(item.id) === item.correctPosition
          );
        }
        break;
      }

      default:
        isCorrect = answer === question.correct_answer;
    }

    // SECURITY: Never return the correct answer or explanation in the response.
    // The client receives only a boolean result.
    return jsonResponse({ isCorrect }, 200, corsHeaders);
  } catch (_error) {
    // Generic error — never leak internal details
    return errorResponse("An unexpected error occurred", 500, corsHeaders);
  }
});
