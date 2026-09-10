import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Sparkles, X } from "lucide-react";
import { journeyAnalytics } from "@/lib/analytics";
import { isJourneySelectorSkipped, skipJourneySelector } from "@/lib/learningContext";

/**
 * A short, skippable strip on the homepage that routes visitors into the
 * three entry journeys. Dismissed state is remembered locally.
 */
const OPTIONS = [
  { id: "new" as const, to: "/start/new", icon: Sparkles, label: "I'm new to CIMA" },
  { id: "paper" as const, to: "/start/paper", icon: BookOpen, label: "I'm studying for a paper" },
  { id: "case-study" as const, to: "/start/case-study", icon: FileText, label: "I'm preparing for a case study" },
];

const JourneyPicker = () => {
  const [dismissed, setDismissed] = useState(() => isJourneySelectorSkipped());

  if (dismissed) return null;

  return (
    <section aria-labelledby="journey-picker-heading" className="border-y border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 id="journey-picker-heading" className="text-sm font-semibold text-foreground">
            Where are you starting from?
          </h2>
          <div className="flex flex-1 flex-wrap gap-2 md:justify-end">
            {OPTIONS.map(({ id, to, icon: Icon, label }) => (
              <Link
                key={id}
                to={to}
                onClick={() => journeyAnalytics.selected({ journey: id })}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/60 hover:bg-secondary/60"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                skipJourneySelector();
                journeyAnalytics.skipped({ from: "/" });
                setDismissed(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Skip
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyPicker;
