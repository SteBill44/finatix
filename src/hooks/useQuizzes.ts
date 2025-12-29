import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number;
}

export const useQuizzes = (courseId?: string) => {
  return useQuery({
    queryKey: ["quizzes", courseId],
    queryFn: async () => {
      let query = supabase
        .from("quizzes")
        .select("*")
        .order("order_index", { ascending: true });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Quiz[];
    },
  });
};

export const useQuizQuestions = (quizId: string, includeAnswers: boolean = false) => {
  return useQuery({
    queryKey: ["quiz_questions", quizId, includeAnswers],
    queryFn: async () => {
      // Use the secure RPC function that hides answers until quiz is attempted
      const { data, error } = await supabase
        .rpc("get_quiz_questions", { _quiz_id: quizId });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map((q: any) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        options: q.options as string[],
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index,
      })) as QuizQuestion[];
    },
    enabled: !!quizId,
  });
};

export const useQuizWithQuestions = (quizId: string) => {
  const quizQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          courses (
            id,
            title,
            slug
          )
        `)
        .eq("id", quizId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!quizId,
  });

  const questionsQuery = useQuizQuestions(quizId);

  return {
    quiz: quizQuery.data,
    questions: questionsQuery.data || [],
    isLoading: quizQuery.isLoading || questionsQuery.isLoading,
    error: quizQuery.error || questionsQuery.error,
    refetchQuestions: questionsQuery.refetch,
  };
};
