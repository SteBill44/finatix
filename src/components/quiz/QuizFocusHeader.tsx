import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizFocusHeaderProps {
  title: string;
  exitTo?: string; // link-based exit
  onExit?: () => void; // callback-based exit (e.g. reset session state)
  current: number; // 1-based question number
  total: number;
  right?: ReactNode; // timer, mode switch, etc.
}

/**
 * Minimal sticky header for full-screen quiz/exam focus mode.
 * Replaces the old gradient hero that pushed questions below the fold.
 */
const QuizFocusHeader = ({ title, exitTo, onExit, current, total, right }: QuizFocusHeaderProps) => {
  const progress = total > 0 ? (current / total) * 100 : 0;

  const exitClasses =
    "flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shrink-0";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-4 h-14">
        {exitTo ? (
          <Link to={exitTo} aria-label="Exit quiz" className={exitClasses}>
            <X className="w-5 h-5" />
          </Link>
        ) : (
          <button type="button" onClick={onExit} aria-label="Exit quiz" className={exitClasses}>
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground">
            Question {current} of {total}
          </p>
        </div>

        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>

      <Progress value={progress} className="h-1 rounded-none" aria-label={`${Math.round(progress)}% complete`} />
    </header>
  );
};

export default QuizFocusHeader;
