import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Calendar } from "lucide-react";
import { getScoreColor } from "./helpers";
import type { ReadinessScore } from "@/hooks/useReadinessScore";

interface Props {
  readiness: ReadinessScore;
}

export const ReadinessBreakdown = ({ readiness }: Props) => {
  const items = [
    { label: "Lessons", value: readiness.lessonProgress },
    { label: "Quiz Performance", value: readiness.quizPerformance },
    { label: "Mock Exams", value: readiness.mockExamPerformance },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-4">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        Readiness Breakdown
      </div>
      <div className="space-y-3">
        {items.map(({ label, value }) => (
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
  );
};
