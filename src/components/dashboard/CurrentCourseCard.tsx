import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, ArrowRight, Target, FileQuestion, GraduationCap } from "lucide-react";
import { useCourseProgress, useQuizAttempts } from "@/hooks/useStudentProgress";
import { useReadinessScore } from "@/hooks/useReadinessScore";
import { useQuizzes } from "@/hooks/useQuizzes";

interface Props {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseLevel?: string;
  nextLessonId: string;
  nextLessonTitle: string;
}

const LEVEL_LABELS: Record<string, string> = {
  certificate: "Certificate",
  operational: "Operational",
  management: "Management",
  strategic: "Strategic",
};

const READINESS_LABELS: Record<string, string> = {
  "not-started": "Getting Started",
  beginning: "Building",
  developing: "Developing",
  proficient: "Developing",
  ready: "Exam Ready",
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-accent";
  if (score >= 50) return "text-primary";
  if (score > 0) return "text-yellow-500";
  return "text-muted-foreground";
};

const CurrentCourseCard = ({
  courseId,
  courseTitle,
  courseSlug,
  courseLevel,
  nextLessonId,
  nextLessonTitle,
}: Props) => {
  const navigate = useNavigate();
  const { completedLessons, totalLessons, percentage } = useCourseProgress(courseId);
  const { data: readiness } = useReadinessScore(courseId);
  const { data: quizAttempts } = useQuizAttempts();
  const { data: quizzes } = useQuizzes(courseId);

  const courseAttempts = (quizAttempts || []).filter((a) => a.course_id === courseId);

  // Identify mock/final exams
  const mockQuizIds = new Set(
    (quizzes || [])
      .filter((q: any) => {
        const t = (q.quiz_type || "").toLowerCase();
        const title = (q.title || "").toLowerCase();
        return t === "mock_exam" || t === "final_exam" || title.includes("mock");
      })
      .map((q) => q.id),
  );

  const regularAttempts = courseAttempts.filter(
    (a) => !a.quiz_id || !mockQuizIds.has(a.quiz_id),
  );
  const mockAttempts = courseAttempts.filter(
    (a) => a.quiz_id && mockQuizIds.has(a.quiz_id),
  );

  const quizAvg =
    regularAttempts.length > 0
      ? Math.round(
          regularAttempts.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) /
            regularAttempts.length,
        )
      : null;

  const mockAvg =
    mockAttempts.length > 0
      ? Math.round(
          mockAttempts.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) /
            mockAttempts.length,
        )
      : null;

  const readinessScore = readiness?.overall ?? 0;
  const readinessLabel = readiness ? READINESS_LABELS[readiness.level] : "Getting Started";

  const allComplete = totalLessons > 0 && completedLessons >= totalLessons;
  const levelLabel = courseLevel ? LEVEL_LABELS[courseLevel.toLowerCase()] : null;

  const handleContinue = () => {
    navigate(`/courses/${courseSlug}`);
  };

  return (
    <Card className="p-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Current Course
            </p>
            {levelLabel && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {levelLabel}
              </Badge>
            )}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground truncate">
            {courseTitle}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {allComplete ? (
              <span className="text-accent">Course complete — review or revisit lessons</span>
            ) : (
              <>
                <span className="text-muted-foreground/70">Up next: </span>
                {nextLessonTitle}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={handleContinue} className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            {allComplete ? "Review" : "Continue"}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">
            {completedLessons}/{totalLessons} lessons
          </span>
          <span className="font-medium text-foreground">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
            <Target className="w-3 h-3" />
            Readiness
          </div>
          <p className={`text-xl font-bold ${getScoreColor(readinessScore)}`}>
            {readinessScore}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{readinessLabel}</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
            <FileQuestion className="w-3 h-3" />
            Quiz Avg
          </div>
          <p className={`text-xl font-bold ${quizAvg !== null ? getScoreColor(quizAvg) : "text-foreground"}`}>
            {quizAvg !== null ? `${quizAvg}%` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {regularAttempts.length > 0
              ? `${regularAttempts.length} attempt${regularAttempts.length !== 1 ? "s" : ""}`
              : "no quizzes yet"}
          </p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
            <GraduationCap className="w-3 h-3" />
            Mock Avg
          </div>
          <p className={`text-xl font-bold ${mockAvg !== null ? getScoreColor(mockAvg) : "text-foreground"}`}>
            {mockAvg !== null ? `${mockAvg}%` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {mockAttempts.length > 0
              ? `${mockAttempts.length} attempt${mockAttempts.length !== 1 ? "s" : ""}`
              : "0 attempts"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CurrentCourseCard;
