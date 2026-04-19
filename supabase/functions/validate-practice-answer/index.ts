import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, corsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return corsResponse(req);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user via their own token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: 60 practice checks per minute, 300 per hour
    const { data: rateLimitResult, error: rateLimitError } = await userClient.rpc(
      "check_rate_limit",
      {
        p_user_id: user.id,
        p_action_type: "practice_answer",
        p_max_per_minute: 60,
        p_max_per_hour: 300,
      }
    );
    if (!rateLimitError && rateLimitResult && !rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfter || 60),
          },
        }
      );
    }

    // Parse and validate input
    let body: { questionId?: unknown; answer?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { questionId, answer } = body;
    if (!questionId || typeof questionId !== "string") {
      return new Response(JSON.stringify({ error: "questionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to fetch the question (bypasses RLS; answer never sent back)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: question, error: qError } = await adminClient
      .from("quiz_questions")
      .select(
        "correct_answer, correct_answers, question_type, number_answer, number_tolerance, hotspot_regions, drag_items, explanation"
      )
      .eq("id", questionId)
      .is("deleted_at", null)
      .single();

    if (qError || !question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    return new Response(
      JSON.stringify({ isCorrect }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_error) {
    // Generic error — never leak internal details
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
