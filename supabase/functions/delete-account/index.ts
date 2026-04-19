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
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: account deletion is extremely sensitive — max 3 per hour
    const { data: rateLimitResult, error: rateLimitError } = await userClient.rpc(
      "check_rate_limit",
      {
        p_user_id: user.id,
        p_action_type: "delete_account",
        p_max_per_minute: 1,
        p_max_per_hour: 3,
      }
    );
    if (!rateLimitError && rateLimitResult && !rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "3600",
          },
        }
      );
    }

    console.log(`Deleting account for user: ${user.id}`);

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const tablesToClean = [
      "ai_chat_messages",
      "certificates",
      "course_reviews",
      "discussion_posts",
      "discussion_votes",
      "enrollments",
      "lesson_progress",
      "notification_preferences",
      "notifications",
      "profiles",
      "quiz_attempts",
      "study_sessions",
      "user_badges",
      "user_learning_paths",
      "user_roles",
      "user_streaks",
    ];

    for (const table of tablesToClean) {
      const { error: deleteError } = await adminClient
        .from(table)
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.warn(`Warning: Could not delete from ${table}:`, deleteError.message);
      }
    }

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error("Failed to delete auth user:", authDeleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
