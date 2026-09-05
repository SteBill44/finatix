import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function grantCourseAccess(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  if (!userId || !courseId) {
    console.log("Session without userId/courseId metadata - nothing to grant");
    return;
  }

  const supabase = getSupabase();

  // Record the purchase (idempotent on the Stripe session id)
  const { error: purchaseError } = await supabase.from("course_purchases").upsert({
    user_id: userId,
    course_id: courseId,
    stripe_session_id: session.id,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    price_id: session.metadata?.priceId ?? null,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null,
    status: "paid",
    environment: env,
  }, { onConflict: "stripe_session_id" });

  if (purchaseError) console.error("Failed to record purchase:", purchaseError);

  // Enrol the student (ignore duplicates)
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!existing) {
    const { error: enrollError } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId });
    if (enrollError) console.error("Failed to enrol user:", enrollError);
  }

  // Let the student know
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "success",
    title: "You're enrolled",
    message: `Your payment was received and ${course?.title ?? "your course"} is now unlocked. Happy studying!`,
    data: { course_id: courseId },
  });
}

async function markPaymentFailed(session: any, env: StripeEnv) {
  const supabase = getSupabase();
  await supabase.from("course_purchases").upsert({
    user_id: session.metadata?.userId ?? null,
    course_id: session.metadata?.courseId ?? null,
    stripe_session_id: session.id,
    price_id: session.metadata?.priceId ?? null,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null,
    status: "failed",
    environment: env,
  }, { onConflict: "stripe_session_id" });
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status !== "unpaid") {
        await grantCourseAccess(session, env);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded":
      await grantCourseAccess(event.data.object, env);
      break;
    case "checkout.session.async_payment_failed":
      await markPaymentFailed(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook received with invalid or missing env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    await handleWebhook(req, rawEnv);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
