import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-20 lg:py-32 bg-background hex-pattern">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-6">
            Start Learning{" "}
            <span className="text-primary">For Free</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Quick and easy setup. No credit card required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="xl">
                Register for Free
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="xl" variant="outline">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;