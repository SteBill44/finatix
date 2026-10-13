import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CIMA_LEVELS } from "@/lib/cimaLevels";

/** Course-catalogue style: one card per level with a level badge, contents list and clear action. */
const LevelsSection = () => (
  <section id="levels" aria-labelledby="levels-heading" className="scroll-mt-16 bg-background py-24 lg:py-32">
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our courses</p>
          <h2 id="levels-heading" className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-5xl">
            Four levels. One qualification.
          </h2>
        </div>
        <p className="max-w-md text-lg text-muted-foreground">
          Start where your experience puts you. From Operational onwards, each level ends with a case study exam.
        </p>
      </div>

      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {CIMA_LEVELS.map((lv, i) => (
          <li key={lv.id} className="group flex flex-col rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/50 lg:p-9">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Level 0{i + 1}
              </span>
              <span className="font-mono text-sm text-muted-foreground">{lv.subjects.join(" · ")}</span>
            </div>
            <h3 className="mt-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{lv.full}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{lv.who}</p>
            <ul className="mt-6 space-y-2 text-sm text-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{lv.subjects.length} subject papers</li>
              {lv.caseStudy && (
                <li className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <Link to={`/courses/${lv.caseStudy.slug}`} className="underline decoration-primary/50 underline-offset-4 hover:text-primary">
                    {lv.caseStudy.code} case study preparation
                  </Link>
                </li>
              )}
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{lv.award}</li>
            </ul>
            <div className="mt-auto pt-8">
              <Button asChild variant="outline" trace className="group/btn rounded-md">
                <Link to={`/courses?level=${lv.id}`}>
                  View {lv.name} courses
                  <ArrowRight className="transition-transform duration-200 group-hover/btn:translate-x-1 motion-reduce:transition-none" />
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default LevelsSection;
