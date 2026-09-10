/**
 * Course figures derived from the actual content in the database.
 *
 * Nothing here is rounded up or advertised beyond what exists. Where a figure
 * would be zero or unknown, the page hides it rather than filling the gap.
 */

export interface CourseFactInput {
  durationHours?: number | null;
  lessons: Array<{ duration_minutes?: number | null; has_video?: boolean | null; video_url?: string | null }>;
  quizzes: Array<{ quiz_type?: string | null }>;
}

export interface CourseFacts {
  /** Number of lessons actually published. */
  lessonCount: number;
  /** Lessons that have a video attached. */
  videoLessonCount: number;
  /** Total lesson time in minutes as recorded against the lessons. */
  lessonMinutes: number;
  /** Estimated total study time in hours, including your own practice. */
  estimatedStudyHours: number | null;
  practiceQuizCount: number;
  mockExamCount: number;
  finalExamCount: number;
}

export function deriveCourseFacts({ durationHours, lessons, quizzes }: CourseFactInput): CourseFacts {
  const lessonMinutes = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const videoLessonCount = lessons.filter((l) => Boolean(l.has_video ?? l.video_url)).length;
  const type = (q: { quiz_type?: string | null }) => q.quiz_type ?? "quiz";

  return {
    lessonCount: lessons.length,
    videoLessonCount,
    lessonMinutes,
    estimatedStudyHours: durationHours && durationHours > 0 ? durationHours : null,
    practiceQuizCount: quizzes.filter((q) => type(q) !== "mock_exam" && type(q) !== "final_exam").length,
    mockExamCount: quizzes.filter((q) => type(q) === "mock_exam").length,
    finalExamCount: quizzes.filter((q) => type(q) === "final_exam").length,
  };
}

/** "12 h 35 min" style formatting for a minute total. */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  if (!m) return `${h} hr`;
  return `${h} hr ${m} min`;
}
