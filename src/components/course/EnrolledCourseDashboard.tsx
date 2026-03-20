import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Play,
  CheckCircle,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Flame,
  GraduationCap,
  FileQuestion,
  Lightbulb,
  Calendar,
  Zap,
} from "lucide-react";
import { ReadinessScore, WeakArea } from "@/hooks/useReadinessScore";
import { useSyllabusMastery, getMasteryLevel } from "@/hooks/useSyllabusMastery";
import { useIsMobile } from "@/hooks/use-mobile";

interface SyllabusArea {
  title: string;
  weight: string;
  topics?: string[];
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  order_index: number;
}

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
  quizAttempts: Array<{ quiz_id: string | null; score: number; max_score: number; attempted_at: string }> | null;
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
  levelColor,
  levelBgColor,
  onUnenroll,
  unenrollPending,
}: EnrolledCourseDashboardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: masteryData } = useSyllabusMastery(course.id);

  const completedLessons = lessonProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLessonCompleted = (lessonId: string) =>
    lessonProgress?.some((p) => p.lesson_id === lessonId && p.completed);

  // Next lesson to study
  const nextLesson = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.order_index - b.order_index);
    return sorted.find((l) => !isLessonCompleted(l.id)) || null;
  }, [lessons, lessonProgress]);

  const nextLessonIndex = nextLesson
    ? lessons.sort((a, b) => a.order_index - b.order_index).findIndex((l) => l.id === nextLesson.id) + 1
    : null;

  // Radar chart data from syllabus areas + mastery
  const radarData = useMemo(() => {
    if (!syllabusAreas.length) return [];
    return syllabusAreas.map((area, index) => {
      const mastery = masteryData?.find((m) => m.syllabus_area_index === index);
      const score = mastery ? Number(mastery.mastery_score) : 0;
      return {
        area: area.title,
        fullTitle: area.title,
        score: Math.round(score),
        weight: area.weight,
        attempted: mastery?.questions_attempted || 0,
        fullMark: 100,
      };
    });
  }, [syllabusAreas, masteryData]);

  // Study streak / recent activity
  const recentAttempts = useMemo(() => {
    if (!quizAttempts?.length) return [];
    return quizAttempts
      .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime())
      .slice(0, 5);
  }, [quizAttempts]);

  const averageRecentScore = useMemo(() => {
    if (!recentAttempts.length) return 0;
    const avg = recentAttempts.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) / recentAttempts.length;
    return Math.round(avg);
  }, [recentAttempts]);

  // Identify weakest syllabus areas
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

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-accent";
    if (score >= 50) return "text-primary";
    if (score >= 25) return "text-yellow-500";
    return "text-destructive";
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 75) return { label: "Exam Ready", color: "bg-accent/15 text-accent border-accent/30" };
    if (score >= 50) return { label: "Developing", color: "bg-primary/15 text-primary border-primary/30" };
    if (score >= 25) return { label: "Building Foundation", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" };
    return { label: "Getting Started", color: "bg-muted text-muted-foreground border-border" };
  };

  const readiness = readinessScore || {
    overall: 0, lessonProgress: 0, quizPerformance: 0, mockExamPerformance: 0,
    lessonsCompleted: 0, totalLessons: 0, quizzesTaken: 0, averageQuizScore: 0,
    mockExamsTaken: 0, averageMockScore: 0, level: "not-started" as const,
    weakAreas: [] as WeakArea[], confidence: 0, confidenceLevel: "very-low" as const,
    lastActivityDays: null, dataPoints: 0,
  };

  const readinessLabel = getReadinessLabel(readiness.overall);

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Course Title + Continue Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs capitalize">
              {course.level} Level
            </Badge>
            {readiness.lastActivityDays !== null && readiness.lastActivityDays <= 1 && (
              <Badge variant="outline" className="text-xs border-accent/30 text-accent gap-1">
                <Flame className="w-3 h-3" /> Active today
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{course.title}</h1>
        </div>
        <Button
          size="lg"
          className="gap-2 shrink-0"
          onClick={() => {
            if (nextLesson) {
              navigate(`/courses/${course.id}/lesson/${nextLesson.id}`);
            } else if (lessons.length > 0) {
              navigate(`/courses/${course.id}/lesson/${lessons[0].id}`);
            }
          }}
        >
          <Play className="w-5 h-5" />
          {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
        </Button>
      </div>

      {/* ── Row 1: Key Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Target className="w-3.5 h-3.5" />
            Exam Readiness
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(readiness.overall)}`}>
              {readiness.overall}%
            </span>
          </div>
          <Badge variant="outline" className={`mt-2 text-xs ${readinessLabel.color}`}>
            {readinessLabel.label}
          </Badge>
        </Card>

        {/* Lesson Progress */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Lessons Completed
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-foreground">{completedLessons}</span>
            <span className="text-sm text-muted-foreground mb-1">/ {totalLessons}</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5 mt-2" />
        </Card>

        {/* Quiz Performance */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <FileQuestion className="w-3.5 h-3.5" />
            Quiz Average
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${readiness.quizzesTaken > 0 ? getScoreColor(readiness.averageQuizScore) : "text-muted-foreground"}`}>
              {readiness.quizzesTaken > 0 ? `${readiness.averageQuizScore}%` : "—"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {readiness.quizzesTaken > 0 ? `${readiness.quizzesTaken} quizzes taken` : "No quizzes taken yet"}
          </p>
        </Card>

        {/* Mock Exam Performance */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Mock Exam Avg
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${readiness.mockExamsTaken > 0 ? getScoreColor(readiness.averageMockScore) : "text-muted-foreground"}`}>
              {readiness.mockExamsTaken > 0 ? `${readiness.averageMockScore}%` : "—"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {readiness.mockExamsTaken > 0 ? `${readiness.mockExamsTaken} exams taken` : "No mocks attempted"}
          </p>
        </Card>
      </div>

      {/* ── Row 2: Radar Chart + Next Lesson + Weak Areas ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Radar Chart — Syllabus Mastery */}
        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Exam Readiness</h3>
              <p className="text-xs text-muted-foreground">
                Your mastery across each exam area
              </p>
            </div>
          </div>

          {radarData.length > 0 ? (
            <div className="w-full" style={{ height: isMobile ? 320 : 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "55%" : "60%"} data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="area"
                    tickLine={false}
                    tick={(props: any) => {
                      const { x, y, payload, cx: chartCx, cy: chartCy } = props;
                      const text = payload.value as string;
                      const maxChars = isMobile ? 10 : 14;
                      const words = text.split(" ");
                      const lines: string[] = [];
                      let current = "";
                      for (const word of words) {
                        if (current && (current + " " + word).length > maxChars) {
                          lines.push(current);
                          current = word;
                        } else {
                          current = current ? current + " " + word : word;
                        }
                      }
                      if (current) lines.push(current);
                      const fontSize = isMobile ? 7 : 9;
                      const lineHeight = fontSize + 3;

                      // Push labels outward from chart center
                      const dx = x - (chartCx || 0);
                      const dy = y - (chartCy || 0);
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const pushOut = isMobile ? 14 : 20;
                      const labelX = dist > 0 ? x + (dx / dist) * pushOut : x;
                      const labelY = dist > 0 ? y + (dy / dist) * pushOut : y;

                      // Determine text anchor based on position relative to center
                      let anchor: string = "middle";
                      if (dx > 20) anchor = "start";
                      else if (dx < -20) anchor = "end";

                      const startY = labelY - ((lines.length - 1) * lineHeight) / 2;
                      return (
                        <text
                          x={labelX}
                          y={startY}
                          textAnchor={anchor}
                          fill="hsl(var(--muted-foreground))"
                          fontSize={fontSize}
                        >
                          {lines.map((line, i) => (
                            <tspan key={i} x={labelX} dy={i === 0 ? 0 : lineHeight}>
                              {line}
                            </tspan>
                          ))}
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                    tickCount={5}
                    axisLine={false}
                  />
                  <Radar
                    name="Mastery"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium text-foreground">{d.fullTitle}</p>
                          <p className="text-xs text-muted-foreground">Weight: {d.weight}</p>
                          <p className={`text-sm font-semibold ${getScoreColor(d.score)}`}>
                            Mastery: {d.score}%
                          </p>
                          <p className="text-xs text-muted-foreground">{d.attempted} questions attempted</p>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Complete quizzes to see your syllabus mastery map.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The radar chart will show your strengths and gaps across all exam topics.
              </p>
            </div>
          )}

          {/* Legend: Weak vs Strong */}
          {radarData.length > 0 && (weakestAreas.length > 0 || strongestAreas.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
              {weakestAreas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Focus Areas
                  </p>
                  <div className="space-y-1.5">
                    {weakestAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate mr-2">
                          {area.syllabus_area_title || `Area ${area.syllabus_area_index + 1}`}
                        </span>
                        <span className="text-destructive font-medium shrink-0">
                          {Math.round(Number(area.mastery_score))}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {strongestAreas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Strengths
                  </p>
                  <div className="space-y-1.5">
                    {strongestAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate mr-2">
                          {area.syllabus_area_title || `Area ${area.syllabus_area_index + 1}`}
                        </span>
                        <span className="text-accent font-medium shrink-0">
                          {Math.round(Number(area.mastery_score))}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right column: Next Lesson + Quick Insights */}
        <div className="lg:col-span-2 space-y-4">
          {/* Next Lesson */}
          {nextLesson ? (
            <Card className="p-5 border-primary/20 bg-primary/[0.03]">
              <div className="flex items-center gap-2 text-xs text-primary font-medium mb-3">
                <Zap className="w-3.5 h-3.5" />
                UP NEXT — Chapter {nextLessonIndex}
              </div>
              <h4 className="font-semibold text-foreground mb-1 leading-snug">
                {nextLesson.title}
              </h4>
              {nextLesson.duration_minutes && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                  <Clock className="w-3 h-3" /> {nextLesson.duration_minutes} min
                </p>
              )}
              <Button
                className="w-full gap-2"
                onClick={() => navigate(`/courses/${course.id}/lesson/${nextLesson.id}`)}
              >
                <Play className="w-4 h-4" /> Start Lesson
              </Button>
            </Card>
          ) : totalLessons > 0 ? (
            <Card className="p-5 border-accent/20 bg-accent/[0.03]">
              <div className="flex items-center gap-2 text-accent mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">All lessons completed!</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Review any lesson or take practice quizzes to solidify your knowledge.
              </p>
            </Card>
          ) : null}

          {/* Study Recommendations */}
          {readiness.weakAreas.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                Recommendations
              </div>
              <div className="space-y-3">
                {readiness.weakAreas.slice(0, 3).map((area, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      area.priority === "high" ? "bg-destructive" : "bg-yellow-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground leading-snug">{area.recommendation}</p>
                      {area.score > 0 && (
                        <span className="text-xs text-muted-foreground">Current: {area.score}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Readiness Breakdown */}
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              Readiness Breakdown
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className={`font-medium ${getScoreColor(readiness.lessonProgress)}`}>
                    {readiness.lessonProgress}%
                  </span>
                </div>
                <Progress value={readiness.lessonProgress} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Quiz Performance</span>
                  <span className={`font-medium ${getScoreColor(readiness.quizPerformance)}`}>
                    {readiness.quizPerformance}%
                  </span>
                </div>
                <Progress value={readiness.quizPerformance} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Mock Exams</span>
                  <span className={`font-medium ${getScoreColor(readiness.mockExamPerformance)}`}>
                    {readiness.mockExamPerformance}%
                  </span>
                </div>
                <Progress value={readiness.mockExamPerformance} className="h-1.5" />
              </div>
            </div>
            {readiness.lastActivityDays !== null && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Last active {readiness.lastActivityDays === 0 ? "today" : readiness.lastActivityDays === 1 ? "yesterday" : `${readiness.lastActivityDays} days ago`}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Row 3: Lessons list ── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Course Lessons</h3>
              <p className="text-xs text-muted-foreground">{completedLessons} of {totalLessons} completed</p>
            </div>
          </div>
          <span className="text-sm font-medium text-foreground">{progressPercentage}%</span>
        </div>
        <div className="space-y-2">
          {lessons
            .sort((a, b) => a.order_index - b.order_index)
            .map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              const isNext = nextLesson?.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isNext
                      ? "bg-primary/10 border border-primary/20"
                      : completed
                        ? "bg-accent/5 hover:bg-accent/10"
                        : "hover:bg-muted/50"
                  }`}
                  onClick={() => navigate(`/courses/${course.id}/lesson/${lesson.id}`)}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                    completed
                      ? "bg-accent text-accent-foreground"
                      : isNext
                        ? `${levelBgColor} text-primary-foreground`
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {completed ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${completed ? "text-muted-foreground" : "text-foreground"}`}>
                      {lesson.title}
                    </p>
                  </div>
                  {isNext && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary shrink-0">
                      Next
                    </Badge>
                  )}
                  {lesson.duration_minutes && (
                    <span className="text-xs text-muted-foreground shrink-0">{lesson.duration_minutes}m</span>
                  )}
                  {!completed && !isNext && (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
};

export default EnrolledCourseDashboard;
