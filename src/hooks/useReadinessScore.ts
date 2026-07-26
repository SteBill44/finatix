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

/**
 * Coverage-adjusted dimension score. Sums the achieved percentages across the
 * assessments the learner has ATTEMPTED, then divides by the TOTAL number
 * available in the course — so untaken assessments count as 0. This makes the
 * dimension reflect how much of the material has actually been proven, not just
 * the average of a handful of attempts.
 *
 * Example: 1 of 8 quizzes taken at 100% → 100 / 8 = 12.5 (not 100).
 */
export const coverageAdjustedScore = (
  sumOfTakenPercents: number,
  totalAvailable: number
): number => (totalAvailable > 0 ? sumOfTakenPercents / totalAvailable : 0);

export interface ReadinessGateInput {
  mocksExist: boolean;
  mockExamsTaken: number;
  lastActivityDays: number | null;
  coverageRatio: number;
}

/**
 * Guards the top "ready" claim so it only stands on trustworthy evidence.
 * A course that would otherwise score as exam-ready is held at "proficient"
 * until the learner has: (a) sat at least one mock exam (when the course has
 * any), (b) been active recently (≤30 days), and (c) covered enough of the
 * material (≥60%). Lower levels are returned unchanged — this only ever caps
 * an over-optimistic "ready".
 */
export const applyReadinessGates = (
  level: ReadinessScore["level"],
  { mocksExist, mockExamsTaken, lastActivityDays, coverageRatio }: ReadinessGateInput
): ReadinessScore["level"] => {
  if (level !== "ready") return level;
  const noMockEvidence = mocksExist && mockExamsTaken === 0;
  const stale = lastActivityDays !== null && lastActivityDays > 30;
  const thinCoverage = coverageRatio < 0.6;
  return noMockEvidence || stale || thinCoverage ? "proficient" : level;
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
      const lessonIdList = lessons?.map((l) => l.id) || [];

      // [6] Filter lessonProgress at DB level using course lesson IDs
      const { data: lessonProgress } = lessonIdList.length > 0
        ? await from("lesson_progress")
            .select("lesson_id, completed, completed_at")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIdList)
            .eq("completed", true)
        : { data: [] as { lesson_id: string; completed: boolean; completed_at: string | null }[] };

      const completedLessonIds = new Set(lessonProgress?.map((p) => p.lesson_id) || []);
      const completedLessons = completedLessonIds.size;
      const incompleteLessons = lessons?.filter((l) => !completedLessonIds.has(l.id)) || [];

      // [1] Fetch quiz_type for proper exam classification
      const { data: quizzes } = await from("quizzes")
        .select("id, title, quiz_type, lesson_id").eq("course_id", courseId);

      const isExam = (q: { quiz_type?: string | null; title: string }) =>
        q.quiz_type === "mock_exam" || q.quiz_type === "final_exam";

      const regularQuizzes = quizzes?.filter((q) => !isExam(q)) || [];
      const mockExams = quizzes?.filter((q) => isExam(q)) || [];
      const regularQuizIds = regularQuizzes.map((q) => q.id);
      const mockExamIds = mockExams.map((q) => q.id);

      const { data: quizAttempts } = await from("quiz_attempts")
        .select("quiz_id, score, max_score, attempted_at")
        .eq("user_id", user.id).eq("course_id", courseId)
        .order("attempted_at", { ascending: false });

      // [2] Most-recent attempt per quiz - no double-weighting
      const latestAttemptByQuiz = new Map<string, { score: number; max_score: number; attempted_at: string }>();
      [...(quizAttempts || [])].forEach((a) => {
        if (a.quiz_id && !latestAttemptByQuiz.has(a.quiz_id)) {
          latestAttemptByQuiz.set(a.quiz_id, a);
        }
      });

      // [3] Raw percentage only - no recency decay on scores
      const quizScores = new Map<string, { score: number; title: string }>();
      regularQuizIds.forEach((id) => {
        const attempt = latestAttemptByQuiz.get(id);
        if (attempt && attempt.max_score > 0) {
          const quiz = regularQuizzes.find((q) => q.id === id);
          quizScores.set(id, {
            score: (attempt.score / attempt.max_score) * 100,
            title: quiz?.title || "Quiz",
          });
        }
      });

      const quizzesTaken = quizScores.size;
      const takenQuizSum = Array.from(quizScores.values()).reduce((sum, q) => sum + q.score, 0);
      // Quality of attempts (average of quizzes actually taken)
      const averageQuizScore = quizzesTaken > 0 ? takenQuizSum / quizzesTaken : 0;
      // Coverage-adjusted (untaken quizzes count as 0) — this feeds the overall score
      const effectiveQuizScore = coverageAdjustedScore(takenQuizSum, regularQuizzes.length);

      const mockScores = new Map<string, { score: number; title: string }>();
      mockExamIds.forEach((id) => {
        const attempt = latestAttemptByQuiz.get(id);
        if (attempt && attempt.max_score > 0) {
          const mock = mockExams.find((m) => m.id === id);
          mockScores.set(id, {
            score: (attempt.score / attempt.max_score) * 100,
            title: mock?.title || "Mock Exam",
          });
        }
      });

      const mockExamsTaken = mockScores.size;
      const takenMockSum = Array.from(mockScores.values()).reduce((sum, m) => sum + m.score, 0);
      const averageMockScore = mockExamsTaken > 0 ? takenMockSum / mockExamsTaken : 0;
      const effectiveMockScore = coverageAdjustedScore(takenMockSum, mockExams.length);

      let lastActivityDays: number | null = null;
      const allAttemptDates = quizAttempts?.map((a) => getDaysSince(a.attempted_at)) || [];
      const lessonCompletionDates =
        lessonProgress?.filter((p) => p.completed_at).map((p) => getDaysSince(p.completed_at!)) || [];
      const allActivityDays = [...allAttemptDates, ...lessonCompletionDates];
      if (allActivityDays.length > 0) lastActivityDays = Math.min(...allActivityDays);

      const dataPoints = completedLessons + quizzesTaken + mockExamsTaken;
      const totalPossiblePoints = totalLessons + regularQuizzes.length + mockExams.length;
      const coverageRatio = totalPossiblePoints > 0 ? dataPoints / totalPossiblePoints : 0;

      const lessonProgressScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // [4] Rebalanced weights: lessons 20%, quizzes 55%, mocks 25%
      let lessonWeight = 0.2, quizWeight = 0.55, mockWeight = 0.25;
      if (regularQuizIds.length === 0 && mockExamIds.length === 0) {
        lessonWeight = 1.0; quizWeight = 0; mockWeight = 0;
      } else if (regularQuizIds.length === 0) {
        lessonWeight = 0.4; quizWeight = 0; mockWeight = 0.6;
      } else if (mockExamIds.length === 0) {
        lessonWeight = 0.3; quizWeight = 0.7; mockWeight = 0;
      }

      // Overall uses coverage-adjusted quiz/mock scores so untaken assessments
      // drag the score down — you can't look "ready" off a couple of attempts.
      const overallScore = Math.round(
        lessonProgressScore * lessonWeight +
        effectiveQuizScore * quizWeight +
        effectiveMockScore * mockWeight
      );

      // Gate the top "ready" claim: it must be backed by a mock attempt (when
      // the course has mocks), recent activity, and broad coverage.
      const readinessLevel = applyReadinessGates(getReadinessLevel(overallScore), {
        mocksExist: mockExams.length > 0,
        mockExamsTaken,
        lastActivityDays,
        coverageRatio,
      });

      const { confidence, level: confidenceLevel } = calculateConfidence(lastActivityDays, dataPoints, totalPossiblePoints);

      const weakAreas: WeakArea[] = [];

      // [5] Only surface lesson recommendations when quiz average is weak
      if (averageQuizScore < 75 || quizzesTaken === 0) {
        incompleteLessons.slice(0, 3).forEach((lesson) => {
          weakAreas.push({
            type: "lesson", title: lesson.title, score: 0,
            recommendation: `Complete lesson "${lesson.title}" to build your foundation`,
            priority: lesson.order_index < 3 ? "high" : "medium", lessonId: lesson.id,
          });
        });
      }

      Array.from(quizScores.entries())
        .filter(([, data]) => data.score < 70)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 3)
        .forEach(([quizId, data]) => {
          weakAreas.push({
            type: "quiz", title: data.title, score: Math.round(data.score),
            recommendation: `Review and retake "${data.title}" to improve your score`,
            priority: data.score < 50 ? "high" : "medium", quizId,
          });
        });

      const takenQuizIds = new Set(quizScores.keys());
      regularQuizzes
        .filter((q) => !takenQuizIds.has(q.id) && (!q.lesson_id || completedLessonIds.has(q.lesson_id)))
        .slice(0, 2)
        .forEach((quiz) => {
          weakAreas.push({
            type: "quiz", title: quiz.title, score: 0,
            recommendation: `Take "${quiz.title}" to test your understanding`,
            priority: "medium", quizId: quiz.id,
          });
        });

      if (mockExamsTaken === 0 && lessonProgressScore >= 50 && mockExams.length > 0) {
        weakAreas.push({
          type: "mock", title: "Mock Exam Practice", score: 0,
          recommendation: "Take a mock exam to simulate real exam conditions",
          priority: "medium",
        });
      } else if (averageMockScore < 60 && mockExamsTaken > 0) {
        weakAreas.push({
          type: "mock", title: "Mock Exam Performance", score: Math.round(averageMockScore),
          recommendation: "Retake mock exams after reviewing weak topics",
          priority: "high",
        });
      }

      if (lastActivityDays !== null && lastActivityDays > 14) {
        weakAreas.unshift({
          type: "lesson", title: "Study Consistency", score: 0,
          recommendation: `Resume studying - it's been ${lastActivityDays} days since your last activity`,
          priority: "high",
        });
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      weakAreas.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return {
        overall: overallScore,
        lessonProgress: Math.round(lessonProgressScore),
        // Coverage-adjusted dimensions — consistent with how `overall` is built
        quizPerformance: Math.round(effectiveQuizScore),
        mockExamPerformance: Math.round(effectiveMockScore),
        lessonsCompleted: completedLessons, totalLessons, quizzesTaken,
        // Average of assessments actually taken (quality of attempts)
        averageQuizScore: Math.round(averageQuizScore), mockExamsTaken,
        averageMockScore: Math.round(averageMockScore), level: readinessLevel,
        weakAreas: weakAreas.slice(0, 5), confidence, confidenceLevel, lastActivityDays, dataPoints,
      };
    },
    enabled: !!user && !!courseId,
  });
};
