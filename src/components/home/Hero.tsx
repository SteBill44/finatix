import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CIMA_LEVELS } from "@/lib/cimaLevels";
import { useLevelAvailability } from "@/hooks/useLevelAvailability";
import { trackEvent } from "@/lib/analytics";

/** Qualification journey visual: the real CIMA structure, no product simulation. */
const Pathway = () => {
  const { forLevel } = useLevelAvailability();
  return (
    <ol aria-label="The CIMA qualification journey" className="relative space-y-3">
      <span aria-hidden="true" className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary via-primary/40 to-border" />
      {CIMA_LEVELS.map((lv, i) => {
        const s = forLevel(lv.id);
        return (
          <li key={lv.id}>
            <Link
              to={`/courses?level=${lv.id}`}
              className="group relative flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-4 backdrop-blur transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{lv.full}</span>
                  {s && (
                    <span className={`text-[11px] font-medium uppercase tracking-wide ${s.live ? "text-primary" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {lv.subjects.join(" · ")}
                  {lv.caseStudy && <> · {lv.caseStudy.code} case study</>}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};

const Hero = () => (
  <section className="relative -mt-16 overflow-hidden border-b border-border bg-background pt-28 pb-16 lg:pt-36 lg:pb-28">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    <div className="container relative z-10 mx-auto px-4">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Independent CIMA study platform</p>
          <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-[4.25rem]">
            Your CIMA journey.{" "}
            <span className="text-gradient-brand">A clearer way forward.</span>
          </h1>
          <p className="mb-9 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Find your next step with Finatix, from Certificate level to Strategic case study, with a clear, focused approach to CIMA study.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="xl" className="group">
              <Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "explore_courses" })}>
                Explore CIMA Courses
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <a href="#levels" onClick={() => trackEvent("hero_cta_click", { cta: "find_level" })}>Find Your Level</a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Independent of CIMA and AICPA.{" "}
            <Link to="/why-cima" className="font-medium text-primary hover:underline">What is CIMA?</Link>
          </p>
        </div>
        <Pathway />
      </div>
    </div>
  </section>
);

export default Hero;
