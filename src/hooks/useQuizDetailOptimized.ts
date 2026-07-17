import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

export interface QuizDetailResponse {
  quiz: Array<{ [key: string]: any }>;
  questions: Array<{ [key: string]: any }>;
  userAnswers: Array<{ [key: string]: any }> | null;
}

export const useQuizDetailOptimized = (quizId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.quizzes.detail(quizId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_quiz_with_questions",
        {
          p_quiz_id: quizId,
          p_user_id: user?.id || null,
        }
      );

      if (error) throw error;
      return data as QuizDetailResponse;
    },
    enabled: !!quizId,
    staleTime: 30000, // 30 seconds
  });
};
