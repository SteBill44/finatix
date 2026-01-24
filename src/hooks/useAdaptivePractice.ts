import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { HotspotRegion, DragItem, DragTarget, QuestionType } from "./useQuizzes";

export interface PracticeQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  difficulty_level: string;
  syllabus_area_index: number | null;
  order_index: number;
  image_url?: string;
  hotspot_regions?: HotspotRegion[];
  drag_items?: DragItem[];
  drag_targets?: DragTarget[];
}

export interface PracticeSessionConfig {
  courseId: string;
  questionCount?: number;
  focusSyllabusArea?: number; // Optional: focus on specific area
  difficultyFilter?: "easy" | "medium" | "hard"; // Optional: specific difficulty
}

export function useAdaptivePracticeQuestions(config: PracticeSessionConfig | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adaptive-practice", config?.courseId, config?.questionCount, config?.focusSyllabusArea],
    queryFn: async () => {
      if (!config || !user) return [];

      // Try to use the adaptive function first
      const { data: adaptiveData, error: adaptiveError } = await supabase.rpc(
        "get_adaptive_practice_questions",
        {
          p_course_id: config.courseId,
          p_count: config.questionCount || 10,
        }
      );

      if (!adaptiveError && adaptiveData && adaptiveData.length > 0) {
        // Transform the RPC result to match our interface
        return (adaptiveData as unknown[]).map((q: unknown) => {
          const item = q as Record<string, unknown>;
          return {
            id: item.id as string,
            quiz_id: item.quiz_id as string,
            question: item.question as string,
            question_type: (item.question_type || "multiple_choice") as QuestionType,
            options: (item.options || []) as string[],
            difficulty_level: (item.difficulty_level || "medium") as string,
            syllabus_area_index: item.syllabus_area_index as number | null,
            order_index: 0,
            image_url: item.image_url as string | undefined,
            hotspot_regions: item.hotspot_regions as HotspotRegion[] | undefined,
            drag_items: item.drag_items as DragItem[] | undefined,
            drag_targets: item.drag_targets as DragTarget[] | undefined,
          };
        }) as PracticeQuestion[];
      }

      // Fallback: Get random questions from practice pool
      let query = supabase
        .from("quiz_questions")
        .select(`
          id,
          quiz_id,
          question,
          question_type,
          options,
          difficulty_level,
          syllabus_area_index,
          image_url,
          hotspot_regions,
          drag_items,
          drag_targets,
          order_index,
          quizzes!inner(course_id)
        `)
        .eq("is_practice_pool", true)
        .eq("quizzes.course_id", config.courseId);

      if (config.focusSyllabusArea !== undefined) {
        query = query.eq("syllabus_area_index", config.focusSyllabusArea);
      }

      if (config.difficultyFilter) {
        query = query.eq("difficulty_level", config.difficultyFilter);
      }

      const { data, error } = await query.limit(config.questionCount || 10);

      if (error) throw error;

      // Shuffle and transform the questions
      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      
      return shuffled.map((q) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        question_type: (q.question_type || "multiple_choice") as QuestionType,
        options: (q.options || []) as string[],
        difficulty_level: q.difficulty_level || "medium",
        syllabus_area_index: q.syllabus_area_index,
        order_index: q.order_index,
        image_url: q.image_url || undefined,
        hotspot_regions: q.hotspot_regions as unknown as HotspotRegion[] | undefined,
        drag_items: q.drag_items as unknown as DragItem[] | undefined,
        drag_targets: q.drag_targets as unknown as DragTarget[] | undefined,
      })) as PracticeQuestion[];
    },
    enabled: !!config && !!user,
    staleTime: 0, // Always get fresh questions
  });
}

export function useSubmitPracticeAnswer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      courseId,
      syllabusAreaIndex,
      isCorrect,
      timeTakenSeconds,
    }: {
      questionId: string;
      courseId: string;
      syllabusAreaIndex: number | null;
      isCorrect: boolean;
      timeTakenSeconds?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Record the attempt
      const { error: attemptError } = await supabase
        .from("user_question_attempts")
        .insert({
          user_id: user.id,
          question_id: questionId,
          course_id: courseId,
          syllabus_area_index: syllabusAreaIndex,
          is_correct: isCorrect,
          time_taken_seconds: timeTakenSeconds,
        });

      if (attemptError) throw attemptError;

      // Update mastery if we have a syllabus area
      if (syllabusAreaIndex !== null) {
        // Get the syllabus to find the area title
        const { data: syllabus } = await supabase
          .from("course_syllabuses")
          .select("syllabus_areas")
          .eq("course_id", courseId)
          .maybeSingle();

        const areas = (syllabus?.syllabus_areas as Array<{ title: string }>) || [];
        const areaTitle = areas[syllabusAreaIndex]?.title || `Area ${syllabusAreaIndex + 1}`;

        await supabase.rpc("update_syllabus_mastery", {
          p_user_id: user.id,
          p_course_id: courseId,
          p_syllabus_area_index: syllabusAreaIndex,
          p_syllabus_area_title: areaTitle,
          p_is_correct: isCorrect,
        });
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate mastery queries
      queryClient.invalidateQueries({
        queryKey: ["syllabus-mastery", variables.courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["question-attempt-stats", variables.courseId],
      });
    },
  });
}

export function usePracticePoolStats(courseId?: string) {
  return useQuery({
    queryKey: ["practice-pool-stats", courseId],
    queryFn: async () => {
      if (!courseId) return null;

      // Get count of practice pool questions per syllabus area
      const { data: questions, error } = await supabase
        .from("quiz_questions")
        .select(`
          id,
          syllabus_area_index,
          difficulty_level,
          quizzes!inner(course_id)
        `)
        .eq("is_practice_pool", true)
        .eq("quizzes.course_id", courseId);

      if (error) throw error;

      const totalQuestions = questions?.length || 0;
      
      // Group by syllabus area
      const byArea = new Map<number, { easy: number; medium: number; hard: number; total: number }>();
      
      questions?.forEach((q) => {
        const areaIndex = q.syllabus_area_index ?? -1;
        const existing = byArea.get(areaIndex) || { easy: 0, medium: 0, hard: 0, total: 0 };
        existing.total++;
        if (q.difficulty_level === "easy") existing.easy++;
        else if (q.difficulty_level === "hard") existing.hard++;
        else existing.medium++;
        byArea.set(areaIndex, existing);
      });

      const areaStats = Array.from(byArea.entries())
        .filter(([index]) => index >= 0)
        .map(([index, stats]) => ({
          syllabus_area_index: index,
          ...stats,
        }))
        .sort((a, b) => a.syllabus_area_index - b.syllabus_area_index);

      // Difficulty distribution
      const difficultyDistribution = {
        easy: questions?.filter((q) => q.difficulty_level === "easy").length || 0,
        medium: questions?.filter((q) => q.difficulty_level === "medium").length || 0,
        hard: questions?.filter((q) => q.difficulty_level === "hard").length || 0,
      };

      return {
        totalQuestions,
        areaStats,
        difficultyDistribution,
      };
    },
    enabled: !!courseId,
  });
}
