import { describe, it, expect } from "vitest";
import { isProfileComplete, normaliseCimaId } from "@/lib/profile";
import { canPurchase, isInDevelopment, type CourseContentStatus } from "@/hooks/useCourseContentStatus";
import { saleGaps } from "@/components/admin/SaleReadinessPanel";

const base: CourseContentStatus = {
  course_id: "c1", is_free: false, lesson_records: 15, substantive_lessons: 0, videos: 0,
  questions: 0, downloads: 0, placeholder_downloads: 2, mock_exams: 5, usable_mocks: 0,
  editorially_approved: false, prerequisites_met: false, on_sale: false,
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
