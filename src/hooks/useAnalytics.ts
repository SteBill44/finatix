import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalStudents: number;
  totalEnrollments: number;
  totalCompletions: number;
  averageProgress: number;
  courseStats: {
    course_id: string;
    course_title: string;
    enrollments: number;
    completions: number;
    averageRating: number;
  }[];
  weeklyActivity: {
    date: string;
    study_sessions: number;
    lessons_completed: number;
    quizzes_taken: number;
  }[];
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      // Get total unique students (users with enrollments)
      const { count: totalStudents } = await supabase
        .from("enrollments")
        .select("user_id", { count: "exact", head: true });

      // Get total enrollments
      const { count: totalEnrollments } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true });

      // Get total completions
      const { count: totalCompletions } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .not("completed_at", "is", null);

      // Get course stats
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title");

      const courseStats = await Promise.all(
        (courses || []).map(async (course) => {
          const { count: enrollments } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id);

          const { count: completions } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id)
            .not("completed_at", "is", null);

          const { data: reviews } = await supabase
            .from("course_reviews")
            .select("rating")
            .eq("course_id", course.id);

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            course_id: course.id,
            course_title: course.title,
            enrollments: enrollments || 0,
            completions: completions || 0,
            averageRating,
          };
        })
      );

      return {
        totalStudents: totalStudents || 0,
        totalEnrollments: totalEnrollments || 0,
        totalCompletions: totalCompletions || 0,
        averageProgress: totalEnrollments && totalCompletions 
          ? Math.round((totalCompletions / totalEnrollments) * 100) 
          : 0,
        courseStats,
        weeklyActivity: [],
      } as AnalyticsData;
    },
  });
};

export const useUserAnalytics = (userId: string) => {
  return useQuery({
    queryKey: ["user_analytics", userId],
    queryFn: async () => {
      // Get study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(30);

      // Get lesson progress
      const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId);

      // Get quiz attempts
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId);

      const totalStudyTime = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
      const completedLessons = lessonProgress?.filter(l => l.completed).length || 0;
      const averageQuizScore = quizAttempts && quizAttempts.length > 0
        ? quizAttempts.reduce((sum, q) => sum + (q.score / q.max_score * 100), 0) / quizAttempts.length
        : 0;

      return {
        totalStudyTime,
        completedLessons,
        totalQuizzes: quizAttempts?.length || 0,
        averageQuizScore: Math.round(averageQuizScore),
        recentSessions: sessions || [],
      };
    },
    enabled: !!userId,
  });
};
