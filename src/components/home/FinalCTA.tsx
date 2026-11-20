import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
const FinalCTA = () => <section className="section-space border-t border-border bg-secondary/50"><div className="container flex flex-col justify-between gap-8 px-5 md:px-8 lg:flex-row lg:items-end"><div><p className="eyebrow">Your next chapter</p><h2 className="section-title max-w-lg">Make room for<br /><span className="text-primary">what comes next.</span></h2><p className="mt-5 max-w-md text-muted-foreground">Find your exam and bring your CIMA study into focus.</p></div><Button asChild size="xl" trace className="self-start lg:self-auto"><Link to="/courses" onClick={() => trackEvent("hero_cta_click", { cta: "final_explore_courses" })}>Explore CIMA Courses<ArrowRight /></Link></Button></div></section>;
export default FinalCTA;
