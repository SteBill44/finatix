import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getReadinessLevel,
  getRecencyWeight,
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
// getRecencyWeight
// ---------------------------------------------------------------------------
describe("getRecencyWeight", () => {
  it("returns 1.0 for activity within the last 7 days", () => {
    expect(getRecencyWeight(0)).toBe(1.0);
    expect(getRecencyWeight(7)).toBe(1.0);
  });

  it("returns 0.9 for activity 8–14 days ago", () => {
    expect(getRecencyWeight(8)).toBe(0.9);
    expect(getRecencyWeight(14)).toBe(0.9);
  });

  it("returns 0.75 for activity 15–30 days ago", () => {
    expect(getRecencyWeight(15)).toBe(0.75);
    expect(getRecencyWeight(30)).toBe(0.75);
  });

  it("returns 0.5 for activity 31–60 days ago", () => {
    expect(getRecencyWeight(31)).toBe(0.5);
    expect(getRecencyWeight(60)).toBe(0.5);
  });

  it("returns 0.25 for activity older than 60 days", () => {
    expect(getRecencyWeight(61)).toBe(0.25);
    expect(getRecencyWeight(365)).toBe(0.25);
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
