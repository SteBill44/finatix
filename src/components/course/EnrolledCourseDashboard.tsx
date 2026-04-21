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
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  GraduationCap,
  FileQuestion,
  Lightbulb,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Hash,
} from "lucide-react";
import { ReadinessScore, WeakArea } from "@/hooks/useReadinessScore";
import { useSyllabusMastery } from "@/hooks/useSyllabusMastery";
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

interface AssessmentQuiz {
  id: string;
  title: string;
  description?: string | null;
  quiz_type?: string;
  order_index?: number;
  lesson_id?: string | null;
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
  quizzes?: AssessmentQuiz[] | null;
  levelColor: string;
  levelBgColor: string;
  onUnenroll: () => void;
  unenrollPending: boolean;
}

// Split a syllabus area title into a short prefix code (e.g. "A") and a subtitle.
// Examples:
//   "A: Strategy Process"   → { prefix: "A",  subtitle: "Strategy Process" }
//   "A. External Analysis"  → { prefix: "A",  subtitle: "External Analysis" }
//   "Management Accounting" → { prefix: "",   subtitle: "Management Accounting" }
const splitAxisLabel = (title: string): { prefix: string; subtitle: string } => {
  const prefixMatch = title.match(/^([A-Z]\d*)\s*[:.\-)]\s*(.*)$/);
  if (prefixMatch) {
    return { prefix: prefixMatch[1], subtitle: prefixMatch[2].trim() };
  }
  return { prefix: "", subtitle: title.trim() };
};

// Wrap a subtitle into up to `maxLines` lines, each ≤ `maxChars`, breaking on word boundaries.
const wrapSubtitle = (text: string, maxChars: number, maxLines: number): string[] => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  // Truncate the final line if there are more words remaining
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxChars - 1
      ? last.slice(0, Math.max(1, maxChars - 1)) + "…"
      : last + "…";
  }
  return lines;
};

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

  const nextLesson = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.order_index - b.order_index);
    return sorted.find((l) => !isLessonCompleted(l.id)) || null;
  }, [lessons, lessonProgress]);

  const nextLessonIndex = nextLesson
    ? [...lessons].sort((a, b) => a.order_index - b.order_index).findIndex((l) => l.id === nextLesson.id) + 1
    : null;

  // Score trend: compare older half vs recent half of attempts
  const scoreTrend = useMemo(() => {
    if (!quizAttempts || quizAttempts.length < 4) return null;
    const sorted = [...quizAttempts].sort(
      (a, b) => new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()
    );
    const mid = Math.floor(sorted.length / 2);
    const older = sorted.slice(0, mid);
    const recent = sorted.slice(mid);
    const olderAvg = older.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) / older.length;
    const recentAvg = recent.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) / recent.length;
    return Math.round(recentAvg - olderAvg);
  }, [quizAttempts]);

  // Total individual questions answered across all attempts
  const totalQuestionsAttempted = useMemo(
    () => quizAttempts?.reduce((s, a) => s + a.max_score, 0) || 0,
    [quizAttempts]
  );

  // Radar data — no demo/fake scores
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

  // Weakest / strongest areas (only areas with data)
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
    if (score >= 25) return { label: "Building", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" };
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

  // Radar fill/stroke colour tracks readiness — green when exam-ready, amber when building
  const radarColor =
    readiness.overall >= 75
      ? "hsl(var(--accent))"
      : readiness.overall >= 50
      ? "hsl(var(--primary))"
      : hasRadarData
      ? "hsl(25 95% 53%)"
      : "hsl(var(--primary))";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{course.title}</h1>
          {readiness.lastActivityDays !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              Last active{" "}
              {readiness.lastActivityDays === 0
                ? "today"
                : readiness.lastActivityDays === 1
                ? "yesterday"
                : `${readiness.lastActivityDays} days ago`}
            </p>
          )}
        </div>
        <Button
          size="lg"
          className="gap-2 shrink-0"
          onClick={() => {
            if (nextLesson) navigate(`/courses/${course.id}/lesson/${nextLesson.id}`);
            else if (lessons.length > 0) navigate(`/courses/${course.id}/lesson/${lessons[0].id}`);
          }}
        >
          <Play className="w-5 h-5" />
          {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
        </Button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exam Readiness */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Target className="w-3.5 h-3.5" />
            Exam Readiness
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(readiness.overall)}`}>
            {readiness.overall}%
          </p>
          <Badge variant="outline" className={`mt-2 text-xs ${readinessLabel.color}`}>
            {readinessLabel.label}
          </Badge>
        </Card>

        {/* Lessons */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Lessons
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-foreground">{completedLessons}</span>
            <span className="text-sm text-muted-foreground mb-1">/ {totalLessons}</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5 mt-2" />
        </Card>

        {/* Quiz Average + trend + questions count */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <FileQuestion className="w-3.5 h-3.5" />
            Quiz Average
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${readiness.quizzesTaken > 0 ? getScoreColor(readiness.averageQuizScore) : "text-muted-foreground"}`}>
              {readiness.quizzesTaken > 0 ? `${readiness.averageQuizScore}%` : "—"}
            </span>
            {scoreTrend !== null && (
              <span className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
                scoreTrend > 0 ? "text-accent" : scoreTrend < 0 ? "text-destructive" : "text-muted-foreground"
              }`}>
                {scoreTrend > 0 ? <TrendingUp className="w-3 h-3" /> : scoreTrend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {scoreTrend > 0 ? "+" : ""}{scoreTrend}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalQuestionsAttempted > 0
              ? `${totalQuestionsAttempted.toLocaleString()} questions answered`
              : "No quizzes taken yet"}
          </p>
        </Card>

        {/* Mock Exam */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Mock Exam Avg
          </div>
          <p className={`text-3xl font-bold ${readiness.mockExamsTaken > 0 ? getScoreColor(readiness.averageMockScore) : "text-muted-foreground"}`}>
            {readiness.mockExamsTaken > 0 ? `${readiness.averageMockScore}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {readiness.mockExamsTaken > 0
              ? `${readiness.mockExamsTaken} exam${readiness.mockExamsTaken !== 1 ? "s" : ""} taken`
              : "No mocks attempted"}
          </p>
        </Card>
      </div>

      {/* Radar + Sidebar */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Syllabus Mastery radar ── */}
        <Card className="p-6 lg:col-span-3">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Syllabus Mastery</h3>
                <p className="text-xs text-muted-foreground">
                  {hasRadarData
                    ? `${areasStarted} of ${totalAreas} area${totalAreas !== 1 ? "s" : ""} practised`
                    : "Take quizzes to reveal your mastery map"}
                </p>
              </div>
            </div>
            {/* Legend pills */}
            <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
              <div className="flex items-center gap-1.5">
                <span className="w-6 border-t-2 border-dashed border-muted-foreground/60 inline-block" />
                <span className="text-[10px] text-muted-foreground">75% target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: radarColor, opacity: 0.7 }} />
                <span className="text-[10px] text-muted-foreground">your score</span>
              </div>
            </div>
          </div>

          {hasRadarData ? (
            <>
              <div className="w-full -mx-2" style={{ height: isMobile ? 300 : 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? "70%" : "78%"}
                    data={radarData}
                    margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="area"
                      tickLine={false}
                      tick={({ x, y, payload, cx: chartCx, cy: chartCy, index }: any) => {
                        const dx = x - (chartCx || 0);
                        const dy = y - (chartCy || 0);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const push = isMobile ? 8 : 10;
                        const lx = dist > 0 ? x + (dx / dist) * push : x;
                        const ly = dist > 0 ? y + (dy / dist) * push : y;
                        const isTop = dy < -2;
                        const isBottom = dy > 2;
                        const anchor =
                          Math.abs(dx) < 12 ? "middle" : dx > 0 ? "start" : "end";

                        const datum: any = radarData[index] || {};
                        const prefix: string = datum.labelPrefix || "";
                        const subtitle: string = datum.labelSubtitle || datum.fullTitle || "";
                        // Wrap subtitle to up to 2 lines so the chart can stay big
                        const maxChars = isMobile ? 12 : 16;
                        const lines = wrapSubtitle(subtitle, maxChars, 2);

                        const prefixSize = isMobile ? 11 : 13;
                        const subSize = isMobile ? 9 : 10;
                        const lineH = subSize + 2;

                        // When the label sits above the chart, render subtitle ABOVE the prefix
                        // so neither overlaps the polygon.
                        const blockHeight =
                          (prefix ? prefixSize : 0) + lines.length * lineH;
                        const startY = isTop
                          ? ly - blockHeight + prefixSize / 2
                          : isBottom
                          ? ly + prefixSize / 2
                          : ly - ((lines.length * lineH) / 2) + prefixSize / 2;

                        return (
                          <g>
                            {prefix && (
                              <text
                                x={lx}
                                y={startY}
                                textAnchor={anchor}
                                dominantBaseline="central"
                                fill="hsl(var(--foreground))"
                                fontSize={prefixSize}
                                fontWeight={700}
                              >
                                {prefix}
                              </text>
                            )}
                            {lines.map((line, i) => (
                              <text
                                key={i}
                                x={lx}
                                y={startY + (prefix ? prefixSize / 2 + 2 : 0) + i * lineH + lineH / 2}
                                textAnchor={anchor}
                                dominantBaseline="central"
                                fill="hsl(var(--muted-foreground))"
                                fontSize={subSize}
                                fontWeight={500}
                              >
                                {line}
                              </text>
                            ))}
                            {/* Fallback: when there is no prefix and subtitle wrapped to nothing */}
                            {!prefix && lines.length === 0 && (
                              <text
                                x={lx}
                                y={ly}
                                textAnchor={anchor}
                                dominantBaseline="central"
                                fill="hsl(var(--muted-foreground))"
                                fontSize={subSize}
                              >
                                {payload.value}
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tickCount={5}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    {/* 75% pass-threshold reference ring */}
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      fill="transparent"
                      fillOpacity={0}
                    />
                    {/* Student's actual mastery */}
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke={radarColor}
                      fill={radarColor}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        if (!d) return null;
                        const aboveTarget = d.score >= 75;
                        return (
                          <div className="bg-popover border border-border rounded-md px-2 py-1.5 shadow-md text-left min-w-[120px] max-w-[180px]">
                            <p className="text-xs font-semibold text-foreground leading-tight mb-0.5 line-clamp-2">{d.fullTitle}</p>
                            {d.weight && (
                              <p className="text-[10px] text-muted-foreground mb-1">Weight: {d.weight}</p>
                            )}
                            {d.attempted > 0 ? (
                              <>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] text-muted-foreground">Mastery</span>
                                  <span className={`text-xs font-bold ${getScoreColor(d.score)}`}>
                                    {d.score}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] text-muted-foreground">Qs</span>
                                  <span className="text-[10px] font-medium text-foreground">{d.attempted}</span>
                                </div>
                                <div className={`mt-1 text-[10px] font-medium ${aboveTarget ? "text-accent" : "text-yellow-500"}`}>
                                  {aboveTarget ? "Above target" : `${75 - d.score}% below`}
                                </div>
                              </>
                            ) : (
                              <p className="text-[10px] text-muted-foreground">Not practised yet</p>
                            )}
                          </div>
                        );
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Weak / strong legend */}
              {(weakestAreas.length > 0 || strongestAreas.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mt-3 pt-4 border-t border-border/50">
                  {weakestAreas.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Focus Areas
                      </p>
                      <div className="space-y-1.5">
                        {weakestAreas.map((area) => (
                          <div key={area.id} className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground truncate">
                              {area.syllabus_area_title || `Area ${area.syllabus_area_index + 1}`}
                            </span>
                            <span className="text-destructive font-semibold shrink-0">
                              {Math.round(Number(area.mastery_score))}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {strongestAreas.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Strengths
                      </p>
                      <div className="space-y-1.5">
                        {strongestAreas.map((area) => (
                          <div key={area.id} className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground truncate">
                              {area.syllabus_area_title || `Area ${area.syllabus_area_index + 1}`}
                            </span>
                            <span className="text-accent font-semibold shrink-0">
                              {Math.round(Number(area.mastery_score))}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty state — no quiz data yet */
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Your mastery map is empty</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Complete practice quizzes on any exam topic and your syllabus coverage will appear here.
              </p>
              {totalAreas > 0 && (
                <p className="text-xs text-muted-foreground/60 mt-3">
                  {totalAreas} exam area{totalAreas !== 1 ? "s" : ""} to cover
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Next Lesson */}
          {nextLesson ? (
            <Card className="p-5 border-primary/20 bg-primary/[0.03]">
              <div className="flex items-center gap-2 text-xs text-primary font-medium mb-3">
                <Zap className="w-3.5 h-3.5" />
                UP NEXT — Chapter {nextLessonIndex}
              </div>
              <h4 className="font-semibold text-foreground mb-1 leading-snug">{nextLesson.title}</h4>
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

          {/* Recommendations */}
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
              {[
                { label: "Lessons", value: readiness.lessonProgress },
                { label: "Quiz Performance", value: readiness.quizPerformance },
                { label: "Mock Exams", value: readiness.mockExamPerformance },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-medium ${getScoreColor(value)}`}>{value}%</span>
                  </div>
                  <Progress value={value} className="h-1.5" />
                </div>
              ))}
            </div>
            {readiness.lastActivityDays !== null && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Last active{" "}
                {readiness.lastActivityDays === 0
                  ? "today"
                  : readiness.lastActivityDays === 1
                  ? "yesterday"
                  : `${readiness.lastActivityDays} days ago`}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Lessons list */}
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
          {[...lessons]
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
