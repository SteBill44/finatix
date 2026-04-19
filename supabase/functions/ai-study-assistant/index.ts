import { getCorsHeaders, corsResponse } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";



serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return corsResponse(req);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check rate limit before processing
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      {
        p_user_id: user.id,
        p_action_type: "ai_chat",
        p_max_per_minute: 20,
        p_max_per_hour: 100,
      }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    } else if (rateLimitResult && !rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.retryAfter || 60;
      console.log(`Rate limit exceeded for user ${user.id}. Retry after ${retryAfter}s`);
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Please try again in ${retryAfter > 60 ? Math.ceil(retryAfter / 60) + " minutes" : retryAfter + " seconds"}.`,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const { messages, courseId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get course context if provided
    let courseContext = "";
    if (courseId) {
      const { data: course } = await supabase
        .from("courses")
        .select("title, description")
        .eq("id", courseId)
        .single();
      
      if (course) {
        courseContext = `The student is currently studying: ${course.title}. Course description: ${course.description || "N/A"}.`;
      }

      // Get recent lessons
      const { data: lessons } = await supabase
        .from("lessons")
        .select("title, description")
        .eq("course_id", courseId)
        .order("order_index")
        .limit(10);
      
      if (lessons && lessons.length > 0) {
        courseContext += ` The course includes these lessons: ${lessons.map(l => l.title).join(", ")}.`;
      }
    }

    const systemPrompt = `You are an expert CIMA (Chartered Institute of Management Accountants) study assistant. You help students prepare for their CIMA exams by:

1. Explaining complex accounting and finance concepts in simple terms
2. Providing exam tips and study strategies
3. Helping with practice questions and case studies
4. Clarifying syllabus topics and learning outcomes
5. Offering motivation and encouragement

${courseContext}

Be concise, accurate, and encouraging. Use examples where helpful. If you don't know something, say so rather than guessing. Focus on helping the student understand and apply concepts.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service temporarily unavailable");
    }

    // Store user message in chat history
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      await supabase.from("ai_chat_messages").insert({
        user_id: user.id,
        course_id: courseId || null,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI study assistant error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
