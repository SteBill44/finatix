import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

interface LessonResource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  download_count: number | null;
}

export interface LessonDetailResponse {
  lesson: Array<{ [key: string]: any }>;
  course: Array<{ [key: string]: any }>;
  progress: Array<{ [key: string]: any }> | null;
  resources: LessonResource[];
  quizzes: Array<{ [key: string]: any }>;
}

export const useLessonDetailOptimized = (lessonId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.lessons.detail(lessonId), user?.id],
    queryFn: async (): Promise<LessonDetailResponse> => {
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();

      if (lessonError) throw lessonError;

      if (!lesson) {
        return {
          lesson: [],
          course: [],
          progress: user?.id ? [] : null,
          resources: [],
          quizzes: [],
        };
      }

      const [courseRes, resourcesRes, quizzesRes, progressRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", lesson.course_id).maybeSingle(),
        supabase
          .from("lesson_resources")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("created_at", { ascending: true }),
        supabase
          .from("quizzes")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("order_index", { ascending: true }),
        user?.id
          ? supabase
              .from("lesson_progress")
              .select("*")
              .eq("user_id", user.id)
              .eq("lesson_id", lessonId)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (courseRes.error) throw courseRes.error;
      if (resourcesRes.error) throw resourcesRes.error;
      if (quizzesRes.error) throw quizzesRes.error;
      if (progressRes.error) throw progressRes.error;

      return {
        lesson: [lesson],
        course: courseRes.data ? [courseRes.data] : [],
        progress: user?.id ? progressRes.data || [] : null,
        resources: resourcesRes.data || [],
        quizzes: quizzesRes.data || [],
      };
    },
    enabled: !!lessonId,
    staleTime: 30000, // 30 seconds
  });
};
