import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

export interface LessonDetailResponse {
  lesson: Array<{ [key: string]: any }>;
  course: Array<{ [key: string]: any }>;
  progress: Array<{ [key: string]: any }> | null;
  resources: Array<{ [key: string]: any }>;
  quizzes: Array<{ [key: string]: any }>;
}

export const useLessonDetailOptimized = (lessonId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.lessons.detail(lessonId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_lesson_detail_with_context",
        {
          p_lesson_id: lessonId,
          p_user_id: user?.id || null,
        }
      );

      if (error) throw error;
      return data as LessonDetailResponse;
    },
    enabled: !!lessonId,
    staleTime: 30000, // 30 seconds
  });
};
