import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { evaluateSale } from "./saleReadiness.ts";
import { isAllowedReturnUrl } from "./returnUrl.ts";

const rows = [
  { course_id: "free", is_free: true, on_sale: false },
  { course_id: "ready", is_free: false, on_sale: true },
  { course_id: "empty", is_free: false, on_sale: false },
];

Deno.test("unavailable single course is refused", () => {
  assertEquals(evaluateSale(rows, ["empty"]).allowed, false);
});
Deno.test("approved course is allowed", () => {
  assertEquals(evaluateSale(rows, ["ready"]).allowed, true);
});
Deno.test("bundle containing an unavailable course is refused", () => {
  assertEquals(evaluateSale(rows, ["ready", "empty"]).allowed, false);
});
Deno.test("free courses never make a bundle sellable on their own", () => {
  assertEquals(evaluateSale(rows, ["free"]).allowed, false);
});
Deno.test("membership refused while any paid course is unavailable", () => {
  assertEquals(evaluateSale(rows, "all_paid").allowed, false);
});
Deno.test("unknown course fails closed", () => {
  assertEquals(evaluateSale(rows, ["ghost"]).allowed, false);
});
Deno.test("return URL allowlist", () => {
  assertEquals(isAllowedReturnUrl("https://finatix.io/checkout/return?session_id={CHECKOUT_SESSION_ID}"), true);
  assertEquals(isAllowedReturnUrl("https://id-preview--5702bce9-cae6-49fe-a331-a24217d805f0.lovable.app/checkout/return"), true);
  assertEquals(isAllowedReturnUrl("https://evil.example/checkout/return"), false);
  assertEquals(isAllowedReturnUrl("https://finatix.io.evil.com/checkout/return"), false);
  assertEquals(isAllowedReturnUrl("https://finatix.io/somewhere-else"), false);
  assertEquals(isAllowedReturnUrl("javascript:alert(1)"), false);
});
