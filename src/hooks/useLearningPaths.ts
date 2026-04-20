import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  difficulty_level: string | null;
  estimated_hours: number | null;
  is_published: boolean | null;
  created_by: string | null;
  created_at: string | null;
  courses?: LearningPathCourse[];
  enrollment?: UserLearningPath | null;
}

export interface LearningPathCourse {
  id: string;
  learning_path_id: string;
  course_id: string;
  order_index: number;
  is_required: boolean | null;
  course: {
    id: string;
    title: string;
    slug: string;
    level: string | null;
    duration_hours: number | null;
    thumbnail_url: string | null;
  };
}

export interface UserLearningPath {
  id: string;
  user_id: string;
  learning_path_id: string;
  enrolled_at: string;
  completed_at: string | null;
  current_course_id: string | null;
}

export const useLearningPaths = () => {
  return useQuery({
    queryKey: ["learning_paths"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("learning_paths")
        .select(`
          *,
          courses:learning_path_courses(
            *,
            course:courses(id, title, slug, level, duration_hours, thumbnail_url)
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) return [] as LearningPath[];
      return (data || []) as LearningPath[];
    },
  });
};

export const useMyLearningPaths = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my_learning_paths", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_learning_paths")
        .select(`
          *,
          learning_path:learning_paths(
            *,
            courses:learning_path_courses(
              *,
              course:courses(id, title, slug, level, duration_hours, thumbnail_url)
            )
          )
        `)
        .eq("user_id", user!.id)
        .order("enrolled_at", { ascending: false });

      if (error) return [] as (UserLearningPath & { learning_path: LearningPath })[];
      return (data || []) as (UserLearningPath & { learning_path: LearningPath })[];
    },
    enabled: !!user,
  });
};

export const useEnrollInLearningPath = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (learningPathId: string) => {
      const { data, error } = await (supabase as any)
        .from("user_learning_paths")
        .insert({
          user_id: user!.id,
          learning_path_id: learningPathId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_learning_paths"] });
      queryClient.invalidateQueries({ queryKey: ["learning_paths"] });
    },
  });
};
