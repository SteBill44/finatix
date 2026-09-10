/**
 * Learning context: the paper / level / sitting a visitor picked in the
 * "where are you starting from?" journey selector.
 *
 * It is deliberately tiny and stored in localStorage so it survives a refresh,
 * a sign-in round trip (including OAuth redirects) and back navigation.
 * It contains no personal data - only a journey name and course identifiers.
 */

export type JourneyId = "new" | "paper" | "case-study";

export interface LearningContext {
  journey: JourneyId;
  /** Course slug of the chosen paper, e.g. "p1-management-accounting". */
  paperSlug?: string;
  /** CIMA level: certificate | operational | management | strategic. */
  level?: string;
  /** Sitting identifier, only ever a value from the verified sittings list. */
  sitting?: string;
  /** When it was chosen (epoch ms) - used to expire stale context. */
  savedAt: number;
}

const KEY = "finatix_learning_context";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 60; // 60 days

export function saveLearningContext(
  ctx: Omit<LearningContext, "savedAt">,
): LearningContext {
  const value: LearningContext = { ...ctx, savedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable - context simply won't persist */
  }
  return value;
}

export function loadLearningContext(): LearningContext | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LearningContext;
    if (!parsed?.journey) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearLearningContext() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Mark the selector as skipped so we don't nag on every visit. */
const SKIP_KEY = "finatix_journey_skipped";

export function skipJourneySelector() {
  try {
    localStorage.setItem(SKIP_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isJourneySelectorSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Where a visitor should land once they have an account.
 * Falls back to the dashboard when there is nothing more specific.
 */
export function learningContextDestination(
  ctx: LearningContext | null,
): string {
  if (!ctx) return "/dashboard";
  if (ctx.paperSlug) return `/courses/${ctx.paperSlug}`;
  if (ctx.journey === "new") return "/courses/ba1-business-economics";
  if (ctx.journey === "case-study" && ctx.level) {
    return `/start/case-study?level=${encodeURIComponent(ctx.level)}`;
  }
  return "/dashboard";
}

/** Short, human wording for the chosen context (used in banners). */
export function describeLearningContext(
  ctx: LearningContext | null,
  paperTitle?: string,
): string | null {
  if (!ctx) return null;
  if (ctx.journey === "new") return "Starting CIMA from the beginning";
  if (ctx.journey === "paper") {
    return paperTitle ? `Studying ${paperTitle}` : "Studying for a paper";
  }
  if (ctx.journey === "case-study") {
    const level = ctx.level ? ` (${ctx.level})` : "";
    return `Preparing for a case study${level}`;
  }
  return null;
}
