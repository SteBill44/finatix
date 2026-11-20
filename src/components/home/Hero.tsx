import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/** April 2026 design language: warm atmospheric hero, bold caps headline. Content is visible on first paint. */
const Hero = () => (
  <section className="relative -mt-16 flex min-h-[92vh] flex-col justify-center overflow-hidden pb-12 pt-24">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))]" aria-hidden="true" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-primary/25 dark:via-primary/20 dark:to-primary/40" aria-hidden="true" />
    <div className="hex-pattern pointer-events-none absolute inset-0 opacity-80 dark:opacity-100" aria-hidden="true" />
    <div className="gradient-orb gradient-orb-primary pointer-events-none -left-20 -top-20 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px]" aria-hidden="true" />
    <div className="gradient-orb gradient-orb-accent pointer-events-none -right-20 top-1/4 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px]" aria-hidden="true" />

    <div className="container relative z-10 mx-auto px-4 py-20">
      <div className="max-w-4xl">
        <h1 className="mb-6 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          <Link to="/cima-journey" className="rounded hover:opacity-90">
            <span className="block text-foreground">Launch your career</span>
            <span className="block text-primary">in management accounting.</span>
          </Link>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          A focused digital study platform for the entire CIMA qualification. Your lessons, revision and progress, together in one place.
        </p>
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <Button asChild size="xl" trace className="shadow-lg shadow-primary/20">
            <Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "explore_courses" })}>Explore CIMA Courses<ArrowRight /></Link>
          </Button>
          <Button asChild size="xl" trace variant="outline" className="bg-background/70 backdrop-blur-md">
            <Link to="/cima-journey" onClick={() => trackEvent("hero_cta_click", { cta: "cima_journey" })}>See the CIMA Journey<ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
