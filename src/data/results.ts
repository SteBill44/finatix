/**
 * Exam results evidence.
 *
 * A pass rate may only be published with the exam window it covers, how many
 * students it is based on, and how it was measured. Leave this null until
 * those three facts exist - an unqualified percentage is not evidence.
 */

export interface PassRateEvidence {
  /** e.g. "May 2026 exam window" */
  examPeriod: string;
  /** Percentage of students who passed, e.g. 78 */
  passRate: number;
  /** How many students the figure is based on. */
  sampleSize: number;
  /** How it was measured, in plain English. */
  method: string;
  /** When the figure was last updated. */
  lastUpdated: string;
}

export const PASS_RATE: PassRateEvidence | null = null;
