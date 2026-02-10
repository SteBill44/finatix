import { useQuery } from "@tanstack/react-query";
import { from, rpc } from "@/lib/api/client";

export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export type QuestionType = 'multiple_choice' | 'multiple_response' | 'number_entry' | 'hotspot' | 'drag_drop';

export interface HotspotRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isCorrect: boolean;
}

export interface DragItem {
  id: string;
  text: string;
  correctPosition?: number;
  matchTarget?: string;
}

export interface DragTarget {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: number;
  correct_answers?: number[];
  number_answer?: number;
  number_tolerance?: number;
  image_url?: string;
  hotspot_regions?: HotspotRegion[];
  drag_items?: DragItem[];
  drag_targets?: DragTarget[];
  explanation: string | null;
  order_index: number;
}

export const useQuizzes = (courseId?: string, lessonId?: string) => {
  return useQuery({
    queryKey: ["quizzes", courseId, lessonId],
    queryFn: async () => {
      let query = from("quizzes").select("*").order("order_index", { ascending: true });
      if (courseId) query = query.eq("course_id", courseId);
      if (lessonId) query = query.eq("lesson_id", lessonId);
      const { data, error } = await query;
      if (error) throw error;
      return data as (Quiz & { lesson_id?: string })[];
    },
  });
};

export const useLessonQuizAttempts = (lessonId?: string) => {
  return useQuery({
    queryKey: ["lesson_quiz_attempts", lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      const { data: quizzes, error: quizzesError } = await from("quizzes")
        .select("id")
        .eq("lesson_id", lessonId);
      if (quizzesError) throw quizzesError;
      if (!quizzes || quizzes.length === 0) return [];

      const quizIds = quizzes.map(q => q.id);
      const { data: attempts, error: attemptsError } = await from("quiz_attempts")
        .select("*, quizzes(title)")
        .in("quiz_id", quizIds)
        .order("attempted_at", { ascending: false });
      if (attemptsError) throw attemptsError;
      return attempts || [];
    },
    enabled: !!lessonId,
  });
};

export const useQuizQuestions = (quizId: string, includeAnswers: boolean = false) => {
  return useQuery({
    queryKey: ["quiz_questions", quizId, includeAnswers],
    queryFn: async () => {
      const result = await rpc("get_quiz_questions", { _quiz_id: quizId });
      if (result.error) throw result.error;
      return ((result.data as any[]) || []).map((q: any) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        question_type: q.question_type || 'multiple_choice',
        options: q.options as string[],
        correct_answer: q.correct_answer,
        correct_answers: q.correct_answers,
        number_answer: q.number_answer,
        number_tolerance: q.number_tolerance,
        image_url: q.image_url,
        hotspot_regions: q.hotspot_regions,
        drag_items: q.drag_items,
        drag_targets: q.drag_targets,
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
      const { data, error } = await from("quizzes")
        .select(`*, courses (id, title, slug)`)
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
