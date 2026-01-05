import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const CTA = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 lg:py-32 bg-background hex-pattern">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-6">
            {user ? (
              <>
                Continue Your{" "}
                <span className="text-primary">Learning Journey</span>
              </>
            ) : (
              <>
                Start Learning{" "}
                <span className="text-primary">For Free</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {user
              ? "Pick up where you left off and keep making progress."
              : "Quick and easy setup. No credit card required."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button size="xl">Go to Dashboard</Button>
                </Link>
                <Link to="/courses">
                  <Button size="xl" variant="outline">
                    Browse Courses
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth?mode=signup">
                  <Button size="xl">Register for Free</Button>
                </Link>
                <Link to="/courses">
                  <Button size="xl" variant="outline">
                    Explore Courses
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;