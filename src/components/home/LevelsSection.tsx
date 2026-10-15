import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CIMA_LEVELS } from "@/lib/cimaLevels";

const LevelsSection = () => (
  <section id="levels" aria-labelledby="levels-heading" className="scroll-mt-16 bg-background py-24 lg:py-36">
    <div className="container mx-auto grid gap-14 px-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-primary">Find your place</p>
        <h2 id="levels-heading" className="text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:text-6xl">
          Four levels.
          <br />
          One qualification.
        </h2>
        <p className="mt-6 max-w-sm text-lg text-muted-foreground">
          Start where your experience puts you. From Operational onwards, each level ends with a case study exam.
        </p>
      </div>

      <ol className="border-t border-foreground/80">
        {CIMA_LEVELS.map((lv, i) => (
          <li key={lv.id} className="grid gap-6 border-b border-border py-10 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,14rem)] md:gap-8 lg:py-12">
            <span className="font-mono text-5xl font-light leading-none tracking-tight text-primary md:text-6xl">0{i + 1}</span>
            <div>
              <h3 className="mb-0 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{lv.full}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{lv.who}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">{lv.award}</p>
            </div>
            <div className="flex flex-col gap-3 text-sm md:items-end md:text-right">
              <span className="font-mono text-foreground">{lv.subjects.join("  ")}</span>
              <Link
                to={`/courses?level=${lv.id}`}
                className="group inline-flex items-center gap-1 rounded font-medium text-foreground underline decoration-primary/60 underline-offset-4 hover:text-primary"
              >
                View {lv.name} courses
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
              {lv.caseStudy && (
                <Link to={`/courses/${lv.caseStudy.slug}`} className="rounded text-muted-foreground hover:text-primary">
                  {lv.caseStudy.code} case study
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default LevelsSection;
