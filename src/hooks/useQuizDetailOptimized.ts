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
    queryKey: [...queryKeys.quizzes.detail(quizId), user?.id],
    queryFn: async (): Promise<QuizDetailResponse> => {
      const [quizRes, questionsRes] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", quizId).maybeSingle(),
        supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("order_index", { ascending: true }),
      ]);

      if (quizRes.error) throw quizRes.error;
      if (questionsRes.error) throw questionsRes.error;

      return {
        quiz: quizRes.data ? [quizRes.data] : [],
        questions: questionsRes.data || [],
        userAnswers: null,
      };
    },
    enabled: !!quizId,
    staleTime: 30000, // 30 seconds
  });
};
