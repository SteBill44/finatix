import { getCorsHeaders } from "../_shared/cors.ts";
import { createStripeClient, getActiveStripeEnv } from "../_shared/stripe.ts";
import { resolveCoursesForPrice } from "../_shared/catalogue.ts";

/**
 * Returns the real, provider-held details of a price so the order summary can
 * show the exact amount and billing terms the buyer is about to agree to,
 * rather than trusting a figure passed through the page address.
 */

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function cors(req: Request): Record<string, string> {
  return {
    ...getCorsHeaders(req),
    "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
  };
}

Deno.serve(async (req) => {
  const headers = { ...cors(req), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(req) });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const body = await req.json();
    const priceId = typeof body?.priceId === "string" ? body.priceId : "";
    if (!ID_PATTERN.test(priceId)) throw new Error("Invalid priceId");

    const stripe = createStripeClient(getActiveStripeEnv());
    const prices = await stripe.prices.list({ lookup_keys: [priceId], expand: ["data.product"] });
    const price = prices.data[0];

    if (!price || price.active === false) {
      return new Response(
        JSON.stringify({ available: false, priceId }),
        { status: 200, headers },
      );
    }

    const resolved = await resolveCoursesForPrice(priceId);
    const product: any = price.product;

    return new Response(
      JSON.stringify({
        available: true,
        priceId,
        amount: price.unit_amount != null ? price.unit_amount / 100 : null,
        currency: (price.currency ?? "gbp").toUpperCase(),
        billingType: price.type === "recurring" ? "subscription" : "one_time",
        interval: price.recurring?.interval ?? null,
        productName: typeof product === "object" ? product?.name ?? null : null,
        courseCount: resolved.courseIds.length,
        isMembership: resolved.isMembership,
      }),
      { status: 200, headers },
    );
  } catch (error) {
    console.error("payments-catalogue error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers },
    );
  }
});
