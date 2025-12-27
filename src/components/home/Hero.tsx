import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const stats = [
    { value: "70,000+", label: "Students Trained", color: "text-primary" },
    { value: "4.9/5", label: "Average Rating", color: "text-primary" },
    { value: "95%", label: "Completion Rate", color: "text-accent" },
  ];

  const logos = [
    "Deloitte", "KPMG", "PwC", "EY", "Accenture", "HSBC", "Barclays", "Unilever"
  ];

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
          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row items-start gap-4 mb-16">
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

          {/* Trusted by */}
          <div className="animate-fade-up-delay-3">
            <p className="text-sm text-muted-foreground mb-6">Trusted by professionals from</p>
            <div className="overflow-hidden">
              <div className="flex gap-12 items-center opacity-50">
                {logos.map((logo, index) => (
                  <span key={index} className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;