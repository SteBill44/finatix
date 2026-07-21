import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

export interface CourseDetailResponse {
  course: Array<{ [key: string]: any }>;
  lessons: Array<{ [key: string]: any }>;
  progress: Array<{ [key: string]: any }> | null;
  quizzes: Array<{ [key: string]: any }>;
}

export const useCourseDetailOptimized = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: async (): Promise<CourseDetailResponse> => {
      const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
        supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true }),
        supabase.from("quizzes").select("*").eq("course_id", courseId),
      ]);

      if (courseRes.error) throw courseRes.error;
      if (lessonsRes.error) throw lessonsRes.error;
      if (quizzesRes.error) throw quizzesRes.error;

      const lessons = lessonsRes.data || [];

      let progress: Array<{ [key: string]: any }> | null = null;
      if (user?.id && lessons.length > 0) {
        const lessonIds = lessons.map((l: any) => l.id);
        const { data, error } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);
        if (error) throw error;
        progress = data || [];
      }

      return {
        course: courseRes.data ? [courseRes.data] : [],
        lessons,
        progress,
        quizzes: quizzesRes.data || [],
      };
    },
    enabled: !!courseId,
    staleTime: 30000,
  });
};
