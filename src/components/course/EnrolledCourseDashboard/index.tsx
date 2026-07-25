import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ReadinessScore, WeakArea } from "@/hooks/useReadinessScore";
import { useSyllabusMastery } from "@/hooks/useSyllabusMastery";
import {
  splitAxisLabel,
  computeScoreTrend,
  buildAssessments,
  type SyllabusArea,
  type Lesson,
  type AssessmentQuiz,
  type QuizAttempt,
  type AssessmentItem,
} from "./helpers";
import { StatsStrip } from "./StatsStrip";
import { MasteryRadar } from "./MasteryRadar";
import { NextLessonCard } from "./NextLessonCard";
import { AssessmentsPanel } from "./AssessmentsPanel";
import { ReadinessBreakdown } from "./ReadinessBreakdown";
import { LessonsList } from "./LessonsList";

interface EnrolledCourseDashboardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    level: string;
    duration_hours: number | null;
  };
  lessons: Lesson[];
  lessonProgress: Array<{ lesson_id: string; completed: boolean; completed_at: string | null }> | null;
  readinessScore: ReadinessScore | null | undefined;
  syllabusAreas: SyllabusArea[];
  quizAttempts: QuizAttempt[] | null;
  quizzes?: AssessmentQuiz[] | null;
  levelColor: string;
  levelBgColor: string;
  onUnenroll: () => void;
  unenrollPending: boolean;
}

const EnrolledCourseDashboard = ({
  course,
  lessons,
  lessonProgress,
  readinessScore,
  syllabusAreas,
  quizAttempts,
  quizzes,
  levelBgColor,
}: EnrolledCourseDashboardProps) => {
  const navigate = useNavigate();
  const { data: masteryData } = useSyllabusMastery(course.id);

  const completedLessons = lessonProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLessonCompleted = (lessonId: string) =>
    lessonProgress?.some((p) => p.lesson_id === lessonId && p.completed);

  const nextLesson = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.order_index - b.order_index);
    return sorted.find((l) => !isLessonCompleted(l.id)) || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, lessonProgress]);

  const nextLessonIndex = nextLesson
    ? [...lessons].sort((a, b) => a.order_index - b.order_index).findIndex((l) => l.id === nextLesson.id) + 1
    : null;

  const scoreTrend = useMemo(() => computeScoreTrend(quizAttempts), [quizAttempts]);

  const totalQuestionsAttempted = useMemo(
    () => quizAttempts?.reduce((s, a) => s + a.max_score, 0) || 0,
    [quizAttempts]
  );

  // Radar data - no demo/fake scores
  const radarData = useMemo(() => {
    if (!syllabusAreas.length) return [];
    return syllabusAreas.map((area, index) => {
      const mastery = masteryData?.find((m) => m.syllabus_area_index === index);
      const attempted = mastery?.questions_attempted || 0;
      const score = attempted > 0 ? Math.round(Number(mastery!.mastery_score)) : 0;
      const { prefix, subtitle } = splitAxisLabel(area.title);
      return {
        area: prefix || subtitle,
        labelPrefix: prefix,
        labelSubtitle: subtitle,
        fullTitle: area.title,
        score,
        target: 75,
        weight: area.weight,
        attempted,
        fullMark: 100,
      };
    });
  }, [syllabusAreas, masteryData]);

  const hasRadarData = radarData.some((d) => d.attempted > 0);
  const areasStarted = radarData.filter((d) => d.attempted > 0).length;
  const totalAreas = radarData.length;

  const weakestAreas = useMemo(() => {
    if (!masteryData?.length) return [];
    return [...masteryData]
      .filter((m) => (m.questions_attempted || 0) > 0)
      .sort((a, b) => Number(a.mastery_score) - Number(b.mastery_score))
      .slice(0, 3);
  }, [masteryData]);

  const strongestAreas = useMemo(() => {
    if (!masteryData?.length) return [];
    return [...masteryData]
      .filter((m) => (m.questions_attempted || 0) > 0 && Number(m.mastery_score) >= 70)
      .sort((a, b) => Number(b.mastery_score) - Number(a.mastery_score))
      .slice(0, 3);
  }, [masteryData]);

  const assessments = useMemo(
    () => buildAssessments(quizzes, quizAttempts),
    [quizzes, quizAttempts]
  );

  const launchAssessment = (item: AssessmentItem) => {
    if (item.type === "mock_exam" || item.type === "final_exam") {
      navigate(`/mock-exam/${item.id}`);
    } else {
      navigate(`/quiz/${item.id}`);
    }
  };

  const readiness = readinessScore || {
    overall: 0, lessonProgress: 0, quizPerformance: 0, mockExamPerformance: 0,
    lessonsCompleted: 0, totalLessons: 0, quizzesTaken: 0, averageQuizScore: 0,
    mockExamsTaken: 0, averageMockScore: 0, level: "not-started" as const,
    weakAreas: [] as WeakArea[], confidence: 0, confidenceLevel: "very-low" as const,
    lastActivityDays: null, dataPoints: 0,
  };

  // Radar fill/stroke colour tracks readiness - green when exam-ready, amber when building
  const radarColor =
    readiness.overall >= 75
      ? "hsl(var(--accent))"
      : readiness.overall >= 50
      ? "hsl(var(--primary))"
      : hasRadarData
      ? "hsl(25 95% 53%)"
      : "hsl(var(--primary))";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="!text-lg md:!text-xl lg:!text-xl font-bold text-foreground leading-tight">{course.title}</h1>
          {readiness.lastActivityDays !== null && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Last active{" "}
              {readiness.lastActivityDays === 0
                ? "today"
                : readiness.lastActivityDays === 1
                ? "yesterday"
                : `${readiness.lastActivityDays} days ago`}
            </p>
          )}
        </div>
      </div>

      {/* Mobile/tablet: surface Start Lesson at the top */}
      <div className="lg:hidden">
        <NextLessonCard
          courseId={course.id}
          nextLesson={nextLesson}
          nextLessonIndex={nextLessonIndex}
          totalLessons={totalLessons}
        />
      </div>

      <StatsStrip
        readiness={readiness}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressPercentage={progressPercentage}
        scoreTrend={scoreTrend}
        totalQuestionsAttempted={totalQuestionsAttempted}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <MasteryRadar
          radarData={radarData}
          hasRadarData={hasRadarData}
          totalAreas={totalAreas}
          areasStarted={areasStarted}
          radarColor={radarColor}
          weakestAreas={weakestAreas as any}
          strongestAreas={strongestAreas as any}
        />

        <div className="lg:col-span-2 space-y-4">
          <div className="hidden lg:block">
            <NextLessonCard
              courseId={course.id}
              nextLesson={nextLesson}
              nextLessonIndex={nextLessonIndex}
              totalLessons={totalLessons}
            />
          </div>


          <AssessmentsPanel
            practiceQuizzes={assessments.practiceQuizzes}
            mockExams={assessments.mockExams}
            finalExams={assessments.finalExams}
            onLaunch={launchAssessment}
          />

          <ReadinessBreakdown readiness={readiness} />
        </div>
      </div>

      <LessonsList
        courseId={course.id}
        lessons={lessons}
        isLessonCompleted={isLessonCompleted}
        nextLessonId={nextLesson?.id || null}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressPercentage={progressPercentage}
        levelBgColor={levelBgColor}
      />
    </div>
  );
};

export default EnrolledCourseDashboard;
