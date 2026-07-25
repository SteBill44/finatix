import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target, BookOpen, FileQuestion, GraduationCap,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { getScoreColor, getReadinessLabel } from "./helpers";
import type { ReadinessScore } from "@/hooks/useReadinessScore";

interface Props {
  readiness: ReadinessScore;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  scoreTrend: number | null;
  totalQuestionsAttempted: number;
}

export const StatsStrip = ({
  readiness,
  completedLessons,
  totalLessons,
  progressPercentage,
  scoreTrend,
  totalQuestionsAttempted,
}: Props) => {
  const readinessLabel = getReadinessLabel(readiness.overall);

  return (
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
            {readiness.quizzesTaken > 0 ? `${readiness.averageQuizScore}%` : "-"}
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
          {readiness.mockExamsTaken > 0 ? `${readiness.averageMockScore}%` : "-"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {readiness.mockExamsTaken > 0
            ? `${readiness.mockExamsTaken} exam${readiness.mockExamsTaken !== 1 ? "s" : ""} taken`
            : "No mocks attempted"}
        </p>
      </Card>
    </div>
  );
};
