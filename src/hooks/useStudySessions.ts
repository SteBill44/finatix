import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StudySession {
  id: string;
  course_id: string | null;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
}

export const useStudySessions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study_sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as StudySession[];
    },
    enabled: !!user,
  });
};

export const useTotalStudyTime = () => {
  const { data: sessions } = useStudySessions();

  const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) ?? 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { totalMinutes, hours, minutes, formatted: `${hours}h ${minutes}m` };
};

export const useStartStudySession = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId?: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          course_id: courseId ?? null,
          duration_minutes: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_sessions", user?.id] });
    },
  });
};

export const useEndStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      durationMinutes,
    }: {
      sessionId: string;
      durationMinutes: number;
    }) => {
      const { data, error } = await supabase
        .from("study_sessions")
        .update({ duration_minutes: durationMinutes, ended_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_sessions"] });
    },
  });
};
