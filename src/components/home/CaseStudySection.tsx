import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CIMA_LEVELS } from "@/lib/cimaLevels";

const CaseStudySection = () => (
  <section aria-labelledby="case-heading" className="bg-background py-20 lg:py-28">
    <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-center lg:gap-20">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Case studies</p>
        <h2 id="case-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Where each level comes together
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Each case study exam asks you to apply a whole level to a realistic business scenario. Finatix has a dedicated preparation course for each one: OCS, MCS and SCS.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Each course page sets out what the course covers and how to access it.
        </p>
      </div>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {CIMA_LEVELS.filter((l) => l.caseStudy).map((l) => (
          <li key={l.id}>
            <Link
              to={`/courses/${l.caseStudy!.slug}`}
              className="group flex items-center justify-between gap-4 p-6 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span>
                <span className="block font-semibold text-foreground">{l.name} Case Study ({l.caseStudy!.code})</span>
                <span className="mt-1 block text-sm text-muted-foreground">Builds on {l.subjects.join(", ")}</span>
              </span>
              <ArrowRight className="h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default CaseStudySection;
