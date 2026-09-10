/**
 * The single source of truth for everything Finatix sells.
 *
 * Pricing, course pages, checkout and the order summary all read from here so
 * a button can never open a different product than the one it advertises.
 * The amounts below are what we advertise; the amount actually charged is
 * always the one held by the payment provider against the same price ID and is
 * re-checked on the checkout page before payment.
 */

export type BillingType = "one_time" | "subscription";

export interface CatalogueFeature {
  text: string;
  included: boolean;
}

export interface CatalogueProduct {
  /** Stable product key used in our own code and links. */
  id: string;
  /** Price ID held by the payment provider. Null means "not on sale yet". */
  priceId: string | null;
  name: string;
  description: string;
  /** Advertised price in pounds. Null for "contact us" products. */
  price: number | null;
  currency: "GBP";
  billingType: BillingType;
  /** Only set for subscriptions. */
  interval?: "month" | "year";
  /** Plain-English description of how long access lasts. */
  accessDuration: string;
  /** What the buyer gets access to. */
  includes: string;
  features: CatalogueFeature[];
  support: string;
  refundDays: number;
}

/** Commercial policies. Every page must quote these, never its own numbers. */
export const POLICY = {
  refundDays: 30,
  refundText: "30-day money-back guarantee on all plans",
  supportHours: "Monday to Friday, 9am to 5pm",
  standardSupport: "Community support",
  prioritySupport: "Priority support (Monday to Friday, 9am to 5pm)",
} as const;

const COMMON_FEATURES = {
  analytics: "Competency tracking and analytics",
  mobile: "Mobile app access",
};

export const MEMBERSHIP_MONTHLY: CatalogueProduct = {
  id: "membership_monthly",
  priceId: "all_access_monthly",
  name: "Monthly Access",
  description: "Flexible monthly access to all CIMA content",
  price: 49,
  currency: "GBP",
  billingType: "subscription",
  interval: "month",
  accessDuration: "For as long as your membership is active. Cancel any time.",
  includes: "Every CIMA course on Finatix",
  features: [
    { text: "All CIMA modules", included: true },
    { text: "Every lesson in all 16 CIMA modules", included: true },
    { text: "Practice quizzes and timed mock exams for every module", included: true },
    { text: "Unlimited mock exams", included: true },
    { text: "Full analytics suite", included: true },
    { text: COMMON_FEATURES.mobile, included: true },
    { text: "Downloadable resources", included: true },
    { text: POLICY.standardSupport, included: true },
    { text: POLICY.prioritySupport, included: false },
  ],
  support: POLICY.standardSupport,
  refundDays: POLICY.refundDays,
};

export const MEMBERSHIP_ANNUAL: CatalogueProduct = {
  id: "membership_annual",
  priceId: "all_access_annual",
  name: "Annual Access",
  description: "All CIMA content for a year, at a lower monthly rate",
  price: 399,
  currency: "GBP",
  billingType: "subscription",
  interval: "year",
  accessDuration: "For as long as your membership is active. Cancel any time.",
  includes: "Every CIMA course on Finatix",
  features: [
    { text: "Everything in Monthly", included: true },
    { text: "Unlimited mock exams", included: true },
    { text: "Downloadable resources", included: true },
    { text: "Certificate of completion", included: true },
    { text: "Early access to new content", included: true },
    { text: POLICY.prioritySupport, included: true },
  ],
  support: POLICY.prioritySupport,
  refundDays: POLICY.refundDays,
};

export const COMPLETE_BUNDLE: CatalogueProduct = {
  id: "complete_bundle",
  priceId: "complete_cima_bundle_onetime",
  name: "Unlimited Bundle",
  description: "Everything you need to become CIMA qualified",
  price: 999,
  currency: "GBP",
  billingType: "one_time",
  accessDuration: "Lifetime access - one payment, no renewals",
  includes: "Every CIMA course on Finatix",
  features: [
    { text: "All CIMA modules", included: true },
    { text: "Every lesson in all 16 CIMA modules", included: true },
    { text: "Practice quizzes and timed mock exams for every module", included: true },
    { text: "Unlimited mock exams", included: true },
    { text: "Full analytics suite", included: true },
    { text: COMMON_FEATURES.mobile, included: true },
    { text: "Downloadable resources", included: true },
    { text: POLICY.prioritySupport, included: true },
  ],
  support: POLICY.prioritySupport,
  refundDays: POLICY.refundDays,
};

/** Advertised price of any single paid module. */
export const SINGLE_MODULE_PRICE = 199;

/** The Single Module plan card. It has no price ID: the buyer picks a module. */
export const SINGLE_MODULE_PLAN: CatalogueProduct = {
  id: "single_module",
  priceId: null,
  name: "Single Module",
  description: "Perfect for focusing on one exam at a time",
  price: SINGLE_MODULE_PRICE,
  currency: "GBP",
  billingType: "one_time",
  accessDuration: "Lifetime access to that module - one payment, no renewals",
  includes: "One module of your choice",
  features: [
    { text: "One module of your choice", included: true },
    { text: "Every lesson in that module", included: true },
    { text: "Practice quizzes and timed mock exams for that module", included: true },
    { text: "Automatic marking with per-question explanations", included: true },
    { text: COMMON_FEATURES.analytics, included: true },
    { text: COMMON_FEATURES.mobile, included: true },
    { text: POLICY.standardSupport, included: true },
    { text: "1-on-1 tutor sessions", included: false },
    { text: POLICY.prioritySupport, included: false },
  ],
  support: POLICY.standardSupport,
  refundDays: POLICY.refundDays,
};

/** Advertised price of any single level bundle. */
export const LEVEL_BUNDLE_PRICE = 499;

export const LEVEL_BUNDLE_PRICE_IDS: Record<string, string> = {
  operational: "bundle_operational_onetime",
  management: "bundle_management_onetime",
  strategic: "bundle_strategic_onetime",
};

export const LEVEL_NAMES: Record<string, string> = {
  certificate: "Certificate Level (Entry Level)",
  operational: "Operational Level",
  management: "Management Level",
  strategic: "Strategic Level",
};

/** Price ID for each paid course, keyed by its slug. */
export const COURSE_PRICE_IDS: Record<string, string> = {
  "e1-managing-finance": "course_e1_managing_finance_onetime",
  "f1-financial-reporting": "course_f1_financial_reporting_onetime",
  "p1-management-accounting": "course_p1_management_accounting_onetime",
  "ocs-operational-case-study": "course_ocs_operational_case_study_onetime",
  "e2-managing-performance": "course_e2_managing_performance_onetime",
  "f2-advanced-financial-reporting": "course_f2_advanced_financial_reporting_onetime",
  "p2-advanced-management-accounting": "course_p2_advanced_management_accounting_onetime",
  "mcs-management-case-study": "course_mcs_management_case_study_onetime",
  "e3-strategic-management": "course_e3_strategic_management_onetime",
  "f3-financial-strategy": "course_f3_financial_strategy_onetime",
  "p3-risk-management": "course_p3_risk_management_onetime",
  "scs-strategic-case-study": "course_scs_strategic_case_study_onetime",
};

export function getCoursePriceId(slug?: string | null): string | undefined {
  if (!slug) return undefined;
  return COURSE_PRICE_IDS[slug];
}

export function getLevelBundlePriceId(level?: string | null): string | undefined {
  if (!level) return undefined;
  return LEVEL_BUNDLE_PRICE_IDS[level.toLowerCase()];
}

/** Every product that can be bought directly from a plan card. */
export const PLAN_PRODUCTS: CatalogueProduct[] = [
  SINGLE_MODULE_PLAN,
  MEMBERSHIP_MONTHLY,
  COMPLETE_BUNDLE,
];

export const MEMBERSHIP_PRODUCTS: CatalogueProduct[] = [
  MEMBERSHIP_MONTHLY,
  MEMBERSHIP_ANNUAL,
];

/** Human wording for how a product is billed, used in order summaries. */
export function billingSummary(product: {
  billingType: BillingType;
  interval?: "month" | "year";
  price: number | null;
}): string {
  if (product.billingType === "one_time") {
    return "One-time payment - no renewal, no subscription";
  }
  const every = product.interval === "year" ? "every year" : "every month";
  return `Renews automatically ${every} until you cancel`;
}

export function formatPrice(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
