import { describe, it, expect } from "vitest";
import { EXAM_GROUPS } from "@/lib/examPresentation";
import { PAPERS } from "@/lib/papers";

describe("unified exam discovery", () => {
  it("contains all sixteen real exams once", () => {
    const exams = EXAM_GROUPS.flatMap((group) => group.exams);
    expect(exams).toHaveLength(16);
    expect(new Set(exams.map((exam) => exam.code)).size).toBe(16);
    expect(exams.map((exam) => exam.courseSlug)).toEqual(PAPERS.map((exam) => exam.courseSlug));
  });
  it("groups four equally important exams at each actual level", () => {
    expect(EXAM_GROUPS.map((group) => group.exams.map((exam) => exam.code))).toEqual([
      ["BA1", "BA2", "BA3", "BA4"], ["E1", "P1", "F1", "OCS"],
      ["E2", "P2", "F2", "MCS"], ["E3", "P3", "F3", "SCS"],
    ]);
  });
  it("keeps the existing case exam destinations within their respective levels", () => {
    expect(EXAM_GROUPS[1].exams[3].courseSlug).toBe("ocs-operational-case-study");
    expect(EXAM_GROUPS[2].exams[3].courseSlug).toBe("mcs-management-case-study");
    expect(EXAM_GROUPS[3].exams[3].courseSlug).toBe("scs-strategic-case-study");
  });
});
