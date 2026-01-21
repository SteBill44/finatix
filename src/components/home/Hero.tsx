import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center pt-20 pb-16 -mt-16">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Master{" "}
            <span className="text-primary">CIMA</span>{" "}
            with confidence
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            Modern, competency-based training trusted by professionals worldwide
          </p>

          {/* CTA Buttons - simplified to 2 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button 
                size="lg" 
                className="shadow-md group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button 
                size="lg" 
                variant="outline"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;