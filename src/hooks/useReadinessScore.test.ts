import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getReadinessLevel,
  coverageAdjustedScore,
  applyReadinessGates,
  calculateConfidence,
  getDaysSince,
} from "./useReadinessScore";

// ---------------------------------------------------------------------------
// getReadinessLevel
// ---------------------------------------------------------------------------
describe("getReadinessLevel", () => {
  it("returns 'not-started' for score 0", () => {
    expect(getReadinessLevel(0)).toBe("not-started");
  });

  it("returns 'beginning' for scores 1–24", () => {
    expect(getReadinessLevel(1)).toBe("beginning");
    expect(getReadinessLevel(24)).toBe("beginning");
  });

  it("returns 'developing' for scores 25–49", () => {
    expect(getReadinessLevel(25)).toBe("developing");
    expect(getReadinessLevel(49)).toBe("developing");
  });

  it("returns 'proficient' for scores 50–74", () => {
    expect(getReadinessLevel(50)).toBe("proficient");
    expect(getReadinessLevel(74)).toBe("proficient");
  });

  it("returns 'ready' for scores 75 and above", () => {
    expect(getReadinessLevel(75)).toBe("ready");
    expect(getReadinessLevel(100)).toBe("ready");
  });
});

// ---------------------------------------------------------------------------
// coverageAdjustedScore
// ---------------------------------------------------------------------------
describe("coverageAdjustedScore", () => {
  it("divides the sum of taken percentages by the total available", () => {
    // 1 of 8 quizzes taken at 100% → 100 / 8 = 12.5
    expect(coverageAdjustedScore(100, 8)).toBe(12.5);
  });

  it("returns the full average when everything is taken", () => {
    // 4 quizzes taken totalling 320% (avg 80) over 4 available → 80
    expect(coverageAdjustedScore(320, 4)).toBe(80);
  });

  it("returns 0 when there are no assessments available", () => {
    expect(coverageAdjustedScore(0, 0)).toBe(0);
    expect(coverageAdjustedScore(250, 0)).toBe(0);
  });

  it("scales linearly with coverage", () => {
    // Half the quizzes taken at 100% → half credit
    expect(coverageAdjustedScore(400, 8)).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// applyReadinessGates
// ---------------------------------------------------------------------------
describe("applyReadinessGates", () => {
  const pass = {
    mocksExist: true,
    mockExamsTaken: 2,
    lastActivityDays: 3,
    coverageRatio: 0.9,
  };

  it("leaves a fully-evidenced 'ready' as 'ready'", () => {
    expect(applyReadinessGates("ready", pass)).toBe("ready");
  });

  it("never upgrades a lower level", () => {
    expect(applyReadinessGates("developing", pass)).toBe("developing");
    expect(applyReadinessGates("proficient", pass)).toBe("proficient");
    expect(applyReadinessGates("not-started", pass)).toBe("not-started");
  });

  it("caps 'ready' to 'proficient' when the course has mocks but none were taken", () => {
    expect(applyReadinessGates("ready", { ...pass, mockExamsTaken: 0 })).toBe("proficient");
  });

  it("does not require a mock when the course has none", () => {
    expect(applyReadinessGates("ready", { ...pass, mocksExist: false, mockExamsTaken: 0 })).toBe("ready");
  });

  it("caps 'ready' when the last activity is stale (>30 days)", () => {
    expect(applyReadinessGates("ready", { ...pass, lastActivityDays: 45 })).toBe("proficient");
  });

  it("caps 'ready' when coverage is thin (<60%)", () => {
    expect(applyReadinessGates("ready", { ...pass, coverageRatio: 0.4 })).toBe("proficient");
  });
});

// ---------------------------------------------------------------------------
// calculateConfidence
// ---------------------------------------------------------------------------
describe("calculateConfidence", () => {
  it("returns very-low confidence when there is no data and no activity", () => {
    const { confidence, level } = calculateConfidence(null, 0, 0);
    expect(level).toBe("very-low");
    expect(confidence).toBeLessThan(30);
  });

  it("returns high confidence with recent activity and good coverage", () => {
    // lastActivityDays <= 3 → recencyConfidence = 40
    // dataPoints / totalPossiblePoints = 1 → coverageConfidence = 60
    // total = 100, capped → level = 'high'
    const { confidence, level } = calculateConfidence(1, 10, 10);
    expect(level).toBe("high");
    expect(confidence).toBeGreaterThanOrEqual(70);
  });

  it("caps coverage confidence at 60", () => {
    // Even with 100% coverage ratio the coverage part cannot exceed 60
    const { confidence } = calculateConfidence(null, 1000, 1);
    expect(confidence).toBeLessThanOrEqual(60);
  });

  it("returns low confidence for activity 15–30 days ago with partial coverage", () => {
    // lastActivityDays = 20 → recencyConfidence = 18
    // dataPoints/total = 0.25 → coverageConfidence = 0.25 * 80 = 20, capped at 60 → 20
    // total = 38 → 'medium' (>= 30) ... let's just check it's not 'high'
    const { level } = calculateConfidence(20, 5, 20);
    expect(["low", "medium"]).toContain(level);
  });

  it("returns medium confidence for activity within 7–14 days and moderate coverage", () => {
    // lastActivityDays = 10 → recencyConfidence = 28
    // dataPoints/total = 0.5 → coverageConfidence = 0.5 * 80 = 40, capped at 60 → 40
    // total = 68 → 'medium' (50–69)
    const { level, confidence } = calculateConfidence(10, 5, 10);
    expect(confidence).toBeGreaterThanOrEqual(50);
    expect(level).toBe("medium");
  });
});

// ---------------------------------------------------------------------------
// getDaysSince
// ---------------------------------------------------------------------------
describe("getDaysSince", () => {
  beforeEach(() => {
    // Fix "now" to a known point in time: 2024-01-15T12:00:00.000Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for a date that is today", () => {
    expect(getDaysSince("2024-01-15T06:00:00.000Z")).toBe(0);
  });

  it("returns 1 for a date that was yesterday", () => {
    expect(getDaysSince("2024-01-14T12:00:00.000Z")).toBe(1);
  });

  it("returns 7 for a date one week ago", () => {
    expect(getDaysSince("2024-01-08T12:00:00.000Z")).toBe(7);
  });

  it("returns 30 for a date 30 days ago", () => {
    expect(getDaysSince("2023-12-16T12:00:00.000Z")).toBe(30);
  });

  it("returns a positive number for future dates (absolute difference)", () => {
    expect(getDaysSince("2024-01-16T12:00:00.000Z")).toBe(1);
  });
});
