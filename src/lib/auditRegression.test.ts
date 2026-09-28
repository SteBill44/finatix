import { describe, it, expect } from "vitest";
import { isProfileComplete, normaliseCimaId } from "@/lib/profile";
import { canPurchase, isInDevelopment, type CourseContentStatus } from "@/hooks/useCourseContentStatus";
import { isPriceConfirmed, subscriptionTerms } from "@/lib/checkoutState";
import { saleGaps } from "@/components/admin/SaleReadinessPanel";

const base: CourseContentStatus = {
  course_id: "c1", is_free: false, lesson_records: 15, substantive_lessons: 0, videos: 0,
  questions: 0, downloads: 0, placeholder_downloads: 2, mock_exams: 5, usable_mocks: 0,
  editorially_approved: false, prerequisites_met: false, on_sale: false,
  taught_lessons: 0, is_case_study: false, blocked_reason: null,
};

describe("profile completeness without a CIMA ID", () => {
  it("names alone complete the profile", () => {
    expect(isProfileComplete({ first_name: "Ada", last_name: "Lovelace", cima_id: null })).toBe(true);
  });
  it("missing names are still incomplete", () => {
    expect(isProfileComplete({ first_name: "Ada", last_name: " " })).toBe(false);
    expect(isProfileComplete(null)).toBe(false);
  });
  it("blank CIMA IDs are stored as null and long ones trimmed", () => {
    expect(normaliseCimaId("  ")).toBeNull();
    expect(normaliseCimaId(" 123 ")).toBe("123");
    expect(normaliseCimaId("x".repeat(30))).toHaveLength(20);
  });
});

describe("content status and purchase CTAs", () => {
  it("empty paid course cannot be bought and shows as in development", () => {
    expect(canPurchase(base)).toBe(false);
    expect(isInDevelopment(base)).toBe(true);
  });
  it("approval without content is still not purchasable (server decides on_sale)", () => {
    expect(canPurchase({ ...base, editorially_approved: true, on_sale: false })).toBe(false);
  });
  it("on-sale paid course can be bought", () => {
    expect(canPurchase({ ...base, on_sale: true })).toBe(true);
    expect(isInDevelopment({ ...base, on_sale: true })).toBe(false);
  });
  it("free courses are never 'purchasable' - they are enrolled", () => {
    expect(canPurchase({ ...base, is_free: true, on_sale: true })).toBe(false);
  });
  it("missing status never unlocks purchase", () => {
    expect(canPurchase(undefined)).toBe(false);
  });
  it("admin gap list names every blocker", () => {
    const gaps = saleGaps(base).join(" | ");
    expect(gaps).toMatch(/15 lessons need/);
    expect(gaps).toMatch(/100 more practice questions/);
    expect(gaps).toMatch(/No mock exam/);
    expect(gaps).toMatch(/2 placeholder downloads/);
    expect(gaps).toMatch(/editorial approval/);
  });
});

describe("distinct taught lessons", () => {
  it("two lessons, one with text AND video, one empty: still in development and gap reported", () => {
    const s = { ...base, lesson_records: 2, substantive_lessons: 1, videos: 1, taught_lessons: 1 };
    expect(isInDevelopment({ ...s, is_free: true })).toBe(true);
    expect(saleGaps(s).join()).toMatch(/1 lessons need/);
  });
  it("case studies always report the pending policy", () => {
    expect(saleGaps({ ...base, is_case_study: true }).join()).toMatch(/case-specific readiness policy/);
  });
});

describe("checkout price confirmation", () => {
  const ok = { available: true, amount: 199, checking: false, rechecking: false, failed: false };
  it("confirmed only when the latest check succeeded", () => {
    expect(isPriceConfirmed(ok)).toBe(true);
    expect(isPriceConfirmed({ ...ok, failed: true })).toBe(false);
    expect(isPriceConfirmed({ ...ok, rechecking: true })).toBe(false);
    expect(isPriceConfirmed({ ...ok, checking: true })).toBe(false);
    expect(isPriceConfirmed({ ...ok, available: false })).toBe(false);
  });
  it("unavailable subscription never promises a charge today", () => {
    const t = subscriptionTerms("£49", "month", false);
    expect(t).not.toMatch(/taken today/);
    expect(t).toMatch(/nothing is charged now/);
    expect(subscriptionTerms("£49", "month", true)).toMatch(/taken today/);
  });
});
