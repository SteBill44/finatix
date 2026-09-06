import { createStripeClient } from "../_shared/stripe.ts";

// Temporary maintenance endpoint: inspects prices and makes them tax-inclusive.
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const apply = url.searchParams.get("apply") === "1";
    const stripe = createStripeClient("sandbox");

    const prices = await stripe.prices.list({ limit: 100, active: true, expand: ["data.product"] });
    const report: any[] = [];

    for (const price of prices.data) {
      const entry: any = {
        id: price.id,
        lookup_key: price.lookup_key,
        currency: price.currency,
        amount: price.unit_amount,
        tax_behavior: price.tax_behavior,
        type: price.type,
      };

      if (apply && price.tax_behavior !== "inclusive") {
        if (price.tax_behavior === "unspecified") {
          const updated = await stripe.prices.update(price.id, { tax_behavior: "inclusive" });
          entry.action = "updated";
          entry.tax_behavior = updated.tax_behavior;
        } else {
          const productId = typeof price.product === "string" ? price.product : (price.product as any).id;
          const lookupKey = price.lookup_key;
          const created = await stripe.prices.create({
            product: productId,
            currency: price.currency,
            unit_amount: price.unit_amount!,
            tax_behavior: "inclusive",
            nickname: price.nickname ?? undefined,
            ...(price.recurring && {
              recurring: { interval: price.recurring.interval, interval_count: price.recurring.interval_count },
            }),
            ...(lookupKey && { lookup_key: lookupKey, transfer_lookup_key: true }),
            metadata: price.metadata,
          });
          await stripe.prices.update(price.id, { active: false });
          entry.action = "recreated";
          entry.new_id = created.id;
        }
      }
      report.push(entry);
    }

    return new Response(JSON.stringify({ apply, report }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
