import { describe, it, expect } from "vitest";
import { availabilityLabel, practiceAvailable, HOME_CTAS } from "./courseAvailability";
import type { CourseContentStatus } from "@/hooks/useCourseContentStatus";

const base: CourseContentStatus = {
  course_id: "x", is_free: true, lesson_records: 18, substantive_lessons: 0, videos: 0, questions: 0,
  downloads: 0, placeholder_downloads: 0, mock_exams: 0, usable_mocks: 0, editorially_approved: false,
  prerequisites_met: false, on_sale: false, taught_lessons: 0, is_case_study: false, blocked_reason: null,
};

describe("homepage availability labels", () => {
  it("BA1/BA2-style free course with a question bank", () => {
    expect(availabilityLabel({ ...base, questions: 189 }).label).toBe("Free · practice available");
  });
  it("BA3 (5 questions) and BA4 (0) are outline only", () => {
    expect(availabilityLabel({ ...base, questions: 5 }).label).toBe("Free · outline only");
    expect(practiceAvailable({ ...base, questions: 0 })).toBe(false);
  });
  it("paid and case-study courses in development", () => {
    expect(availabilityLabel({ ...base, is_free: false }).label).toBe("In development");
    expect(availabilityLabel({ ...base, is_free: false, is_case_study: true }).label).toMatch(/case policy pending/);
  });
  it("missing status never guesses", () => {
    expect(availabilityLabel(undefined).label).toBe("Status unavailable");
  });
});

describe("homepage CTA destinations exist", () => {
  const routes = ["/courses/:courseId", "/start/new", "/start/paper", "/start/case-study", "/courses", "/pricing", "/why-cima"];
  it("every route CTA matches an app route", () => {
    for (const to of Object.values(HOME_CTAS)) {
      if (to.startsWith("#")) continue;
      const path = to.split("#")[0];
      const ok = routes.some((r) => new RegExp("^" + r.replace(/:[^/]+/g, "[^/]+") + "$").test(path));
      expect(ok, path).toBe(true);
    }
  });
});
