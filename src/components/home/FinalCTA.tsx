import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const FinalCTA = () => (
  <section className="relative overflow-hidden py-20 md:py-28">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))]" aria-hidden="true" />
    <div className="hex-pattern pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
    <div className="container relative z-10 mx-auto flex flex-col items-start gap-8 px-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="max-w-2xl text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
          Make room for <span className="text-primary">what comes next.</span>
        </h2>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">Find your exam and bring your CIMA study into focus.</p>
      </div>
      <Button asChild size="xl" trace className="shadow-lg shadow-primary/20">
        <Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "final_explore_courses" })}>Explore CIMA Courses<ArrowRight /></Link>
      </Button>
    </div>
  </section>
);

export default FinalCTA;
