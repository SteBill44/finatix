import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { type StripeEnv, createStripeClient, getActiveStripeEnv } from "../_shared/stripe.ts";
import { resolveCoursesForPrice } from "../_shared/catalogue.ts";

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Checkout is intentionally available to signed-out visitors. Reflect the
// caller's origin here so Lovable preview URLs and the published domains can
// all complete the browser preflight without weakening authenticated APIs.
function getCheckoutCorsHeaders(req: Request): Record<string, string> {
  return {
    ...getCorsHeaders(req),
    "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
  };
}

// Only ever called for a verified signed-in user, so linking a Stripe customer
// to that account is safe. Guests never reach this path.
async function resolveOrCreateCustomerForUser(
  stripe: ReturnType<typeof createStripeClient>,
  userId: string,
  email?: string,
): Promise<string> {
  if (!ID_PATTERN.test(userId)) throw new Error("Invalid user");

  const found = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;

  if (email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0];
    // Never steal a customer that is already associated with another account.
    if (customer && !customer.metadata?.userId) {
      await stripe.customers.update(customer.id, {
        metadata: { ...customer.metadata, userId },
      });
      return customer.id;
    }
    if (customer && customer.metadata?.userId === userId) return customer.id;
  }

  const created = await stripe.customers.create({
    ...(email && { email }),
    metadata: { userId },
  });
  return created.id;
}

async function createCheckoutSession(options: {
  priceId: string;
  courseId?: string;
  courseIds?: string[];
  bundleLabel?: string;
  // Verified session identity, or undefined for guest checkout.
  userId?: string;
  userEmail?: string;
  // Unverified email typed by a guest: prefill only, never used to link.
  guestEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
}) {
  if (!ID_PATTERN.test(options.priceId)) throw new Error("Invalid priceId");
  const stripe = createStripeClient(options.environment);

  const prices = await stripe.prices.list({ lookup_keys: [options.priceId] });
  if (!prices.data.length) throw new Error("Price not found");
  const stripePrice = prices.data[0];
  const isRecurring = stripePrice.type === "recurring";

  const customerId = options.userId
    ? await resolveOrCreateCustomerForUser(stripe, options.userId, options.userEmail)
    : undefined;

  let productDescription: string | undefined;
  if (!isRecurring) {
    const productId = typeof stripePrice.product === "string"
      ? stripePrice.product
      : stripePrice.product.id;
    const product = await stripe.products.retrieve(productId);
    productDescription = product.name;
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: stripePrice.id, quantity: 1 }],
    mode: isRecurring ? "subscription" : "payment",
    ui_mode: "embedded_page",
    return_url: options.returnUrl,
    ...(customerId
      ? { customer: customerId }
      : options.guestEmail
      ? { customer_email: options.guestEmail }
      : {}),
    ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
    managed_payments: { enabled: true },
    metadata: {
      // Ownership is only stamped for a verified session. Guest purchases stay
      // unclaimed until the buyer proves the email is theirs by signing in.
      ...(options.userId && { userId: options.userId }),
      ...(options.courseId && { courseId: options.courseId }),
      ...(options.courseIds?.length && { courseIds: options.courseIds.join(",") }),
      ...(options.bundleLabel && { bundleLabel: options.bundleLabel }),
      priceId: options.priceId,
      managed_payments: "true",
    },
    ...(isRecurring && options.userId && {
      subscription_data: { metadata: { userId: options.userId } },
    }),
  } as any);

  return session.client_secret;
}

// Identity comes from the caller's session token, never from the request body.
async function getVerifiedUser(
  req: Request,
): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


Deno.serve(async (req) => {
  const cors = getCheckoutCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    // The payment environment is decided here, not by the browser, so a test
    // transaction can never be requested against production entitlements.
    const environment: StripeEnv = getActiveStripeEnv();
    if (typeof body?.priceId !== "string") throw new Error("Missing priceId");
    if (typeof body?.returnUrl !== "string") throw new Error("Missing returnUrl");

    // Access is derived from the price on the server; client-sent course IDs
    // are ignored on purpose.
    const resolved = await resolveCoursesForPrice(body.priceId);

    // Signed-in identity comes from the verified session only.
    const verifiedUser = await getVerifiedUser(req);
    const rawGuestEmail = typeof body.customerEmail === "string"
      ? body.customerEmail.trim().slice(0, 254)
      : undefined;
    const guestEmail = !verifiedUser && rawGuestEmail && EMAIL_PATTERN.test(rawGuestEmail)
      ? rawGuestEmail
      : undefined;

    const clientSecret = await createCheckoutSession({
      priceId: body.priceId,
      courseId: !resolved.isBundle ? resolved.courseIds[0] : undefined,
      courseIds: resolved.isBundle ? resolved.courseIds : undefined,
      bundleLabel: typeof body.bundleLabel === "string" ? body.bundleLabel.slice(0, 60) : undefined,
      userId: verifiedUser?.id,
      userEmail: verifiedUser?.email,
      guestEmail,
      returnUrl: body.returnUrl,
      environment,
    });


    return new Response(JSON.stringify({ clientSecret }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
