import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CIMA_LEVELS } from "@/lib/cimaLevels";

const LevelsSection = () => {
  return (
    <section id="levels" aria-labelledby="levels-heading" className="scroll-mt-20 bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Find your place</p>
          <h2 id="levels-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Four levels, one qualification
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start where your experience puts you. Each level builds on the last and ends with a case study exam from Operational onwards.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {CIMA_LEVELS.map((lv, i) => {
            return (
              <article key={lv.id} className="flex flex-col bg-background p-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{lv.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lv.who}</p>
                <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Subjects</dt><dd className="font-medium text-foreground">{lv.subjects.join(", ")}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Case study</dt><dd className="font-medium text-foreground">{lv.caseStudy?.code ?? "None"}</dd></div>
                </dl>
                <div className="mt-6 flex flex-col gap-2">
                <Link
                  to={`/courses?level=${lv.id}`}
                  className="group inline-flex items-center gap-1 rounded text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View {lv.name} courses
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </Link>
                {lv.caseStudy && (
                  <Link to={`/courses/${lv.caseStudy.slug}`} className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {lv.caseStudy.code} case study
                  </Link>
                )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;
