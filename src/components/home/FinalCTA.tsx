import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOME_CTAS } from "@/lib/courseAvailability";
import { trackEvent } from "@/lib/analytics";

const FinalCTA = () => (
  <section className="border-t border-border bg-background py-16 lg:py-20">
    <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
      <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Try a BA1 lesson quiz and see how the explanations work.
      </h2>
      <Button asChild size="xl" className="group">
        <Link to={HOME_CTAS.startPractising} onClick={() => trackEvent("hero_cta_click", { cta: "final_start_practising" })}>
          Start practising free
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>
      </Button>
    </div>
  </section>
);

export default FinalCTA;
