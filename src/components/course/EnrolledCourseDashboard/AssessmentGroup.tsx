import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle, Play, RotateCcw, ArrowRight } from "lucide-react";

export type AssessmentGroupItem = {
  id: string;
  title: string;
  type: "lesson_quiz" | "mock_exam" | "final_exam" | "other";
  attemptsCount: number;
  bestScorePct: number | null;
  passed: boolean;
};

interface Props {
  label: string;
  icon: React.ReactNode;
  items: AssessmentGroupItem[];
  onLaunch: (item: AssessmentGroupItem) => void;
  getScoreColor: (score: number) => string;
  highlight?: boolean;
  defaultOpen?: boolean;
}

export const AssessmentGroup = ({
  label,
  icon,
  items,
  onLaunch,
  getScoreColor,
  highlight = false,
  defaultOpen = false,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = items.filter((i) => i.passed).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border border-border/50 rounded-md">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors ${
            highlight ? "bg-primary/[0.04]" : ""
          }`}
        >
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            {icon}
            {label}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {completedCount}/{items.length} passed
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 px-2 pb-2 pt-1">
          {items.map((item) => {
            const notStarted = item.attemptsCount === 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onLaunch(item)}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition-colors ${
                  highlight
                    ? "border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.06]"
                    : item.passed
                    ? "border-accent/20 bg-accent/[0.04] hover:bg-accent/[0.08]"
                    : "border-border/60 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    item.passed
                      ? "bg-accent/15 text-accent"
                      : item.attemptsCount > 0
                      ? "bg-yellow-500/15 text-yellow-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : item.attemptsCount > 0 ? (
                    <RotateCcw className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {notStarted
                      ? "Not started"
                      : `${item.attemptsCount} attempt${item.attemptsCount !== 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {item.bestScorePct !== null ? (
                    <>
                      <p className={`text-xs font-bold ${getScoreColor(item.bestScorePct)}`}>
                        {item.bestScorePct}%
                      </p>
                      <p className="text-[9px] text-muted-foreground leading-none">best</p>
                    </>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
