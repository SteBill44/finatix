import { useMemo } from "react";
import { useCourseContentStatus } from "@/hooks/useCourseContentStatus";

/** Platform totals computed live from course data - never typed in by hand. */
export function usePlatformFacts() {
  const { data, isLoading } = useCourseContentStatus();
  return useMemo(() => {
    if (!data) return { ready: false as const, isLoading };
    const rows = [...data.values()];
    return {
      ready: true as const,
      isLoading,
      courses: rows.length,
      lessonOutlines: rows.reduce((n, r) => n + r.lesson_records, 0),
      writtenLessons: rows.reduce((n, r) => n + r.substantive_lessons, 0),
      questions: rows.reduce((n, r) => n + r.questions, 0),
      coursesWithQuestions: rows.filter((r) => r.questions > 0).length,
      usableMocks: rows.reduce((n, r) => n + r.usable_mocks, 0),
    };
  }, [data, isLoading]);
}
