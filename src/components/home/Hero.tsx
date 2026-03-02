import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { lazy, Suspense } from "react";

const HeroScene = lazy(() => import("./HeroScene"));

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12 hex-pattern hero-gradient-light overflow-hidden -mt-16">
      {/* Top gradient fade for smooth navbar transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-[2]" />
      
      {/* Animated gradient orbs for light mode visual interest */}
      <div className="gradient-orb gradient-orb-primary w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] -top-20 -left-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-accent w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] top-1/3 -right-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-primary w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bottom-20 left-1/4 pointer-events-none" />
      
      {/* 3D Scene */}
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl">
          {/* Heading */}
          <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            KICKSTART{" "}
            <span className="text-primary drop-shadow-sm">YOUR CAREER</span>{" "}
            IN MANAGEMENT ACCOUNTING
          </h1>

          {/* Subheading */}
          <p className="animate-fade-up-delay-1 text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Master CIMA with modern, competency-based training trusted by leading professionals worldwide
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link 
              to="/auth?mode=signup"
              className="opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]"
            >
              <Button 
                size="xl" 
                className="shadow-lg shadow-primary/20 group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
              >
                Register for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link 
              to="/courses"
              className="opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]"
            >
              <Button 
                size="xl" 
                variant="outline" 
                className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
              >
                <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Explore courses
              </Button>
            </Link>
            <Link 
              to="/why-cima"
              className="opacity-0 animate-[fade-in_0.5s_ease-out_0.7s_forwards]"
            >
              <Button 
                size="xl" 
                variant="outline" 
                className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
              >
                <GraduationCap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Why CIMA?
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
