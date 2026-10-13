import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const FinalCTA = () => (
  <section className="section-warm border-t border-border py-28 lg:py-40">
    <div className="container mx-auto px-4">
      <h2 className="max-w-[16ch] text-[clamp(2.75rem,7vw,7rem)] font-bold leading-[0.95] tracking-[-0.045em] text-foreground">
        Your next CIMA exam <span className="text-sheen">starts here.</span>
      </h2>
      <div className="mt-12 flex flex-col gap-6 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md text-lg text-muted-foreground">Choose your level and see everything each course covers.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="xl" trace className="group rounded-md">
            <Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "final_explore_courses" })}>
              Explore CIMA Courses
              <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline" trace className="rounded-md">
            <Link to="/start">Not sure where to start?</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;
