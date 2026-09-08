import { createStripeClient } from "../_shared/stripe.ts";

Deno.serve(async () => {
  const stripe = createStripeClient("sandbox");
  const results: unknown[] = [];
  let starting_after: string | undefined;
  while (true) {
    const page = await stripe.prices.list({ limit: 100, ...(starting_after && { starting_after }) });
    for (const price of page.data) {
      if (price.active && price.tax_behavior !== "inclusive") {
        try {
          await stripe.prices.update(price.id, { tax_behavior: "inclusive" });
          results.push({ id: price.id, lookup_key: price.lookup_key, fixed: true });
        } catch (e) {
          results.push({ id: price.id, error: String(e) });
        }
      }
    }
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }
  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
