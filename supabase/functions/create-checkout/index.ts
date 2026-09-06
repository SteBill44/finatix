import { getCorsHeaders } from "../_shared/cors.ts";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

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

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !ID_PATTERN.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

async function createCheckoutSession(options: {
  priceId: string;
  courseId?: string;
  customerEmail?: string;
  userId?: string;
  returnUrl: string;
  environment: StripeEnv;
}) {
  if (!ID_PATTERN.test(options.priceId)) throw new Error("Invalid priceId");
  const stripe = createStripeClient(options.environment);

  const prices = await stripe.prices.list({ lookup_keys: [options.priceId] });
  if (!prices.data.length) throw new Error("Price not found");
  const stripePrice = prices.data[0];
  const isRecurring = stripePrice.type === "recurring";

  const customerId = (options.customerEmail || options.userId)
    ? await resolveOrCreateCustomer(stripe, {
      email: options.customerEmail,
      userId: options.userId,
    })
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
    // Match the site's theme: white card, charcoal text, orange accents.
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#E84F02",
        colorBackground: "#FFFFFF",
        colorText: "#1A1A1A",
        colorDanger: "#DC2626",
        borderRadius: "10px",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": { border: "1px solid #E3DEDA" },
        ".Input:focus": {
          border: "1px solid #E84F02",
          boxShadow: "0 0 0 3px rgba(232, 79, 2, 0.15)",
        },
        ".Label": { fontWeight: "600", color: "#1A1A1A" },
      },
    },
    ...(customerId && { customer: customerId }),
    ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
    managed_payments: { enabled: true },
    metadata: {
      ...(options.userId && { userId: options.userId }),
      ...(options.courseId && { courseId: options.courseId }),
      priceId: options.priceId,
      managed_payments: "true",
    },
    ...(isRecurring && options.userId && {
      subscription_data: { metadata: { userId: options.userId } },
    }),
  } as any);

  return session.client_secret;
}

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
    const environment = body?.environment;
    if (environment !== "sandbox" && environment !== "live") {
      throw new Error("Invalid environment");
    }
    if (typeof body?.priceId !== "string") throw new Error("Missing priceId");
    if (typeof body?.returnUrl !== "string") throw new Error("Missing returnUrl");

    const clientSecret = await createCheckoutSession({
      priceId: body.priceId,
      courseId: typeof body.courseId === "string" ? body.courseId : undefined,
      customerEmail: typeof body.customerEmail === "string" ? body.customerEmail : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
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
