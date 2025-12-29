import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 hex-pattern">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl">
          {/* Heading */}
          <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            KICKSTART{" "}
            <span className="text-primary">YOUR CAREER</span>{" "}
            IN MANAGEMENT ACCOUNTING
          </h1>

          {/* Subheading */}
          <p className="animate-fade-up-delay-1 text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Master CIMA with modern, competency-based training trusted by leading organizations worldwide
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row items-start gap-4">
            <Link to="/courses">
              <Button size="xl">
                Register for Free
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="xl" variant="outline">
                Explore courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;