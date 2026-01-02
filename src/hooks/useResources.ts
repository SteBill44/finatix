import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useIncrementDownloadCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      // First get current count
      const { data: resource, error: fetchError } = await supabase
        .from("lesson_resources")
        .select("download_count")
        .eq("id", resourceId)
        .single();

      if (fetchError) throw fetchError;

      // Increment the count
      const { error } = await supabase
        .from("lesson_resources")
        .update({ download_count: (resource.download_count || 0) + 1 })
        .eq("id", resourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_resources"] });
      queryClient.invalidateQueries({ queryKey: ["all_resources"] });
    },
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: {
      lesson_id: string;
      title: string;
      description?: string;
      file_url: string;
      file_type: string;
      file_size?: number;
    }) => {
      const { data, error } = await supabase
        .from("lesson_resources")
        .insert(resource)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_resources"] });
      queryClient.invalidateQueries({ queryKey: ["all_resources"] });
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("lesson_resources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_resources"] });
      queryClient.invalidateQueries({ queryKey: ["all_resources"] });
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from("lesson_resources")
        .delete()
        .eq("id", resourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_resources"] });
      queryClient.invalidateQueries({ queryKey: ["all_resources"] });
    },
  });
};
