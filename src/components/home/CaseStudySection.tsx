import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CIMA_LEVELS } from "@/lib/cimaLevels";

/** Inverted surface built from existing tokens: charcoal in light mode, off-white in dark mode. */
const CaseStudySection = () => (
  <section aria-labelledby="case-heading" className="bg-foreground py-24 text-background lg:py-36">
    <div className="container mx-auto px-4">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-primary">Case studies</p>
          <h2 id="case-heading" className="text-4xl font-bold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            Where each level
            <br />
            comes together.
          </h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed opacity-70">
          Each case study exam asks you to apply a whole level to a realistic business scenario. Finatix has a dedicated preparation course for each one.
        </p>
      </div>

      <ul className="mt-16 border-t border-background/25 lg:mt-24">
        {CIMA_LEVELS.filter((l) => l.caseStudy).map((l) => (
          <li key={l.id} className="border-b border-background/25">
            <Link
              to={`/courses/${l.caseStudy!.slug}`}
              className="group grid items-center gap-4 py-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[8rem_minmax(0,1fr)_auto] lg:py-10"
            >
              <span className="font-mono text-4xl font-light text-primary md:text-5xl">{l.caseStudy!.code}</span>
              <span>
                <span className="block text-xl font-semibold md:text-2xl">{l.name} Case Study</span>
                <span className="mt-1 block text-sm opacity-60">Builds on {l.subjects.join(", ")}</span>
              </span>
              <ArrowUpRight className="hidden h-7 w-7 transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none sm:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default CaseStudySection;
