import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  calculateReadinessScore, 
  type ReadinessResult, 
  type QuizAttemptWithDate,
  type SyllabusAreaMastery 
} from "@/lib/examReadiness";
import { startOfMonth, endOfMonth } from "date-fns";

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
      
      // Get quiz attempts with dates for recency weighting
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("score, max_score, attempted_at, quiz_id")
        .eq("user_id", user!.id)
        .eq("course_id", courseId!)
        .order("attempted_at");
      
      const quizAttemptsWithDates: QuizAttemptWithDate[] = quizAttempts?.map(a => ({
        score: a.score,
        maxScore: a.max_score,
        attemptedAt: new Date(a.attempted_at),
      })) || [];
      
      // Legacy quiz scores for backward compatibility
      const quizScores = quizAttempts?.map(a => 
        a.max_score > 0 ? (a.score / a.max_score) * 100 : 0
      ) || [];
      
      // Get syllabus data for the course
      const { data: syllabus } = await supabase
        .from("course_syllabuses")
        .select("syllabus_areas")
        .eq("course_id", courseId!)
        .single();
      
      // Get quiz questions with syllabus area mapping
      const quizIds = [...new Set(quizAttempts?.map(a => a.quiz_id).filter(Boolean) || [])];
      
      let syllabusAreaMastery: SyllabusAreaMastery[] = [];
      let totalSyllabusAreas = 0;
      
      if (syllabus?.syllabus_areas && quizIds.length > 0) {
        const areas = syllabus.syllabus_areas as Array<{ title: string }>;
        totalSyllabusAreas = areas.length;
        
        // Get all quiz questions for the user's attempted quizzes
        const { data: questions } = await supabase
          .from("quiz_questions")
          .select("id, quiz_id, syllabus_area_index, correct_answer")
          .in("quiz_id", quizIds);
        
        if (questions && questions.length > 0) {
          // For simplicity, we'll estimate mastery based on overall quiz performance per area
          // In a full implementation, you'd track individual question responses
          const areaPerformance: Map<number, { total: number; correct: number }> = new Map();
          
          // Group questions by syllabus area and estimate performance
          for (const q of questions) {
            const areaIndex = q.syllabus_area_index ?? 0;
            if (!areaPerformance.has(areaIndex)) {
              areaPerformance.set(areaIndex, { total: 0, correct: 0 });
            }
            const area = areaPerformance.get(areaIndex)!;
            area.total += 1;
            
            // Estimate correct based on overall quiz performance
            const quizAttempt = quizAttempts?.find(a => a.quiz_id === q.quiz_id);
            if (quizAttempt && quizAttempt.max_score > 0) {
              const successRate = quizAttempt.score / quizAttempt.max_score;
              area.correct += successRate; // Weighted contribution
            }
          }
          
          syllabusAreaMastery = areas.map((area, index) => {
            const perf = areaPerformance.get(index);
            return {
              areaIndex: index,
              areaName: area.title || `Area ${index + 1}`,
              totalQuestions: perf?.total || 0,
              correctAnswers: Math.round(perf?.correct || 0),
              masteryPercentage: perf && perf.total > 0 
                ? (perf.correct / perf.total) * 100 
                : 0,
            };
          });
        }
      }
      
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
      
      // Get mock exam scores (quizzes with 10+ questions)
      const mockExamScores = quizAttempts
        ?.filter(a => a.max_score >= 10)
        .map(a => a.max_score > 0 ? (a.score / a.max_score) * 100 : 0) || [];
      
      return calculateReadinessScore({
        completedLessons,
        totalLessons,
        quizScores,
        quizAttemptsWithDates,
        studyHoursThisMonth,
        recommendedHoursPerMonth,
        mockExamScores,
        syllabusAreaMastery,
        totalSyllabusAreas,
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
      
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get all lessons for enrolled courses
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
      
      // Get all quiz attempts with dates
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("score, max_score, attempted_at, quiz_id, course_id")
        .eq("user_id", user!.id)
        .in("course_id", courseIds)
        .order("attempted_at");
      
      const quizAttemptsWithDates: QuizAttemptWithDate[] = quizAttempts?.map(a => ({
        score: a.score,
        maxScore: a.max_score,
        attemptedAt: new Date(a.attempted_at),
      })) || [];
      
      const quizScores = quizAttempts?.map(a => 
        a.max_score > 0 ? (a.score / a.max_score) * 100 : 0
      ) || [];
      
      // Get syllabus data for all enrolled courses
      const { data: syllabuses } = await supabase
        .from("course_syllabuses")
        .select("course_id, syllabus_areas")
        .in("course_id", courseIds);
      
      // Calculate overall syllabus mastery across all courses
      let syllabusAreaMastery: SyllabusAreaMastery[] = [];
      let totalSyllabusAreas = 0;
      
      if (syllabuses && syllabuses.length > 0) {
        const quizIds = [...new Set(quizAttempts?.map(a => a.quiz_id).filter(Boolean) || [])];
        
        if (quizIds.length > 0) {
          const { data: questions } = await supabase
            .from("quiz_questions")
            .select("id, quiz_id, syllabus_area_index")
            .in("quiz_id", quizIds);
          
          // Aggregate all syllabus areas across courses
          const allAreas: Array<{ title: string; courseId: string }> = [];
          for (const syl of syllabuses) {
            const areas = syl.syllabus_areas as Array<{ title: string }>;
            if (areas) {
              areas.forEach((area, idx) => {
                allAreas.push({ title: area.title || `Area ${idx + 1}`, courseId: syl.course_id });
              });
            }
          }
          totalSyllabusAreas = allAreas.length;
          
          if (questions && questions.length > 0) {
            const areaPerformance: Map<string, { total: number; correct: number }> = new Map();
            
            for (const q of questions) {
              const quizAttempt = quizAttempts?.find(a => a.quiz_id === q.quiz_id);
              if (!quizAttempt) continue;
              
              const areaKey = `${quizAttempt.course_id}-${q.syllabus_area_index ?? 0}`;
              if (!areaPerformance.has(areaKey)) {
                areaPerformance.set(areaKey, { total: 0, correct: 0 });
              }
              const area = areaPerformance.get(areaKey)!;
              area.total += 1;
              
              if (quizAttempt.max_score > 0) {
                const successRate = quizAttempt.score / quizAttempt.max_score;
                area.correct += successRate;
              }
            }
            
            let areaIndex = 0;
            for (const syl of syllabuses) {
              const areas = syl.syllabus_areas as Array<{ title: string }>;
              if (areas) {
                areas.forEach((area, idx) => {
                  const areaKey = `${syl.course_id}-${idx}`;
                  const perf = areaPerformance.get(areaKey);
                  syllabusAreaMastery.push({
                    areaIndex: areaIndex++,
                    areaName: area.title || `Area ${idx + 1}`,
                    totalQuestions: perf?.total || 0,
                    correctAnswers: Math.round(perf?.correct || 0),
                    masteryPercentage: perf && perf.total > 0 
                      ? (perf.correct / perf.total) * 100 
                      : 0,
                  });
                });
              }
            }
          }
        }
      }
      
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
      
      // Get mock exam scores
      const mockExamScores = quizAttempts
        ?.filter(a => a.max_score >= 10)
        .map(a => a.max_score > 0 ? (a.score / a.max_score) * 100 : 0) || [];
      
      return calculateReadinessScore({
        completedLessons,
        totalLessons,
        quizScores,
        quizAttemptsWithDates,
        studyHoursThisMonth: studyMinutesThisMonth / 60,
        recommendedHoursPerMonth: 40 * courseIds.length,
        mockExamScores,
        syllabusAreaMastery,
        totalSyllabusAreas,
      });
    },
    enabled: !!user,
  });
};
