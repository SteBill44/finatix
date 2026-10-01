import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, Sparkles } from "lucide-react";
import { journeyAnalytics } from "@/lib/analytics";
import { HOME_CTAS } from "@/lib/courseAvailability";

const OPTIONS = [
  {
    id: "new" as const,
    to: HOME_CTAS.newToCima,
    icon: Sparkles,
    title: "I'm new to CIMA",
    text: "Start with the free Certificate level. BA1 and BA2 have full question banks.",
  },
  {
    id: "paper" as const,
    to: HOME_CTAS.paper,
    icon: BookOpen,
    title: "I'm studying a paper",
    text: "Pick your paper to see its outline and what's available today.",
  },
  {
    id: "case-study" as const,
    to: HOME_CTAS.caseStudy,
    icon: FileText,
    title: "I'm preparing for a case study",
    text: "Case study preparation is in development. See what's planned and register interest.",
  },
];

const StartChooser = () => (
  <section aria-labelledby="start-heading" className="border-y border-border bg-background py-16 lg:py-20">
    <div className="container mx-auto px-4">
      <h2 id="start-heading" className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Where are you starting from?
      </h2>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {OPTIONS.map(({ id, to, icon: Icon, title, text }) => (
          <Link
            key={id}
            to={to}
            onClick={() => journeyAnalytics.selected({ journey: id })}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default StartChooser;
