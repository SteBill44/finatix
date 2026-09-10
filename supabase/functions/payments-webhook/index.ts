import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, getActiveStripeEnv, verifyWebhook } from "../_shared/stripe.ts";
import { resolveCoursesForPrice } from "../_shared/catalogue.ts";

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

// Any database failure below must bubble up so the handler can answer with a
// retryable status instead of silently swallowing a paid-but-unfulfilled order.
function must<T>(result: { data: T; error: any }, context: string): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message ?? result.error}`);
  }
  return result.data;
}

function stringId(value: any): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : (value.id ?? null);
}

async function grantCourseAccess(session: any, env: StripeEnv) {
  const paidPriceId: string | null = session.metadata?.priceId ?? null;

  // What was paid for decides what is unlocked. The course list is worked out
  // here from the price, not taken from the browser or from a metadata list.
  let courseIds: string[] = [];
  let isBundle = false;
  if (paidPriceId) {
    const resolved = await resolveCoursesForPrice(paidPriceId);
    courseIds = resolved.courseIds;
    isBundle = resolved.isBundle;
  }

  // Older sessions (created before the price-based resolution) carried the
  // course IDs in metadata. Honour those so historical orders still fulfil.
  if (!courseIds.length) {
    const legacyIds: string[] = (session.metadata?.courseIds ?? "")
      .split(",")
      .map((id: string) => id.trim())
      .filter(Boolean);
    const singleId = session.metadata?.courseId;
    courseIds = legacyIds.length ? legacyIds : (singleId ? [singleId] : []);
    isBundle = legacyIds.length > 1;
  }

  const email = session.customer_details?.email ?? session.customer_email ?? null;
  let userId: string | null = session.metadata?.userId ?? null;

  if (!courseIds.length) {
    console.log("Session without course metadata - nothing to grant");
    return;
  }

  const supabase = getSupabase();

  // Guest checkout: try to match an existing account by email
  if (!userId && email) {
    const matchedId = must(
      await supabase.rpc("find_user_id_by_email", { p_email: email }),
      "Email lookup failed",
    );
    if (matchedId) userId = matchedId as string;
  }

  // Test-mode transactions are recorded for reference but never turned into
  // real access once the site is running live payments.
  const sameEnv = env === getActiveStripeEnv();
  const grantAccess = Boolean(userId) && sameEnv;

  // One transactional call: purchase rows (with the order total and each
  // course's share of it), enrolments and the notification succeed together.
  must(
    await supabase.rpc("fulfill_course_purchase", {
      p_session_id: session.id,
      p_environment: env,
      p_user_id: userId,
      p_email: email,
      p_customer_id: stringId(session.customer),
      p_price_id: session.metadata?.priceId ?? null,
      p_course_ids: courseIds,
      p_order_total: session.amount_total ?? null,
      p_currency: session.currency ?? null,
      p_bundle_label: isBundle ? (session.metadata?.bundleLabel ?? null) : null,
      p_payment_intent_id: stringId(session.payment_intent),
      p_grant_access: grantAccess,
    }),
    "Fulfilment failed",
  );

  if (!userId) {
    console.log("Guest purchase recorded - will be claimed when the account is created");
  } else if (!sameEnv) {
    console.log(`Purchase in ${env} mode recorded but not granted - site runs ${getActiveStripeEnv()}`);
  }
}

async function markPaymentFailed(session: any, env: StripeEnv) {
  must(
    await getSupabase().from("course_purchases").upsert({
      user_id: session.metadata?.userId ?? null,
      course_id: session.metadata?.courseId ?? null,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      stripe_session_id: session.id,
      price_id: session.metadata?.priceId ?? null,
      amount_total: session.amount_total ?? null,
      order_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      status: "failed",
      environment: env,
      payment_intent_id: stringId(session.payment_intent),
    }, { onConflict: "stripe_session_id" }),
    "Failed to record failed payment",
  );
}

async function revokeAccess(env: StripeEnv, status: "refunded" | "disputed", paymentIntentId: string | null) {
  if (!paymentIntentId) {
    console.log("No payment intent on event - nothing to revoke");
    return;
  }
  const affected = must(
    await getSupabase().rpc("revoke_purchase_access", {
      p_environment: env,
      p_new_status: status,
      p_session_id: null,
      p_payment_intent_id: paymentIntentId,
    }),
    `Failed to mark purchase ${status}`,
  );
  console.log(`${status}: updated ${affected} purchase row(s)`);
}

async function restoreAccess(env: StripeEnv, paymentIntentId: string | null) {
  if (!paymentIntentId) return;
  const affected = must(
    await getSupabase().rpc("restore_purchase_access", {
      p_environment: env,
      p_session_id: null,
      p_payment_intent_id: paymentIntentId,
    }),
    "Failed to restore purchase access",
  );
  console.log(`dispute won: restored ${affected} purchase row(s)`);
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
  let userId: string | null = subscription.metadata?.userId ?? null;
  let email: string | null = null;

  // Guest checkout: no userId metadata - resolve the customer email and try
  // to match an existing account, otherwise store the email so the
  // membership can be claimed when the account is created.
  const customerId = stringId(subscription.customer);
  if (customerId) {
    try {
      const stripe = createStripeClient(env);
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !(customer as any).deleted) {
        email = (customer as any).email ?? null;
      }
    } catch (e) {
      console.error("Failed to retrieve customer:", e);
    }
  }

  if (!userId && email) {
    const matchedId = must(
      await getSupabase().rpc("find_user_id_by_email", { p_email: email }),
      "Email lookup failed",
    );
    if (matchedId) userId = matchedId as string;
  }

  const item = subscription.items?.data?.[0];
  const { priceId, productId } = priceFromItem(item);
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  must(
    await getSupabase().from("subscriptions").upsert({
      user_id: userId,
      customer_email: email,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: isoFromUnix(periodStart),
      current_period_end: isoFromUnix(periodEnd),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      environment: env,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" }),
    "Failed to save subscription",
  );
}

async function markSubscriptionCanceled(subscription: any, env: StripeEnv) {
  // Access continues until current_period_end (checked in the app)
  const item = subscription.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  must(
    await getSupabase()
      .from("subscriptions")
      .update({
        status: "canceled",
        current_period_end: isoFromUnix(periodEnd),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)
      .eq("environment", env),
    "Failed to cancel subscription",
  );
}

// Keep the database in step with the server's payment mode so access checks
// there only count entitlements from the same mode.
async function syncActiveEnvironment() {
  must(
    await getSupabase().from("site_settings").upsert(
      { key: "payments_environment", value: getActiveStripeEnv() },
      { onConflict: "key" },
    ),
    "Failed to sync payments environment",
  );
}

async function processEvent(event: { type: string; data: { object: any } }, env: StripeEnv) {
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
    case "charge.refunded": {
      const charge = event.data.object;
      // Partial refunds keep access; a full refund removes it.
      if (charge.refunded || charge.amount_refunded >= charge.amount) {
        await revokeAccess(env, "refunded", stringId(charge.payment_intent));
      } else {
        console.log("Partial refund - access kept");
      }
      break;
    }
    case "charge.dispute.created":
      await revokeAccess(env, "disputed", stringId(event.data.object.payment_intent));
      break;
    case "charge.dispute.closed": {
      const dispute = event.data.object;
      if (dispute.status === "won") {
        await restoreAccess(env, stringId(dispute.payment_intent));
      } else {
        await revokeAccess(env, "refunded", stringId(dispute.payment_intent));
      }
      break;
    }
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
  const env: StripeEnv = rawEnv;

  let event: { id: string; type: string; data: { object: any } };
  try {
    event = await verifyWebhook(req, env);
  } catch (e) {
    console.error("Signature verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await syncActiveEnvironment();

    // Persist the event and skip anything already fulfilled (Stripe retries
    // and can deliver the same event more than once).
    const shouldProcess = must(
      await getSupabase().rpc("claim_payment_event", {
        p_event_id: event.id,
        p_event_type: event.type,
        p_environment: env,
        p_payload: event as unknown as Record<string, unknown>,
      }),
      "Failed to record payment event",
    );

    if (!shouldProcess) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await processEvent(event, env);

    must(
      await getSupabase().rpc("complete_payment_event", { p_event_id: event.id }),
      "Failed to close payment event",
    );

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Webhook processing failed:", message);
    try {
      await getSupabase().rpc("fail_payment_event", { p_event_id: event.id, p_error: message });
    } catch (logError) {
      console.error("Could not record the failure:", logError);
    }
    // 500 tells Stripe to retry delivery so a paid order is never left unfulfilled.
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
