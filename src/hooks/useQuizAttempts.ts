import { useQuery } from "@tanstack/react-query";
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

// NOTE: quiz scores are written only by the server-side `submit-quiz` function.
// Clients cannot insert or edit their own attempts.
