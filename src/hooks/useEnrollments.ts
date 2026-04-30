import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    slug: string;
    level: string;
    duration_hours: number;
  };
}

export const useEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          enrolled_at,
          completed_at,
          courses (
            id,
            title,
            slug,
            level,
            duration_hours
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!user,
  });
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: courseId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", user?.id] });
    },
  });
};

export const useUnenrollFromCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["lesson_progress", user?.id] });
    },
  });
};

export const useEnrollInMultipleCourses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseIds: string[]) => {
      if (!user) throw new Error("Must be logged in");

      const { data: existing } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);

      const existingIds = new Set(existing?.map((e) => e.course_id) ?? []);
      const newIds = courseIds.filter((id) => !existingIds.has(id));

      if (newIds.length === 0) {
        return { enrolled: 0, message: "Already enrolled in all courses" };
      }

      const { data, error } = await supabase
        .from("enrollments")
        .insert(newIds.map((course_id) => ({ user_id: user.id, course_id })))
        .select();

      if (error) throw error;
      return { enrolled: data.length, message: `Enrolled in ${data.length} courses` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", user?.id] });
    },
  });
};
