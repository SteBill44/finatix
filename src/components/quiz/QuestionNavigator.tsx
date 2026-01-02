import { cn } from "@/lib/utils";
import { Flag, Check } from "lucide-react";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigate: (index: number) => void;
}

const QuestionNavigator = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onNavigate,
}: QuestionNavigatorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Question Navigator</h3>
        <span className="text-sm text-muted-foreground">
          {answeredQuestions.size} / {totalQuestions} answered
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isAnswered = answeredQuestions.has(i);
          const isFlagged = flaggedQuestions.has(i);
          const isCurrent = i === currentQuestion;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={cn(
                "relative w-10 h-10 rounded-lg font-medium text-sm transition-all",
                isCurrent
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "",
                isAnswered
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {i + 1}
              {isFlagged && (
                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-yellow-500" />
              )}
              {isAnswered && !isFlagged && (
                <Check className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-accent" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flag className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;
