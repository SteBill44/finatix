import { describe, expect, it } from "vitest";
import {
  COMPLETE_BUNDLE,
  COURSE_PRICE_IDS,
  LEVEL_BUNDLE_PRICE,
  LEVEL_BUNDLE_PRICE_IDS,
  MEMBERSHIP_ANNUAL,
  MEMBERSHIP_MONTHLY,
  MEMBERSHIP_PRODUCTS,
  PLAN_PRODUCTS,
  POLICY,
  SINGLE_MODULE_PLAN,
  SINGLE_MODULE_PRICE,
  billingSummary,
  formatPrice,
  getCoursePriceId,
  getLevelBundlePriceId,
} from "./catalogue";

/**
 * These tests guard the purchase journey: a CTA must always reach the price,
 * billing period and access duration it advertises. Historic bugs here sent a
 * £199 one-off CTA to a £49/month subscription and a £999 lifetime CTA to a
 * £399/year subscription.
 */
describe("product catalogue", () => {
  it("advertises the agreed prices", () => {
    expect(SINGLE_MODULE_PRICE).toBe(199);
    expect(LEVEL_BUNDLE_PRICE).toBe(499);
    expect(COMPLETE_BUNDLE.price).toBe(999);
    expect(MEMBERSHIP_MONTHLY.price).toBe(49);
    expect(MEMBERSHIP_ANNUAL.price).toBe(399);
  });

  it("never mixes up one-off purchases and subscriptions", () => {
    expect(COMPLETE_BUNDLE.billingType).toBe("one_time");
    expect(COMPLETE_BUNDLE.interval).toBeUndefined();
    expect(SINGLE_MODULE_PLAN.billingType).toBe("one_time");
    expect(MEMBERSHIP_MONTHLY.billingType).toBe("subscription");
    expect(MEMBERSHIP_MONTHLY.interval).toBe("month");
    expect(MEMBERSHIP_ANNUAL.billingType).toBe("subscription");
    expect(MEMBERSHIP_ANNUAL.interval).toBe("year");
  });

  it("gives every product a distinct price identifier", () => {
    const products = new Map(
      [...PLAN_PRODUCTS, ...MEMBERSHIP_PRODUCTS].map((p) => [p.id, p]),
    );
    const ids = [
      ...[...products.values()].map((p) => p.priceId),
      ...Object.values(LEVEL_BUNDLE_PRICE_IDS),
      ...Object.values(COURSE_PRICE_IDS),
    ].filter((id): id is string => Boolean(id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only offers a purchase action when a price is configured", () => {
    // Single Module is deliberately price-less: the buyer picks a module first.
    expect(SINGLE_MODULE_PLAN.priceId).toBeNull();
    expect(MEMBERSHIP_MONTHLY.priceId).toBeTruthy();
    expect(MEMBERSHIP_ANNUAL.priceId).toBeTruthy();
    expect(COMPLETE_BUNDLE.priceId).toBeTruthy();
  });

  it("matches the server-side price naming convention exactly", () => {
    // The edge function resolves a single-course price as
    // `course_<slug with underscores>_onetime`. If these drift, a paid
    // checkout resolves to no course and the buyer gets nothing.
    for (const [slug, priceId] of Object.entries(COURSE_PRICE_IDS)) {
      expect(priceId).toBe(`course_${slug.replace(/-/g, "_")}_onetime`);
    }
    for (const [level, priceId] of Object.entries(LEVEL_BUNDLE_PRICE_IDS)) {
      expect(priceId).toBe(`bundle_${level}_onetime`);
    }
  });

  it("covers all twelve paid modules and no free ones", () => {
    const slugs = Object.keys(COURSE_PRICE_IDS);
    expect(slugs).toHaveLength(12);
    expect(slugs.some((s) => s.startsWith("ba"))).toBe(false);
  });

  it("resolves price identifiers case-insensitively for levels", () => {
    expect(getLevelBundlePriceId("Operational")).toBe("bundle_operational_onetime");
    expect(getLevelBundlePriceId("certificate")).toBeUndefined();
    expect(getLevelBundlePriceId(null)).toBeUndefined();
    expect(getCoursePriceId("e1-managing-finance")).toBe("course_e1_managing_finance_onetime");
    expect(getCoursePriceId("not-a-course")).toBeUndefined();
    expect(getCoursePriceId(undefined)).toBeUndefined();
  });

  it("states renewal terms honestly in the order summary", () => {
    expect(billingSummary(COMPLETE_BUNDLE)).toMatch(/no renewal/i);
    expect(billingSummary(MEMBERSHIP_MONTHLY)).toMatch(/every month/i);
    expect(billingSummary(MEMBERSHIP_ANNUAL)).toMatch(/every year/i);
  });

  it("quotes one refund policy everywhere", () => {
    for (const product of [...PLAN_PRODUCTS, ...MEMBERSHIP_PRODUCTS]) {
      expect(product.refundDays).toBe(POLICY.refundDays);
    }
    expect(POLICY.refundText).toContain(String(POLICY.refundDays));
  });

  it("formats prices in pounds", () => {
    expect(formatPrice(199)).toBe("£199");
    expect(formatPrice(49.5)).toBe("£49.50");
  });

  it("does not advertise unverified content volumes", () => {
    const claims = [...PLAN_PRODUCTS, ...MEMBERSHIP_PRODUCTS]
      .flatMap((p) => p.features.map((f) => f.text))
      .join(" | ");
    expect(claims).not.toMatch(/\d+\s*\+?\s*(hours|practice questions)/i);
    expect(claims).not.toMatch(/24\/7/);
  });
});
