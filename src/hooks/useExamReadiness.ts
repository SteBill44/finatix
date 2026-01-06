import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateReadinessScore, type ReadinessResult } from "@/lib/examReadiness";
import { differenceInDays, startOfMonth, endOfMonth } from "date-fns";

export const useExamReadiness = (courseId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["exam-readiness", courseId, user?.id],
    queryFn: async (): Promise<ReadinessResult> => {
      // Get total lessons for the course
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId!);
      
      const totalLessons = lessons?.length || 0;
      
      // Get completed lessons
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user!.id)
        .eq("completed", true);
      
      const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);
      const completedLessons = lessons?.filter(l => completedLessonIds.has(l.id)).length || 0;
      
      // Get quiz scores for this course
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("score, max_score, attempted_at")
        .eq("user_id", user!.id)
        .eq("course_id", courseId!)
        .order("attempted_at");
      
      const quizScores = quizAttempts?.map(a => 
        a.max_score > 0 ? (a.score / a.max_score) * 100 : 0
      ) || [];
      
      // Get study time this month
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      
      const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", user!.id)
        .eq("course_id", courseId!)
        .gte("started_at", monthStart.toISOString())
        .lte("started_at", monthEnd.toISOString());
      
      const studyMinutesThisMonth = studySessions?.reduce(
        (sum, s) => sum + (s.duration_minutes || 0), 0
      ) || 0;
      const studyHoursThisMonth = studyMinutesThisMonth / 60;
      
      // Recommended hours per month (assuming 10 hours/week = 40 hours/month)
      const recommendedHoursPerMonth = 40;
      
      // Get mock exam scores (quizzes associated with lessons, larger quiz attempts)
      const mockExamScores = quizAttempts
        ?.filter(a => a.max_score >= 10) // Consider quizzes with 10+ questions as mock exams
        .map(a => a.max_score > 0 ? (a.score / a.max_score) * 100 : 0) || [];
      
      return calculateReadinessScore({
        completedLessons,
        totalLessons,
        quizScores,
        studyHoursThisMonth,
        recommendedHoursPerMonth,
        mockExamScores,
      });
    },
    enabled: !!courseId && !!user,
  });
};

// Get overall readiness across all enrolled courses
export const useOverallReadiness = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["overall-readiness", user?.id],
    queryFn: async () => {
      // Get all enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user!.id);
      
      if (!enrollments?.length) return null;
      
      // Get all lessons for enrolled courses
      const courseIds = enrollments.map(e => e.course_id);
      
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", courseIds);
      
      const totalLessons = lessons?.length || 0;
      
      // Get completed lessons
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user!.id)
        .eq("completed", true);
      
      const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);
      const completedLessons = lessons?.filter(l => completedLessonIds.has(l.id)).length || 0;
      
      // Get all quiz scores
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("score, max_score")
        .eq("user_id", user!.id)
        .in("course_id", courseIds);
      
      const quizScores = quizAttempts?.map(a => 
        a.max_score > 0 ? (a.score / a.max_score) * 100 : 0
      ) || [];
      
      // Get study time this month
      const monthStart = startOfMonth(new Date());
      
      const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", user!.id)
        .gte("started_at", monthStart.toISOString());
      
      const studyMinutesThisMonth = studySessions?.reduce(
        (sum, s) => sum + (s.duration_minutes || 0), 0
      ) || 0;
      
      return calculateReadinessScore({
        completedLessons,
        totalLessons,
        quizScores,
        studyHoursThisMonth: studyMinutesThisMonth / 60,
        recommendedHoursPerMonth: 40 * courseIds.length, // Scale by number of courses
      });
    },
    enabled: !!user,
  });
};
