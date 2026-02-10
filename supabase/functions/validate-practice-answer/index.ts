import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { questionId, answer } = await req.json();

    if (!questionId) {
      return new Response(JSON.stringify({ error: "questionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the question with correct answer from the server
    const { data: question, error: qError } = await supabase
      .from("quiz_questions")
      .select("correct_answer, correct_answers, question_type, number_answer, number_tolerance, hotspot_regions, drag_items, explanation")
      .eq("id", questionId)
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
        const selectedAnswers = answer as number[];
        if (Array.isArray(selectedAnswers) && selectedAnswers.length === correctAnswers.length) {
          isCorrect = correctAnswers.every((a: number) => selectedAnswers.includes(a)) &&
                      selectedAnswers.every((a: number) => correctAnswers.includes(a));
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
        const regions = (question.hotspot_regions as any[]) || [];
        const selectedRegion = regions.find((r: any) => r.id === answer);
        isCorrect = selectedRegion?.isCorrect || false;
        break;
      }

      case "drag_drop": {
        const dragItems = (question.drag_items as any[]) || [];
        const orderedIds = answer as string[];
        if (Array.isArray(orderedIds)) {
          isCorrect = dragItems.every((item: any, index: number) => {
            const answerIndex = orderedIds.indexOf(item.id);
            return item.correctPosition === answerIndex;
          });
        }
        break;
      }

      default:
        isCorrect = answer === question.correct_answer;
    }

    return new Response(
      JSON.stringify({
        isCorrect,
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
