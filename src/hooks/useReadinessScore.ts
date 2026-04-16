import { useQuery } from "@tanstack/react-query";
import { from } from "@/lib/api/client";
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
  confidence: number;
  confidenceLevel: "high" | "medium" | "low" | "very-low";
  lastActivityDays: number | null;
  dataPoints: number;
}

export const getReadinessLevel = (score: number): ReadinessScore["level"] => {
  if (score === 0) return "not-started";
  if (score < 25) return "beginning";
  if (score < 50) return "developing";
  if (score < 75) return "proficient";
  return "ready";
};

export const getRecencyWeight = (daysAgo: number): number => {
  if (daysAgo <= 7) return 1.0;
  if (daysAgo <= 14) return 0.9;
  if (daysAgo <= 30) return 0.75;
  if (daysAgo <= 60) return 0.5;
  return 0.25;
};

export const calculateConfidence = (
  lastActivityDays: number | null,
  dataPoints: number,
  totalPossiblePoints: number
): { confidence: number; level: ReadinessScore["confidenceLevel"] } => {
  const coverageRatio = totalPossiblePoints > 0 ? dataPoints / totalPossiblePoints : 0;
  const coverageConfidence = Math.min(60, coverageRatio * 80);

  let recencyConfidence = 0;
  if (lastActivityDays !== null) {
    if (lastActivityDays <= 3) recencyConfidence = 40;
    else if (lastActivityDays <= 7) recencyConfidence = 35;
    else if (lastActivityDays <= 14) recencyConfidence = 28;
    else if (lastActivityDays <= 30) recencyConfidence = 18;
    else if (lastActivityDays <= 60) recencyConfidence = 8;
    else recencyConfidence = 3;
  }

  const confidence = Math.round(coverageConfidence + recencyConfidence);
  let level: ReadinessScore["confidenceLevel"];
  if (confidence >= 70) level = "high";
  else if (confidence >= 50) level = "medium";
  else if (confidence >= 30) level = "low";
  else level = "very-low";

  return { confidence, level };
};

export const getDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

export const useReadinessScore = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["readiness_score", user?.id, courseId],
    queryFn: async (): Promise<ReadinessScore> => {
      if (!user || !courseId) {
        return {
          overall: 0, lessonProgress: 0, quizPerformance: 0, mockExamPerformance: 0,
          lessonsCompleted: 0, totalLessons: 0, quizzesTaken: 0, averageQuizScore: 0,
          mockExamsTaken: 0, averageMockScore: 0, level: "not-started", weakAreas: [],
          confidence: 0, confidenceLevel: "very-low", lastActivityDays: null, dataPoints: 0,
        };
      }

      const { data: lessons } = await from("lessons")
        .select("id, title, order_index").eq("course_id", courseId).order("order_index");
      const totalLessons = lessons?.length || 0;

      const { data: lessonProgress } = await from("lesson_progress")
        .select("lesson_id, completed, completed_at").eq("user_id", user.id).eq("completed", true);

      const lessonIds = new Set(lessons?.map((l) => l.id) || []);
      const completedLessonIds = new Set(
        lessonProgress?.filter((p) => lessonIds.has(p.lesson_id)).map((p) => p.lesson_id) || []
      );
      const completedLessons = completedLessonIds.size;
      const incompleteLessons = lessons?.filter((l) => !completedLessonIds.has(l.id)) || [];

      const { data: quizzes } = await from("quizzes")
        .select("id, title, lesson_id").eq("course_id", courseId);

      const regularQuizzes = quizzes?.filter((q) => !q.title.toLowerCase().includes("mock")) || [];
      const mockExams = quizzes?.filter((q) => q.title.toLowerCase().includes("mock")) || [];
      const regularQuizIds = regularQuizzes.map((q) => q.id);
      const mockExamIds = mockExams.map((q) => q.id);

      const { data: quizAttempts } = await from("quiz_attempts")
        .select("quiz_id, score, max_score, attempted_at")
        .eq("user_id", user.id).eq("course_id", courseId)
        .order("attempted_at", { ascending: false });

      const regularQuizAttempts = quizAttempts?.filter((a) => a.quiz_id && regularQuizIds.includes(a.quiz_id));
      const quizScores = new Map<string, { score: number; recencyWeight: number; title: string }>();
      regularQuizAttempts?.forEach((attempt) => {
        if (attempt.quiz_id) {
          const percentage = (attempt.score / attempt.max_score) * 100;
          const daysAgo = getDaysSince(attempt.attempted_at);
          const recencyWeight = getRecencyWeight(daysAgo);
          const quiz = regularQuizzes.find((q) => q.id === attempt.quiz_id);
          const current = quizScores.get(attempt.quiz_id);
          const weightedScore = percentage * recencyWeight;
          const currentWeightedScore = current ? current.score * current.recencyWeight : 0;
          if (!current || weightedScore > currentWeightedScore) {
            quizScores.set(attempt.quiz_id, { score: percentage, recencyWeight, title: quiz?.title || "Quiz" });
          }
        }
      });

      const quizzesTaken = quizScores.size;
      let averageQuizScore = 0;
      if (quizzesTaken > 0) {
        const totalWeightedScore = Array.from(quizScores.values()).reduce((sum, q) => sum + q.score * q.recencyWeight, 0);
        const totalWeight = Array.from(quizScores.values()).reduce((sum, q) => sum + q.recencyWeight, 0);
        averageQuizScore = totalWeightedScore / totalWeight;
      }

      const mockExamAttempts = quizAttempts?.filter((a) => a.quiz_id && mockExamIds.includes(a.quiz_id));
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
            mockScores.set(attempt.quiz_id, { score: percentage, recencyWeight, title: mock?.title || "Mock Exam" });
          }
        }
      });

      const mockExamsTaken = mockScores.size;
      let averageMockScore = 0;
      if (mockExamsTaken > 0) {
        const totalWeightedScore = Array.from(mockScores.values()).reduce((sum, m) => sum + m.score * m.recencyWeight, 0);
        const totalWeight = Array.from(mockScores.values()).reduce((sum, m) => sum + m.recencyWeight, 0);
        averageMockScore = totalWeightedScore / totalWeight;
      }

      let lastActivityDays: number | null = null;
      const allAttemptDates = quizAttempts?.map((a) => getDaysSince(a.attempted_at)) || [];
      const lessonCompletionDates = lessonProgress?.filter((p) => p.completed_at).map((p) => getDaysSince(p.completed_at!)) || [];
      const allActivityDays = [...allAttemptDates, ...lessonCompletionDates];
      if (allActivityDays.length > 0) lastActivityDays = Math.min(...allActivityDays);

      const dataPoints = completedLessons + quizzesTaken + mockExamsTaken;
      const totalPossiblePoints = totalLessons + regularQuizzes.length + mockExams.length;

      const lessonProgressScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const quizPerformanceScore = averageQuizScore;
      const mockExamPerformanceScore = averageMockScore;

      let lessonWeight = 0.4, quizWeight = 0.4, mockWeight = 0.2;
      if (regularQuizIds.length === 0 && mockExamIds.length === 0) { lessonWeight = 1.0; quizWeight = 0; mockWeight = 0; }
      else if (regularQuizIds.length === 0) { lessonWeight = 0.6; quizWeight = 0; mockWeight = 0.4; }
      else if (mockExamIds.length === 0) { lessonWeight = 0.5; quizWeight = 0.5; mockWeight = 0; }

      const overallScore = Math.round(
        lessonProgressScore * lessonWeight + quizPerformanceScore * quizWeight + mockExamPerformanceScore * mockWeight
      );

      const { confidence, level: confidenceLevel } = calculateConfidence(lastActivityDays, dataPoints, totalPossiblePoints);

      const weakAreas: WeakArea[] = [];
      incompleteLessons.slice(0, 3).forEach((lesson) => {
        weakAreas.push({ type: "lesson", title: lesson.title, score: 0,
          recommendation: `Complete lesson "${lesson.title}" to build your foundation`,
          priority: lesson.order_index < 3 ? "high" : "medium", lessonId: lesson.id });
      });

      Array.from(quizScores.entries()).filter(([, data]) => data.score < 70)
        .sort((a, b) => a[1].score - b[1].score).slice(0, 3)
        .forEach(([quizId, data]) => {
          weakAreas.push({ type: "quiz", title: data.title, score: Math.round(data.score),
            recommendation: `Review and retake "${data.title}" to improve your score`,
            priority: data.score < 50 ? "high" : "medium", quizId });
        });

      const takenQuizIds = new Set(quizScores.keys());
      regularQuizzes.filter((q) => !takenQuizIds.has(q.id) && (!q.lesson_id || completedLessonIds.has(q.lesson_id)))
        .slice(0, 2).forEach((quiz) => {
          weakAreas.push({ type: "quiz", title: quiz.title, score: 0,
            recommendation: `Take "${quiz.title}" to test your understanding`, priority: "medium", quizId: quiz.id });
        });

      if (mockExamsTaken === 0 && lessonProgressScore >= 50 && mockExams.length > 0) {
        weakAreas.push({ type: "mock", title: "Mock Exam Practice", score: 0,
          recommendation: "Take a mock exam to simulate real exam conditions", priority: "medium" });
      } else if (averageMockScore < 60 && mockExamsTaken > 0) {
        weakAreas.push({ type: "mock", title: "Mock Exam Performance", score: Math.round(averageMockScore),
          recommendation: "Retake mock exams after reviewing weak topics", priority: "high" });
      }

      if (lastActivityDays !== null && lastActivityDays > 14) {
        weakAreas.unshift({ type: "lesson", title: "Study Consistency", score: 0,
          recommendation: `Resume studying - it's been ${lastActivityDays} days since your last activity`, priority: "high" });
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      weakAreas.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return {
        overall: overallScore, lessonProgress: Math.round(lessonProgressScore),
        quizPerformance: Math.round(quizPerformanceScore), mockExamPerformance: Math.round(mockExamPerformanceScore),
        lessonsCompleted: completedLessons, totalLessons, quizzesTaken,
        averageQuizScore: Math.round(averageQuizScore), mockExamsTaken,
        averageMockScore: Math.round(averageMockScore), level: getReadinessLevel(overallScore),
        weakAreas: weakAreas.slice(0, 5), confidence, confidenceLevel, lastActivityDays, dataPoints,
      };
    },
    enabled: !!user && !!courseId,
  });
};
