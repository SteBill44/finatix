import { describe, it, expect } from "vitest";
import {
  splitAxisLabel,
  wrapSubtitle,
  getScoreColor,
  getReadinessLabel,
  computeScoreTrend,
  buildAssessments,
  PASS_THRESHOLD,
  type AssessmentQuiz,
  type QuizAttempt,
} from "./helpers";

// ---------------------------------------------------------------------------
// splitAxisLabel
// ---------------------------------------------------------------------------
describe("splitAxisLabel", () => {
  it("splits 'A: Strategy Process' into prefix + subtitle", () => {
    expect(splitAxisLabel("A: Strategy Process")).toEqual({
      prefix: "A",
      subtitle: "Strategy Process",
    });
  });

  it("splits 'A. External Analysis' into prefix + subtitle", () => {
    expect(splitAxisLabel("A. External Analysis")).toEqual({
      prefix: "A",
      subtitle: "External Analysis",
    });
  });

  it("handles 'B1) Foo' style labels", () => {
    expect(splitAxisLabel("B1) Foo")).toEqual({
      prefix: "B1",
      subtitle: "Foo",
    });
  });

  it("returns empty prefix when no leading code", () => {
    expect(splitAxisLabel("Management Accounting")).toEqual({
      prefix: "",
      subtitle: "Management Accounting",
    });
  });

  it("trims surrounding whitespace from subtitle", () => {
    expect(splitAxisLabel("A:   Strategy   ")).toEqual({
      prefix: "A",
      subtitle: "Strategy",
    });
  });
});

// ---------------------------------------------------------------------------
// wrapSubtitle
// ---------------------------------------------------------------------------
describe("wrapSubtitle", () => {
  it("returns empty array for empty input", () => {
    expect(wrapSubtitle("", 10, 2)).toEqual([]);
  });

  it("keeps short text on a single line", () => {
    expect(wrapSubtitle("Strategy", 20, 2)).toEqual(["Strategy"]);
  });

  it("wraps onto multiple lines when text exceeds maxChars", () => {
    const result = wrapSubtitle("Strategy Process Analysis", 10, 2);
    expect(result.length).toBeLessThanOrEqual(2);
    expect(result.join(" ")).toContain("Strategy");
  });

  it("ellipsises the last line when text overflows maxLines", () => {
    const result = wrapSubtitle("one two three four five six seven", 5, 2);
    expect(result.length).toBe(2);
    expect(result[result.length - 1].endsWith("…")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getScoreColor
// ---------------------------------------------------------------------------
describe("getScoreColor", () => {
  it("returns accent for score ≥ 75", () => {
    expect(getScoreColor(75)).toBe("text-accent");
    expect(getScoreColor(100)).toBe("text-accent");
  });

  it("returns primary for 50–74", () => {
    expect(getScoreColor(50)).toBe("text-primary");
    expect(getScoreColor(74)).toBe("text-primary");
  });

  it("returns yellow for 25–49", () => {
    expect(getScoreColor(25)).toBe("text-yellow-500");
    expect(getScoreColor(49)).toBe("text-yellow-500");
  });

  it("returns destructive for < 25", () => {
    expect(getScoreColor(0)).toBe("text-destructive");
    expect(getScoreColor(24)).toBe("text-destructive");
  });
});

// ---------------------------------------------------------------------------
// getReadinessLabel
// ---------------------------------------------------------------------------
describe("getReadinessLabel", () => {
  it("returns 'Exam Ready' for score ≥ 75", () => {
    expect(getReadinessLabel(75).label).toBe("Exam Ready");
    expect(getReadinessLabel(90).label).toBe("Exam Ready");
  });

  it("returns 'Developing' for 50–74", () => {
    expect(getReadinessLabel(50).label).toBe("Developing");
  });

  it("returns 'Building' for 25–49", () => {
    expect(getReadinessLabel(30).label).toBe("Building");
  });

  it("returns 'Getting Started' below 25", () => {
    expect(getReadinessLabel(0).label).toBe("Getting Started");
    expect(getReadinessLabel(10).label).toBe("Getting Started");
  });
});

// ---------------------------------------------------------------------------
// computeScoreTrend
// ---------------------------------------------------------------------------
describe("computeScoreTrend", () => {
  it("returns null when there are fewer than 4 attempts", () => {
    expect(computeScoreTrend(null)).toBeNull();
    expect(computeScoreTrend([])).toBeNull();
    expect(computeScoreTrend([
      { quiz_id: "q", score: 5, max_score: 10, attempted_at: "2025-01-01" },
      { quiz_id: "q", score: 6, max_score: 10, attempted_at: "2025-01-02" },
      { quiz_id: "q", score: 7, max_score: 10, attempted_at: "2025-01-03" },
    ])).toBeNull();
  });

  it("returns positive delta when recent attempts improved", () => {
    const attempts: QuizAttempt[] = [
      { quiz_id: "q", score: 4, max_score: 10, attempted_at: "2025-01-01" },
      { quiz_id: "q", score: 5, max_score: 10, attempted_at: "2025-01-02" },
      { quiz_id: "q", score: 8, max_score: 10, attempted_at: "2025-01-03" },
      { quiz_id: "q", score: 9, max_score: 10, attempted_at: "2025-01-04" },
    ];
    const trend = computeScoreTrend(attempts);
    expect(trend).not.toBeNull();
    expect(trend!).toBeGreaterThan(0);
  });

  it("returns negative delta when recent attempts regressed", () => {
    const attempts: QuizAttempt[] = [
      { quiz_id: "q", score: 9, max_score: 10, attempted_at: "2025-01-01" },
      { quiz_id: "q", score: 9, max_score: 10, attempted_at: "2025-01-02" },
      { quiz_id: "q", score: 4, max_score: 10, attempted_at: "2025-01-03" },
      { quiz_id: "q", score: 4, max_score: 10, attempted_at: "2025-01-04" },
    ];
    const trend = computeScoreTrend(attempts);
    expect(trend).not.toBeNull();
    expect(trend!).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// buildAssessments
// ---------------------------------------------------------------------------
describe("buildAssessments", () => {
  it("returns empty groups for missing quizzes", () => {
    expect(buildAssessments(null, null)).toEqual({
      practiceQuizzes: [],
      mockExams: [],
      finalExams: [],
    });
    expect(buildAssessments([], [])).toEqual({
      practiceQuizzes: [],
      mockExams: [],
      finalExams: [],
    });
  });

  it("groups quizzes into practice / mock / final buckets", () => {
    const quizzes: AssessmentQuiz[] = [
      { id: "p1", title: "Practice 1", quiz_type: "lesson_quiz" },
      { id: "m1", title: "Mock 1", quiz_type: "mock_exam" },
      { id: "f1", title: "Final 1", quiz_type: "final_exam" },
      { id: "o1", title: "Other 1", quiz_type: "weird_type" },
    ];
    const result = buildAssessments(quizzes, []);
    expect(result.practiceQuizzes.map((q) => q.id).sort()).toEqual(["o1", "p1"]);
    expect(result.mockExams.map((q) => q.id)).toEqual(["m1"]);
    expect(result.finalExams.map((q) => q.id)).toEqual(["f1"]);
  });

  it("computes best/last score percentages and pass status", () => {
    const quizzes: AssessmentQuiz[] = [
      { id: "p1", title: "Practice 1", quiz_type: "lesson_quiz" },
    ];
    const attempts: QuizAttempt[] = [
      { quiz_id: "p1", score: 5, max_score: 10, attempted_at: "2025-01-01" }, // 50%
      { quiz_id: "p1", score: 8, max_score: 10, attempted_at: "2025-01-02" }, // 80% - best
      { quiz_id: "p1", score: 7, max_score: 10, attempted_at: "2025-01-03" }, // 70% - last
    ];
    const result = buildAssessments(quizzes, attempts);
    const item = result.practiceQuizzes[0];
    expect(item.attemptsCount).toBe(3);
    expect(item.bestScorePct).toBe(80);
    expect(item.lastScorePct).toBe(70);
    expect(item.passed).toBe(true); // best 80 ≥ PASS_THRESHOLD (70)
  });

  it("ignores attempts with max_score = 0", () => {
    const quizzes: AssessmentQuiz[] = [
      { id: "p1", title: "Practice 1", quiz_type: "lesson_quiz" },
    ];
    const attempts: QuizAttempt[] = [
      { quiz_id: "p1", score: 0, max_score: 0, attempted_at: "2025-01-01" },
    ];
    const result = buildAssessments(quizzes, attempts);
    expect(result.practiceQuizzes[0].attemptsCount).toBe(0);
    expect(result.practiceQuizzes[0].bestScorePct).toBeNull();
  });

  it("marks passed=false when best score is below PASS_THRESHOLD", () => {
    const quizzes: AssessmentQuiz[] = [
      { id: "p1", title: "Practice 1", quiz_type: "lesson_quiz" },
    ];
    const attempts: QuizAttempt[] = [
      { quiz_id: "p1", score: 6, max_score: 10, attempted_at: "2025-01-01" }, // 60% < 70
    ];
    const result = buildAssessments(quizzes, attempts);
    expect(result.practiceQuizzes[0].passed).toBe(false);
    expect(PASS_THRESHOLD).toBe(70);
  });

  it("sorts quizzes by order_index", () => {
    const quizzes: AssessmentQuiz[] = [
      { id: "b", title: "B", quiz_type: "lesson_quiz", order_index: 2 },
      { id: "a", title: "A", quiz_type: "lesson_quiz", order_index: 1 },
    ];
    const result = buildAssessments(quizzes, []);
    expect(result.practiceQuizzes.map((q) => q.id)).toEqual(["a", "b"]);
  });
});
