import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const Hero = () => <section className="border-b border-border bg-background py-14 md:py-20 lg:py-24">
  <div className="container px-5 md:px-8">
    <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-primary" aria-hidden="true" />Finatix / Independent CIMA study</p>
    <h1 className="hero-title max-w-5xl">Your CIMA journey. <span className="block text-primary">A clearer way forward.</span></h1>
    <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
      <div className="max-w-xl"><p className="text-lg text-muted-foreground md:text-xl">A focused digital study platform for the entire CIMA qualification. Your lessons, revision and progress — together in one place.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button asChild size="xl" trace><Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "explore_courses" })}>Explore CIMA Courses<ArrowRight /></Link></Button><Button asChild size="xl" trace variant="outline"><a href="#levels" onClick={() => trackEvent("hero_cta_click", { cta: "find_level" })}>Find Your Level<ArrowDown /></a></Button></div>
      </div>
      <div className="flex gap-8 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0" aria-label="Qualification structure">
        {[{ value: "16", label: "CIMA exams" }, { value: "4", label: "Qualification levels" }, { value: "1", label: "Connected platform" }].map(({ value, label }) => <div key={label}><span className="font-display text-3xl font-medium md:text-4xl">{value}</span><p className="mt-1 max-w-[12ch] text-xs text-muted-foreground">{label}</p></div>)}
      </div>
    </div>
  </div>
</section>;
export default Hero;
