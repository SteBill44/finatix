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

function priceFromItem(item: any): { priceId: string | null; productId: string | null } {
  const price = item?.price;
  return {
    priceId: price?.lookup_key ?? price?.metadata?.lovable_external_id ?? price?.id ?? null,
    productId: typeof price?.product === "string" ? price.product : price?.product?.id ?? null,
  };
}

function isoFromUnix(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }
  const item = subscription.items?.data?.[0];
  const { priceId, productId } = priceFromItem(item);
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  const { error } = await getSupabase().from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id,
    product_id: productId,
    price_id: priceId,
    status: subscription.status,
    current_period_start: isoFromUnix(periodStart),
    current_period_end: isoFromUnix(periodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  if (error) console.error("Failed to save subscription:", error);
}

async function markSubscriptionCanceled(subscription: any, env: StripeEnv) {
  // Access continues until current_period_end (checked in the app)
  const item = subscription.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  await getSupabase()
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: isoFromUnix(periodEnd),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
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
    case "customer.subscription.created":
    case "customer.subscription.updated":
      // Covers new memberships plus upgrades/downgrades (price change)
      await upsertSubscription(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await markSubscriptionCanceled(event.data.object, env);
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
