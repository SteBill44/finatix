import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Server-side view of the catalogue.
 *
 * What a price unlocks is decided here, never by the browser, so a buyer can
 * never pay for one module and claim access to another. Both the checkout
 * function and the webhook use this so the access granted always matches the
 * price that was actually paid.
 */

export interface ResolvedPurchase {
  courseIds: string[];
  isBundle: boolean;
  /** A short key stored on the payment so the webhook can resolve it again. */
  bundleKey: string | null;
  /** True when the price is a membership rather than a course purchase. */
  isMembership: boolean;
}

const MEMBERSHIP_PRICE_IDS = new Set(["all_access_monthly", "all_access_annual"]);

export async function resolveCoursesForPrice(priceId: string): Promise<ResolvedPurchase> {
  if (MEMBERSHIP_PRICE_IDS.has(priceId)) {
    return { courseIds: [], isBundle: false, bundleKey: null, isMembership: true };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase.from("courses").select("id, slug, level, price");
  if (error) throw new Error("Could not resolve course access");
  const courses = data ?? [];

  const bundleMatch = /^bundle_([a-z]+)_onetime$/.exec(priceId);
  if (bundleMatch) {
    const level = bundleMatch[1];
    return {
      courseIds: courses.filter((c: any) => c.level === level).map((c: any) => c.id),
      isBundle: true,
      bundleKey: priceId,
      isMembership: false,
    };
  }

  if (priceId === "complete_cima_bundle_onetime") {
    return {
      courseIds: courses.map((c: any) => c.id),
      isBundle: true,
      bundleKey: priceId,
      isMembership: false,
    };
  }

  const single = courses.find(
    (c: any) => `course_${String(c.slug).replace(/-/g, "_")}_onetime` === priceId,
  );
  if (single) {
    return { courseIds: [single.id], isBundle: false, bundleKey: null, isMembership: false };
  }

  return { courseIds: [], isBundle: false, bundleKey: null, isMembership: false };
}
