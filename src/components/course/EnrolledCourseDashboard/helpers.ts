/**
 * Pure helpers for EnrolledCourseDashboard. No React, no I/O - easy to unit test.
 */

export interface SyllabusArea {
  title: string;
  weight: string;
  topics?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  order_index: number;
}

export interface AssessmentQuiz {
  id: string;
  title: string;
  description?: string | null;
  quiz_type?: string;
  order_index?: number;
  lesson_id?: string | null;
}

export interface QuizAttempt {
  quiz_id: string | null;
  score: number;
  max_score: number;
  attempted_at: string;
}

export type AssessmentItem = {
  id: string;
  title: string;
  type: "lesson_quiz" | "mock_exam" | "final_exam" | "other";
  description?: string | null;
  attemptsCount: number;
  bestScorePct: number | null;
  lastScorePct: number | null;
  lastAttemptedAt: string | null;
  passed: boolean;
};

export const PASS_THRESHOLD = 70;

/**
 * Split a syllabus area title into a short prefix code (e.g. "A") and a subtitle.
 *  "A: Strategy Process"   → { prefix: "A",  subtitle: "Strategy Process" }
 *  "A. External Analysis"  → { prefix: "A",  subtitle: "External Analysis" }
 *  "Management Accounting" → { prefix: "",   subtitle: "Management Accounting" }
 */
export const splitAxisLabel = (title: string): { prefix: string; subtitle: string } => {
  const prefixMatch = title.match(/^([A-Z]\d*)\s*[:.\-)]\s*(.*)$/);
  if (prefixMatch) {
    return { prefix: prefixMatch[1], subtitle: prefixMatch[2].trim() };
  }
  return { prefix: "", subtitle: title.trim() };
};

/** Wrap a subtitle into up to `maxLines` lines, each ≤ `maxChars`, breaking on word boundaries. */
export const wrapSubtitle = (text: string, maxChars: number, maxLines: number): string[] => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxChars - 1
      ? last.slice(0, Math.max(1, maxChars - 1)) + "…"
      : last + "…";
  }
  return lines;
};

export const getScoreColor = (score: number): string => {
  if (score >= 75) return "text-accent";
  if (score >= 50) return "text-primary";
  if (score >= 25) return "text-yellow-500";
  return "text-destructive";
};

export const getReadinessLabel = (score: number): { label: string; color: string } => {
  if (score >= 75) return { label: "Exam Ready", color: "bg-accent/15 text-accent border-accent/30" };
  if (score >= 50) return { label: "Developing", color: "bg-primary/15 text-primary border-primary/30" };
  if (score >= 25) return { label: "Building", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" };
  return { label: "Getting Started", color: "bg-muted text-muted-foreground border-border" };
};

/** Score trend: compare older half vs recent half of attempts. Returns delta % (rounded), or null. */
export const computeScoreTrend = (quizAttempts: QuizAttempt[] | null | undefined): number | null => {
  if (!quizAttempts || quizAttempts.length < 4) return null;
  const sorted = [...quizAttempts].sort(
    (a, b) => new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, mid);
  const recent = sorted.slice(mid);
  const olderAvg = older.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) / older.length;
  const recentAvg = recent.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) / recent.length;
  return Math.round(recentAvg - olderAvg);
};

/** Group quizzes by type and attach attempt history. */
export const buildAssessments = (
  quizzes: AssessmentQuiz[] | null | undefined,
  quizAttempts: QuizAttempt[] | null | undefined
) => {
  const empty = {
    practiceQuizzes: [] as AssessmentItem[],
    mockExams: [] as AssessmentItem[],
    finalExams: [] as AssessmentItem[],
  };
  if (!quizzes?.length) return empty;
  const sorted = [...quizzes].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const items: AssessmentItem[] = sorted.map((q) => {
    const attempts = (quizAttempts || []).filter(
      (a) => a.quiz_id === q.id && a.max_score > 0
    );
    const pcts = attempts.map((a) => Math.round((a.score / a.max_score) * 100));
    const best = pcts.length ? Math.max(...pcts) : null;
    const sortedAttempts = [...attempts].sort(
      (a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime()
    );
    const last = sortedAttempts[0]
      ? Math.round((sortedAttempts[0].score / sortedAttempts[0].max_score) * 100)
      : null;
    const rawType = q.quiz_type || "lesson_quiz";
    const type: AssessmentItem["type"] =
      rawType === "mock_exam" || rawType === "final_exam" || rawType === "lesson_quiz"
        ? rawType
        : "other";
    return {
      id: q.id,
      title: q.title,
      type,
      description: q.description,
      attemptsCount: attempts.length,
      bestScorePct: best,
      lastScorePct: last,
      lastAttemptedAt: sortedAttempts[0]?.attempted_at || null,
      passed: best !== null && best >= PASS_THRESHOLD,
    };
  });
  return {
    practiceQuizzes: items.filter((i) => i.type === "lesson_quiz" || i.type === "other"),
    mockExams: items.filter((i) => i.type === "mock_exam"),
    finalExams: items.filter((i) => i.type === "final_exam"),
  };
};
