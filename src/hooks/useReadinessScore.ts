import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReadinessScore {
  overall: number;
  lessonProgress: number;
  quizPerformance: number;
  mockExamPerformance: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesTaken: number;
  averageQuizScore: number;
  mockExamsTaken: number;
  averageMockScore: number;
  level: "not-started" | "beginning" | "developing" | "proficient" | "ready";
}

const getReadinessLevel = (score: number): ReadinessScore["level"] => {
  if (score === 0) return "not-started";
  if (score < 25) return "beginning";
  if (score < 50) return "developing";
  if (score < 75) return "proficient";
  return "ready";
};

export const useReadinessScore = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["readiness_score", user?.id, courseId],
    queryFn: async (): Promise<ReadinessScore> => {
      if (!user || !courseId) {
        return {
          overall: 0,
          lessonProgress: 0,
          quizPerformance: 0,
          mockExamPerformance: 0,
          lessonsCompleted: 0,
          totalLessons: 0,
          quizzesTaken: 0,
          averageQuizScore: 0,
          mockExamsTaken: 0,
          averageMockScore: 0,
          level: "not-started",
        };
      }

      // Get all lessons for the course
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId);

      const totalLessons = lessons?.length || 0;

      // Get completed lessons
      const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true);

      const lessonIds = new Set(lessons?.map((l) => l.id) || []);
      const completedLessons =
        lessonProgress?.filter((p) => lessonIds.has(p.lesson_id)).length || 0;

      // Get all quizzes for the course (excluding mock exams - those have lesson_id as null and specific naming)
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, title")
        .eq("course_id", courseId);

      // Separate regular quizzes from mock exams (mock exams typically have "mock" in title)
      const regularQuizIds =
        quizzes
          ?.filter((q) => !q.title.toLowerCase().includes("mock"))
          .map((q) => q.id) || [];
      const mockExamIds =
        quizzes
          ?.filter((q) => q.title.toLowerCase().includes("mock"))
          .map((q) => q.id) || [];

      // Get quiz attempts for regular quizzes
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score, max_score")
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      // Calculate regular quiz performance (best attempt per quiz)
      const regularQuizAttempts = quizAttempts?.filter(
        (a) => a.quiz_id && regularQuizIds.includes(a.quiz_id)
      );
      const quizBestScores = new Map<string, number>();
      regularQuizAttempts?.forEach((attempt) => {
        if (attempt.quiz_id) {
          const percentage = (attempt.score / attempt.max_score) * 100;
          const current = quizBestScores.get(attempt.quiz_id) || 0;
          if (percentage > current) {
            quizBestScores.set(attempt.quiz_id, percentage);
          }
        }
      });
      const quizzesTaken = quizBestScores.size;
      const averageQuizScore =
        quizzesTaken > 0
          ? Array.from(quizBestScores.values()).reduce((a, b) => a + b, 0) /
            quizzesTaken
          : 0;

      // Calculate mock exam performance (best attempt per mock)
      const mockExamAttempts = quizAttempts?.filter(
        (a) => a.quiz_id && mockExamIds.includes(a.quiz_id)
      );
      const mockBestScores = new Map<string, number>();
      mockExamAttempts?.forEach((attempt) => {
        if (attempt.quiz_id) {
          const percentage = (attempt.score / attempt.max_score) * 100;
          const current = mockBestScores.get(attempt.quiz_id) || 0;
          if (percentage > current) {
            mockBestScores.set(attempt.quiz_id, percentage);
          }
        }
      });
      const mockExamsTaken = mockBestScores.size;
      const averageMockScore =
        mockExamsTaken > 0
          ? Array.from(mockBestScores.values()).reduce((a, b) => a + b, 0) /
            mockExamsTaken
          : 0;

      // Calculate component scores (0-100)
      const lessonProgressScore =
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const quizPerformanceScore = averageQuizScore;
      const mockExamPerformanceScore = averageMockScore;

      // Weight the scores: Lessons 40%, Quizzes 40%, Mock Exams 20%
      // Adjust weights if no quizzes or mock exams exist
      let lessonWeight = 0.4;
      let quizWeight = 0.4;
      let mockWeight = 0.2;

      if (regularQuizIds.length === 0 && mockExamIds.length === 0) {
        lessonWeight = 1.0;
        quizWeight = 0;
        mockWeight = 0;
      } else if (regularQuizIds.length === 0) {
        lessonWeight = 0.6;
        quizWeight = 0;
        mockWeight = 0.4;
      } else if (mockExamIds.length === 0) {
        lessonWeight = 0.5;
        quizWeight = 0.5;
        mockWeight = 0;
      }

      const overallScore = Math.round(
        lessonProgressScore * lessonWeight +
          quizPerformanceScore * quizWeight +
          mockExamPerformanceScore * mockWeight
      );

      return {
        overall: overallScore,
        lessonProgress: Math.round(lessonProgressScore),
        quizPerformance: Math.round(quizPerformanceScore),
        mockExamPerformance: Math.round(mockExamPerformanceScore),
        lessonsCompleted: completedLessons,
        totalLessons,
        quizzesTaken,
        averageQuizScore: Math.round(averageQuizScore),
        mockExamsTaken,
        averageMockScore: Math.round(averageMockScore),
        level: getReadinessLevel(overallScore),
      };
    },
    enabled: !!user && !!courseId,
  });
};
