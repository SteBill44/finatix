import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "enrollment" | "completion" | "progress_reminder" | "badge_earned";
  userId: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, userId, data }: NotificationRequest = await req.json();

    // Check user's notification preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, first_name")
      .eq("user_id", userId)
      .single();

    const userName = profile?.first_name || profile?.full_name || "Student";

    // Check if we should send this notification type
    let shouldSend = true;
    if (preferences) {
      switch (type) {
        case "enrollment":
          shouldSend = preferences.enrollment_confirmation;
          break;
        case "completion":
          shouldSend = preferences.course_completion;
          break;
        case "progress_reminder":
          shouldSend = preferences.progress_reminders;
          break;
      }
    }

    if (!shouldSend) {
      console.log(`Notification of type ${type} skipped due to user preferences`);
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For now, log the notification - email sending requires RESEND_API_KEY
    console.log(`Notification queued:`, {
      type,
      userId,
      userName,
      data,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement email sending when RESEND_API_KEY is configured
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // await resend.emails.send({ ... });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification of type ${type} processed`,
        note: "Email sending requires RESEND_API_KEY configuration"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
