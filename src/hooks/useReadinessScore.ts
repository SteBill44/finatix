import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WeakArea {
  type: "lesson" | "quiz" | "mock";
  title: string;
  score: number;
  recommendation: string;
  priority: "high" | "medium" | "low";
  lessonId?: string;
  quizId?: string;
}

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
  weakAreas: WeakArea[];
  recencyBonus: number;
  lastActivityDays: number | null;
}

const getReadinessLevel = (score: number): ReadinessScore["level"] => {
  if (score === 0) return "not-started";
  if (score < 25) return "beginning";
  if (score < 50) return "developing";
  if (score < 75) return "proficient";
  return "ready";
};

// Calculate recency weight - more recent activity gets higher weight
const getRecencyWeight = (daysAgo: number): number => {
  if (daysAgo <= 7) return 1.0; // Full weight for last week
  if (daysAgo <= 14) return 0.9; // 90% for 1-2 weeks
  if (daysAgo <= 30) return 0.75; // 75% for 2-4 weeks
  if (daysAgo <= 60) return 0.5; // 50% for 1-2 months
  return 0.25; // 25% for older than 2 months
};

const getDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
          weakAreas: [],
          recencyBonus: 0,
          lastActivityDays: null,
        };
      }

      // Get all lessons for the course with their titles
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, order_index")
        .eq("course_id", courseId)
        .order("order_index");

      const totalLessons = lessons?.length || 0;

      // Get completed lessons with completion dates
      const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, completed_at")
        .eq("user_id", user.id)
        .eq("completed", true);

      const lessonIds = new Set(lessons?.map((l) => l.id) || []);
      const completedLessonIds = new Set(
        lessonProgress?.filter((p) => lessonIds.has(p.lesson_id)).map((p) => p.lesson_id) || []
      );
      const completedLessons = completedLessonIds.size;

      // Track incomplete lessons for recommendations
      const incompleteLessons = lessons?.filter((l) => !completedLessonIds.has(l.id)) || [];

      // Get all quizzes for the course with lesson associations
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, title, lesson_id")
        .eq("course_id", courseId);

      // Separate regular quizzes from mock exams
      const regularQuizzes = quizzes?.filter((q) => !q.title.toLowerCase().includes("mock")) || [];
      const mockExams = quizzes?.filter((q) => q.title.toLowerCase().includes("mock")) || [];
      const regularQuizIds = regularQuizzes.map((q) => q.id);
      const mockExamIds = mockExams.map((q) => q.id);

      // Get quiz attempts with timestamps for recency calculation
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score, max_score, attempted_at")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .order("attempted_at", { ascending: false });

      // Calculate regular quiz performance with recency weighting
      const regularQuizAttempts = quizAttempts?.filter(
        (a) => a.quiz_id && regularQuizIds.includes(a.quiz_id)
      );

      // Get best and most recent attempt per quiz, weighted by recency
      const quizScores = new Map<string, { score: number; recencyWeight: number; title: string }>();
      regularQuizAttempts?.forEach((attempt) => {
        if (attempt.quiz_id) {
          const percentage = (attempt.score / attempt.max_score) * 100;
          const daysAgo = getDaysSince(attempt.attempted_at);
          const recencyWeight = getRecencyWeight(daysAgo);
          const quiz = regularQuizzes.find((q) => q.id === attempt.quiz_id);

          const current = quizScores.get(attempt.quiz_id);
          // Use the better of: higher score or more recent with decent score
          const weightedScore = percentage * recencyWeight;
          const currentWeightedScore = current ? current.score * current.recencyWeight : 0;

          if (!current || weightedScore > currentWeightedScore) {
            quizScores.set(attempt.quiz_id, {
              score: percentage,
              recencyWeight,
              title: quiz?.title || "Quiz",
            });
          }
        }
      });

      const quizzesTaken = quizScores.size;
      let averageQuizScore = 0;
      if (quizzesTaken > 0) {
        const totalWeightedScore = Array.from(quizScores.values()).reduce(
          (sum, q) => sum + q.score * q.recencyWeight,
          0
        );
        const totalWeight = Array.from(quizScores.values()).reduce(
          (sum, q) => sum + q.recencyWeight,
          0
        );
        averageQuizScore = totalWeightedScore / totalWeight;
      }

      // Calculate mock exam performance with recency weighting
      const mockExamAttempts = quizAttempts?.filter(
        (a) => a.quiz_id && mockExamIds.includes(a.quiz_id)
      );

      const mockScores = new Map<string, { score: number; recencyWeight: number; title: string }>();
      mockExamAttempts?.forEach((attempt) => {
        if (attempt.quiz_id) {
          const percentage = (attempt.score / attempt.max_score) * 100;
          const daysAgo = getDaysSince(attempt.attempted_at);
          const recencyWeight = getRecencyWeight(daysAgo);
          const mock = mockExams.find((m) => m.id === attempt.quiz_id);

          const current = mockScores.get(attempt.quiz_id);
          const weightedScore = percentage * recencyWeight;
          const currentWeightedScore = current ? current.score * current.recencyWeight : 0;

          if (!current || weightedScore > currentWeightedScore) {
            mockScores.set(attempt.quiz_id, {
              score: percentage,
              recencyWeight,
              title: mock?.title || "Mock Exam",
            });
          }
        }
      });

      const mockExamsTaken = mockScores.size;
      let averageMockScore = 0;
      if (mockExamsTaken > 0) {
        const totalWeightedScore = Array.from(mockScores.values()).reduce(
          (sum, m) => sum + m.score * m.recencyWeight,
          0
        );
        const totalWeight = Array.from(mockScores.values()).reduce(
          (sum, m) => sum + m.recencyWeight,
          0
        );
        averageMockScore = totalWeightedScore / totalWeight;
      }

      // Calculate last activity and recency bonus
      let lastActivityDays: number | null = null;
      const allAttemptDates = quizAttempts?.map((a) => getDaysSince(a.attempted_at)) || [];
      const lessonCompletionDates = lessonProgress
        ?.filter((p) => p.completed_at)
        .map((p) => getDaysSince(p.completed_at!)) || [];
      const allActivityDays = [...allAttemptDates, ...lessonCompletionDates];

      if (allActivityDays.length > 0) {
        lastActivityDays = Math.min(...allActivityDays);
      }

      // Recency bonus: up to 10% boost for recent activity
      let recencyBonus = 0;
      if (lastActivityDays !== null) {
        if (lastActivityDays <= 3) recencyBonus = 10;
        else if (lastActivityDays <= 7) recencyBonus = 7;
        else if (lastActivityDays <= 14) recencyBonus = 4;
        else if (lastActivityDays <= 30) recencyBonus = 2;
      }

      // Calculate component scores
      const lessonProgressScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const quizPerformanceScore = averageQuizScore;
      const mockExamPerformanceScore = averageMockScore;

      // Weight the scores: Lessons 35%, Quizzes 35%, Mock Exams 20%, Recency 10%
      let lessonWeight = 0.35;
      let quizWeight = 0.35;
      let mockWeight = 0.2;
      let recencyWeight = 0.1;

      if (regularQuizIds.length === 0 && mockExamIds.length === 0) {
        lessonWeight = 0.9;
        quizWeight = 0;
        mockWeight = 0;
        recencyWeight = 0.1;
      } else if (regularQuizIds.length === 0) {
        lessonWeight = 0.5;
        quizWeight = 0;
        mockWeight = 0.4;
        recencyWeight = 0.1;
      } else if (mockExamIds.length === 0) {
        lessonWeight = 0.45;
        quizWeight = 0.45;
        mockWeight = 0;
        recencyWeight = 0.1;
      }

      const overallScore = Math.min(
        100,
        Math.round(
          lessonProgressScore * lessonWeight +
            quizPerformanceScore * quizWeight +
            mockExamPerformanceScore * mockWeight +
            recencyBonus * recencyWeight * 10
        )
      );

      // Identify weak areas for recommendations
      const weakAreas: WeakArea[] = [];

      // Add incomplete lessons (prioritize early lessons first)
      incompleteLessons.slice(0, 3).forEach((lesson) => {
        weakAreas.push({
          type: "lesson",
          title: lesson.title,
          score: 0,
          recommendation: `Complete lesson "${lesson.title}" to build your foundation`,
          priority: lesson.order_index < 3 ? "high" : "medium",
          lessonId: lesson.id,
        });
      });

      // Add quizzes with low scores (below 70%)
      Array.from(quizScores.entries())
        .filter(([, data]) => data.score < 70)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 3)
        .forEach(([quizId, data]) => {
          weakAreas.push({
            type: "quiz",
            title: data.title,
            score: Math.round(data.score),
            recommendation: `Review and retake "${data.title}" to improve your score`,
            priority: data.score < 50 ? "high" : "medium",
            quizId,
          });
        });

      // Add untaken quizzes for lessons that are complete
      const takenQuizIds = new Set(quizScores.keys());
      regularQuizzes
        .filter((q) => !takenQuizIds.has(q.id) && (!q.lesson_id || completedLessonIds.has(q.lesson_id)))
        .slice(0, 2)
        .forEach((quiz) => {
          weakAreas.push({
            type: "quiz",
            title: quiz.title,
            score: 0,
            recommendation: `Take "${quiz.title}" to test your understanding`,
            priority: "medium",
            quizId: quiz.id,
          });
        });

      // Add mock exam recommendations
      if (mockExamsTaken === 0 && lessonProgressScore >= 50 && mockExams.length > 0) {
        weakAreas.push({
          type: "mock",
          title: "Mock Exam Practice",
          score: 0,
          recommendation: "Take a mock exam to simulate real exam conditions",
          priority: "medium",
        });
      } else if (averageMockScore < 60 && mockExamsTaken > 0) {
        weakAreas.push({
          type: "mock",
          title: "Mock Exam Performance",
          score: Math.round(averageMockScore),
          recommendation: "Retake mock exams after reviewing weak topics",
          priority: "high",
        });
      }

      // Add recency warning if no recent activity
      if (lastActivityDays !== null && lastActivityDays > 14) {
        weakAreas.unshift({
          type: "lesson",
          title: "Study Consistency",
          score: 0,
          recommendation: `Resume studying - it's been ${lastActivityDays} days since your last activity`,
          priority: "high",
        });
      }

      // Sort by priority and limit
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      weakAreas.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

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
        weakAreas: weakAreas.slice(0, 5),
        recencyBonus,
        lastActivityDays,
      };
    },
    enabled: !!user && !!courseId,
  });
};
