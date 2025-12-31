import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  download_count: number;
  created_at: string;
}

export const useLessonResources = (lessonId: string) => {
  return useQuery({
    queryKey: ["lesson_resources", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_resources")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at");
      
      if (error) throw error;
      return data as LessonResource[];
    },
    enabled: !!lessonId,
  });
};

export const useAllResources = (courseId?: string) => {
  return useQuery({
    queryKey: ["all_resources", courseId],
    queryFn: async () => {
      let query = supabase
        .from("lesson_resources")
        .select(`
          *,
          lessons (
            id,
            title,
            course_id
          )
        `)
        .order("created_at");

      if (courseId) {
        query = query.eq("lessons.course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
