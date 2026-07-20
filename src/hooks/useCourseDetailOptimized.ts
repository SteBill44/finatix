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
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_course_detail_with_progress",
        {
          p_course_id: courseId,
          p_user_id: user?.id || null,
        }
      );

      if (error) throw error;
      return data as CourseDetailResponse;
    },
    enabled: !!courseId,
    staleTime: 30000, // 30 seconds
  });
};
