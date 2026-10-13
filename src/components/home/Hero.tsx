import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/** Structural facts about the CIMA qualification and Finatix catalogue. Not learner metrics. */
const FACTS = [
  { v: "4", k: "Levels" },
  { v: "13", k: "Papers" },
  { v: "3", k: "Case study courses" },
  { v: "1", k: "Account" },
];

const Hero = () => (
  <section className="relative -mt-16 overflow-hidden border-b border-border bg-background pt-32 pb-16 lg:pt-40 lg:pb-20">
    <div aria-hidden="true" className="hero-atmosphere pointer-events-none absolute inset-0" />
    {/* Fine grid backdrop, tokens only */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
    />
    <div className="container relative mx-auto px-4 text-center">
      <p className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        Independent CIMA study
      </p>

      <h1 className="mx-auto mb-0 max-w-5xl text-[clamp(2.75rem,7.5vw,6.75rem)] font-bold leading-[0.98] tracking-[-0.04em] text-foreground">
        Your CIMA journey.{" "}
        <br className="hidden sm:block" />
        <span className="text-sheen">A clearer way forward.</span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
        Find your next step with Finatix, from Certificate level to Strategic case study, with a clear, focused approach to CIMA study.
      </p>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="xl" trace className="group rounded-md">
          <Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "explore_courses" })}>
            Explore CIMA Courses
            <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </Button>
        <Button asChild size="xl" variant="outline" trace className="group rounded-md">
          <a href="#levels" onClick={() => trackEvent("hero_cta_click", { cta: "find_level" })}>
            Find Your Level
            <ArrowDown className="transition-transform duration-200 ease-out group-hover:translate-y-0.5 motion-reduce:transition-none" />
          </a>
        </Button>
      </div>

      <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 divide-border overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur md:grid-cols-4 md:divide-x">
        {FACTS.map((f, i) => (
          <div key={f.k} className={`px-6 py-6 ${i < 2 ? "border-b border-border md:border-b-0" : ""} ${i % 2 === 0 ? "border-r border-border md:border-r-0" : ""}`}>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{f.k}</dt>
            <dd className="mt-2 text-4xl font-bold tracking-tight text-sheen">{f.v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-muted-foreground">
        Independent of AICPA &amp; CIMA.{" "}
        <Link to="/why-cima" className="font-medium text-foreground underline decoration-primary underline-offset-4 hover:text-primary">
          What is CIMA?
        </Link>
      </p>
    </div>
  </section>
);

export default Hero;
