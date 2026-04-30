// Barrel re-export — kept for backward compatibility.
// Import directly from the source files for new code:
//   useEnrollments.ts      → enrollment queries & mutations
//   useLessonData.ts       → lesson queries, progress, & mark-complete mutation
//   useQuizAttempts.ts     → quiz attempt queries & record mutation
//   useStudySessions.ts    → study session queries & mutations

export type { Enrollment } from "./useEnrollments";
export {
  useEnrollments,
  useEnrollInCourse,
  useUnenrollFromCourse,
  useEnrollInMultipleCourses,
} from "./useEnrollments";

export type { LessonProgress, LastLesson } from "./useLessonData";
export {
  useLessons,
  useLessonProgress,
  useLastAccessedLesson,
  useCourseProgress,
  useMarkLessonComplete,
} from "./useLessonData";

export type { QuizAttempt } from "./useQuizAttempts";
export { useQuizAttempts, useRecordQuizAttempt } from "./useQuizAttempts";

export type { StudySession } from "./useStudySessions";
export {
  useStudySessions,
  useTotalStudyTime,
  useStartStudySession,
  useEndStudySession,
} from "./useStudySessions";

// useCourses lives here — it's a simple catalog query not tied to student data
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
