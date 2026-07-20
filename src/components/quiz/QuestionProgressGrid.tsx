import { cn } from "@/lib/utils";

interface QuestionProgressGridProps {
  total: number;
  currentIndex: number; // 0-based
  isAnswered: (index: number) => boolean;
  isFlagged?: (index: number) => boolean;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Horizontally scrollable strip of numbered question buttons.
 * States: current (primary), answered (success tint), flagged (warning ring), unanswered (muted).
 */
const QuestionProgressGrid = ({
  total,
  currentIndex,
  isAnswered,
  isFlagged,
  onSelect,
  className,
}: QuestionProgressGridProps) => {
  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-0.5",
        className
      )}
      role="tablist"
      aria-label="Question navigation"
    >
      {Array.from({ length: total }, (_, index) => {
        const answered = isAnswered(index);
        const flagged = isFlagged?.(index) ?? false;
        const isCurrent = currentIndex === index;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Question ${index + 1}${answered ? ", answered" : ""}${flagged ? ", flagged" : ""}`}
            onClick={() => onSelect(index)}
            className={cn(
              "w-9 h-9 shrink-0 rounded-lg text-sm font-medium transition-all duration-150",
              isCurrent
                ? "bg-primary text-primary-foreground shadow-sm scale-105"
                : answered
                  ? "bg-success/15 text-success hover:bg-success/25"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70",
              flagged && !isCurrent && "ring-2 ring-warning/60"
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionProgressGrid;
