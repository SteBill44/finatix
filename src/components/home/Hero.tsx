import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import QualificationMotif from "./QualificationMotif";
import { trackEvent } from "@/lib/analytics";

const Hero = () => (
  <section className="relative -mt-16 border-b border-border bg-background pt-28 pb-20 lg:pt-32 lg:pb-28">
    <div className="container mx-auto px-4">
      <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <span className="h-px w-10 bg-primary" aria-hidden="true" />
        Independent CIMA study
      </p>

      <h1 className="mb-0 max-w-[14ch] text-[clamp(3.25rem,min(9vw,11vh),9.5rem)] font-bold leading-[0.92] tracking-[-0.045em] text-foreground">
        Your CIMA{" "}
        <br className="hidden sm:block" />
        journey.{" "}
        <span className="text-primary">
          A clearer{" "}
          <br className="hidden sm:block" />
          way forward.
        </span>
      </h1>

      <div className="mt-10 grid items-end gap-12 border-t border-border pt-8 lg:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl">
            Find your next step with Finatix, from Certificate level to Strategic case study, with a clear, focused approach to CIMA study.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
          <p className="mt-6 text-sm text-muted-foreground">
            Independent of AICPA &amp; CIMA.{" "}
            <Link to="/why-cima" className="font-medium text-foreground underline decoration-primary underline-offset-4 hover:text-primary">
              What is CIMA?
            </Link>
          </p>
        </div>
        <div className="mx-auto w-full max-w-2xl lg:mx-0">
          <QualificationMotif />
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
