import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryConfigs } from "@/lib/queryConfig";

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
      // Use optimized database function for better performance
      const { data, error } = await supabase.rpc("get_platform_analytics");

      if (error) {
        console.error("Analytics error:", error);
        throw error;
      }

      const analytics = data as {
        totalStudents: number;
        totalEnrollments: number;
        totalCompletions: number;
        courseStats: {
          course_id: string;
          course_title: string;
          enrollments: number;
          completions: number;
          averageRating: number;
        }[];
      };

      return {
        totalStudents: analytics.totalStudents || 0,
        totalEnrollments: analytics.totalEnrollments || 0,
        totalCompletions: analytics.totalCompletions || 0,
        averageProgress:
          analytics.totalEnrollments && analytics.totalCompletions
            ? Math.round(
                (analytics.totalCompletions / analytics.totalEnrollments) * 100
              )
            : 0,
        courseStats: analytics.courseStats || [],
        weeklyActivity: [],
      } as AnalyticsData;
    },
    ...queryConfigs.analytics,
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
