import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SyllabusMastery {
  id: string;
  course_id: string;
  syllabus_area_index: number;
  syllabus_area_title: string | null;
  questions_attempted: number;
  questions_correct: number;
  mastery_score: number;
  last_attempted_at: string | null;
}

export interface MasteryLevel {
  level: "weak" | "medium" | "strong";
  color: string;
  label: string;
}

export function getMasteryLevel(score: number): MasteryLevel {
  if (score < 50) {
    return { level: "weak", color: "text-destructive", label: "Needs Work" };
  } else if (score < 75) {
    return { level: "medium", color: "text-yellow-500", label: "Developing" };
  } else {
    return { level: "strong", color: "text-accent", label: "Strong" };
  }
}

export function useSyllabusMastery(courseId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["syllabus-mastery", courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user) return [];

      const { data, error } = await supabase
        .from("user_syllabus_mastery")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .order("syllabus_area_index");

      if (error) throw error;
      return data as SyllabusMastery[];
    },
    enabled: !!courseId && !!user,
  });
}

export function useQuestionAttemptStats(courseId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["question-attempt-stats", courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user) {
        return {
          totalAttempted: 0,
          totalCorrect: 0,
          recentAccuracy: 0,
          attemptsByArea: [] as Array<{
            syllabus_area_index: number;
            total: number;
            correct: number;
          }>,
        };
      }

      // Get all attempts for this course
      const { data: attempts, error } = await supabase
        .from("user_question_attempts")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false });

      if (error) throw error;

      const totalAttempted = attempts?.length || 0;
      const totalCorrect = attempts?.filter((a) => a.is_correct).length || 0;

      // Calculate recent accuracy (last 50 questions)
      const recent = attempts?.slice(0, 50) || [];
      const recentCorrect = recent.filter((a) => a.is_correct).length;
      const recentAccuracy = recent.length > 0 
        ? Math.round((recentCorrect / recent.length) * 100) 
        : 0;

      // Group by syllabus area
      const byArea = new Map<number, { total: number; correct: number }>();
      attempts?.forEach((a) => {
        if (a.syllabus_area_index !== null) {
          const existing = byArea.get(a.syllabus_area_index) || { total: 0, correct: 0 };
          existing.total++;
          if (a.is_correct) existing.correct++;
          byArea.set(a.syllabus_area_index, existing);
        }
      });

      const attemptsByArea = Array.from(byArea.entries()).map(([index, stats]) => ({
        syllabus_area_index: index,
        ...stats,
      }));

      return {
        totalAttempted,
        totalCorrect,
        recentAccuracy,
        attemptsByArea,
      };
    },
    enabled: !!courseId && !!user,
  });
}
