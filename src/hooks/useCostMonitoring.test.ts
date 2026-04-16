import { describe, it, expect } from "vitest";
import {
  calculateAICost,
  calculateEdgeFunctionCost,
  calculateDatabaseCost,
  calculateStorageCost,
  PRICING,
} from "./useCostMonitoring";

// ---------------------------------------------------------------------------
// calculateAICost
// ---------------------------------------------------------------------------
describe("calculateAICost", () => {
  it("returns 0 for 0 messages", () => {
    expect(calculateAICost(0)).toBe(0);
  });

  it("charges per-message at the configured rate", () => {
    expect(calculateAICost(1)).toBe(PRICING.AI_COST_PER_MESSAGE);
    expect(calculateAICost(100)).toBeCloseTo(100 * PRICING.AI_COST_PER_MESSAGE, 10);
  });

  it("scales linearly", () => {
    const costFor10 = calculateAICost(10);
    const costFor20 = calculateAICost(20);
    expect(costFor20).toBeCloseTo(costFor10 * 2, 10);
  });
});

// ---------------------------------------------------------------------------
// calculateEdgeFunctionCost
// ---------------------------------------------------------------------------
describe("calculateEdgeFunctionCost", () => {
  it("returns 0 when invocations are within the free tier", () => {
    expect(calculateEdgeFunctionCost(0)).toBe(0);
    expect(calculateEdgeFunctionCost(PRICING.EDGE_FUNCTION_FREE_TIER)).toBe(0);
  });

  it("charges only for invocations beyond the free tier", () => {
    const billable = 1_000_000; // 1M over the free tier
    const cost = calculateEdgeFunctionCost(PRICING.EDGE_FUNCTION_FREE_TIER + billable);
    const expected = (billable / 1_000_000) * PRICING.EDGE_FUNCTION_COST_PER_MILLION;
    expect(cost).toBeCloseTo(expected, 10);
  });

  it("charges exactly $2 per million billable invocations", () => {
    const cost = calculateEdgeFunctionCost(PRICING.EDGE_FUNCTION_FREE_TIER + 1_000_000);
    expect(cost).toBeCloseTo(PRICING.EDGE_FUNCTION_COST_PER_MILLION, 10);
  });
});

// ---------------------------------------------------------------------------
// calculateDatabaseCost
// ---------------------------------------------------------------------------
describe("calculateDatabaseCost", () => {
  it("returns 0 when size is within the free tier (500 MB)", () => {
    expect(calculateDatabaseCost(0)).toBe(0);
    expect(calculateDatabaseCost(PRICING.DATABASE_FREE_TIER_MB)).toBe(0);
  });

  it("charges only for storage beyond the free tier", () => {
    // 1024 MB over the free tier = 1 GB billable
    const cost = calculateDatabaseCost(PRICING.DATABASE_FREE_TIER_MB + 1024);
    expect(cost).toBeCloseTo(PRICING.DATABASE_COST_PER_GB, 10);
  });

  it("scales correctly for 2 GB over the free tier", () => {
    const cost = calculateDatabaseCost(PRICING.DATABASE_FREE_TIER_MB + 2048);
    expect(cost).toBeCloseTo(2 * PRICING.DATABASE_COST_PER_GB, 10);
  });
});

// ---------------------------------------------------------------------------
// calculateStorageCost
// ---------------------------------------------------------------------------
describe("calculateStorageCost", () => {
  it("returns 0 when size is within the free tier (1 GB = 1024 MB)", () => {
    expect(calculateStorageCost(0)).toBe(0);
    expect(calculateStorageCost(1024)).toBe(0); // exactly 1 GB
  });

  it("charges only for storage beyond 1 GB", () => {
    // 2048 MB = 2 GB → 1 GB billable
    const cost = calculateStorageCost(2048);
    expect(cost).toBeCloseTo(PRICING.STORAGE_COST_PER_GB, 10);
  });

  it("scales correctly for 3 GB total (2 GB billable)", () => {
    const cost = calculateStorageCost(3072);
    expect(cost).toBeCloseTo(2 * PRICING.STORAGE_COST_PER_GB, 10);
  });

  it("uses the per-GB rate of $0.021", () => {
    expect(PRICING.STORAGE_COST_PER_GB).toBe(0.021);
  });
});

// ---------------------------------------------------------------------------
// PRICING constants sanity checks
// ---------------------------------------------------------------------------
describe("PRICING constants", () => {
  it("has a positive AI cost per message", () => {
    expect(PRICING.AI_COST_PER_MESSAGE).toBeGreaterThan(0);
  });

  it("has a non-zero edge function free tier", () => {
    expect(PRICING.EDGE_FUNCTION_FREE_TIER).toBeGreaterThan(0);
  });

  it("has a positive database free tier in MB", () => {
    expect(PRICING.DATABASE_FREE_TIER_MB).toBeGreaterThan(0);
  });

  it("has a positive storage free tier in GB", () => {
    expect(PRICING.STORAGE_FREE_TIER_GB).toBeGreaterThan(0);
  });
});
