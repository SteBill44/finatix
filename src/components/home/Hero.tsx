import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import HeroPreview from "./HeroPreview";
import { HOME_CTAS } from "@/lib/courseAvailability";
import { trackEvent } from "@/lib/analytics";

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background pt-28 pb-16 lg:pt-32 lg:pb-24 -mt-16">
      {/* One restrained accent, no glow blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-16">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Independent CIMA study platform
            </p>

            <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your next CIMA exam, <span className="text-gradient-brand">with a clearer way forward.</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Practise BA1 and BA2 free: about 190 exam-style questions per paper, organised by lesson, each with a
              worked explanation. Other courses show their outline while they're being written.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="xl" className="group shadow-lg shadow-primary/20">
                <Link
                  to={HOME_CTAS.startPractising}
                  onClick={() => trackEvent("hero_cta_click", { cta: "start_practising" })}
                >
                  Start practising free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <a href={HOME_CTAS.explore} onClick={() => trackEvent("hero_cta_click", { cta: "explore_platform" })}>
                  Explore the platform
                  <ArrowDown className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free account, no card needed. Not affiliated with CIMA.{" "}
              <Link to={HOME_CTAS.whyCima} className="font-medium text-primary hover:underline">
                What is CIMA?
              </Link>
            </p>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  );
};

export default Hero;
