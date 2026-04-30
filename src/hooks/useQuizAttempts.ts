import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QuizAttempt {
  id: string;
  course_id: string;
  quiz_id?: string;
  score: number;
  max_score: number;
  attempted_at: string;
}

export const useQuizAttempts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz_attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user,
  });
};

export const useRecordQuizAttempt = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      quizId,
      score,
      maxScore,
      timeTakenSeconds,
    }: {
      courseId: string;
      quizId?: string;
      score: number;
      maxScore: number;
      timeTakenSeconds?: number;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          course_id: courseId,
          quiz_id: quizId ?? null,
          score,
          max_score: maxScore,
          time_taken_seconds: timeTakenSeconds ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz_attempts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["lesson_quiz_attempts"] });
    },
  });
};
