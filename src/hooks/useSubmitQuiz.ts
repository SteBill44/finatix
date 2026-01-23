import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Answer } from "@/components/quiz/QuestionRenderer";

interface SubmitQuizParams {
  quizId: string;
  answers: Record<number, Answer>;
  timeTakenSeconds?: number;
}

interface SubmitQuizResponse {
  success: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  attemptId: string;
}

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ quizId, answers, timeTakenSeconds }: SubmitQuizParams): Promise<SubmitQuizResponse> => {
      if (!user) {
        throw new Error("You must be signed in to submit a quiz");
      }

      // Convert Answer objects to simple values for the edge function
      const simplifiedAnswers: Record<number, number | number[] | string | string[] | Record<string, string> | null> = {};
      Object.entries(answers).forEach(([index, answer]) => {
        const idx = parseInt(index);
        if (answer === null || answer === undefined) {
          simplifiedAnswers[idx] = null;
        } else {
          simplifiedAnswers[idx] = answer;
        }
      });

      const { data, error } = await supabase.functions.invoke("submit-quiz", {
        body: { 
          quizId, 
          answers: simplifiedAnswers,
          timeTakenSeconds 
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to submit quiz");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as SubmitQuizResponse;
    },
    onSuccess: () => {
      // Invalidate quiz attempts to refresh data
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
    },
  });
};
