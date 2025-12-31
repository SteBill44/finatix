import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const { courseId } = await req.json();
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    // Check if user has completed the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*, courses(*)")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new Error("Enrollment not found");
    }

    if (!enrollment.completed_at) {
      throw new Error("Course not completed yet");
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (existingCert) {
      return new Response(JSON.stringify({ certificate: existingCert }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, first_name, last_name")
      .eq("user_id", user.id)
      .single();

    const userName = profile?.full_name || 
      `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || 
      "Student";

    // Generate certificate number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateNumber = `CIMA-${timestamp}-${random}`;

    // Create certificate record
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (certError) {
      console.error("Certificate creation error:", certError);
      throw new Error("Failed to create certificate");
    }

    console.log(`Certificate ${certificateNumber} generated for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        certificate,
        userName,
        courseName: enrollment.courses?.title || "Course",
        completedAt: enrollment.completed_at
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating certificate:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
