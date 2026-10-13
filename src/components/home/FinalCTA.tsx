import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const FinalCTA = () => (
  <section className="border-t border-border bg-card py-20 lg:py-24">
    <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
      <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Find the right course for your next CIMA exam.
      </h2>
      <p className="max-w-xl text-muted-foreground">
        Choose your level and see everything each course covers.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="xl" className="group">
          <Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "final_explore_courses" })}>
            Explore CIMA Courses
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </Button>
        <Button asChild size="xl" variant="outline">
          <Link to="/start">Not sure where to start?</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default FinalCTA;
