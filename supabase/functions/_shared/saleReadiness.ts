import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Server-side sale gate. A paid course can only be bought when it has explicit
 * editorial approval AND meets the content prerequisites (see the
 * get_course_content_status database function). Bundles and memberships are
 * refused if any paid course they include is not on sale.
 * Existing purchases and access are never touched by this check.
 */
export interface SaleCheck {
  allowed: boolean;
  unavailableCourseIds: string[];
}

export function evaluateSale(
  rows: { course_id: string; is_free: boolean; on_sale: boolean }[],
  courseIds: string[] | "all_paid",
): SaleCheck {
  const scope = courseIds === "all_paid"
    ? rows.filter((r) => !r.is_free)
    : rows.filter((r) => courseIds.includes(r.course_id));
  if (courseIds !== "all_paid" && scope.length !== courseIds.length) {
    // Unknown course in the request: fail closed.
    return { allowed: false, unavailableCourseIds: courseIds.filter((id) => !rows.some((r) => r.course_id === id)) };
  }
  const paid = scope.filter((r) => !r.is_free);
  const unavailable = paid.filter((r) => !r.on_sale).map((r) => r.course_id);
  return { allowed: paid.length > 0 && unavailable.length === 0, unavailableCourseIds: unavailable };
}

export async function checkSaleReadiness(courseIds: string[] | "all_paid"): Promise<SaleCheck> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase.rpc("get_course_content_status");
  if (error || !data) throw new Error("Could not check course availability");
  return evaluateSale(data as any[], courseIds);
}
