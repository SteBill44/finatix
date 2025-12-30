import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 hex-pattern hero-gradient-light overflow-hidden">
      {/* Animated gradient orbs for light mode visual interest */}
      <div className="gradient-orb gradient-orb-primary w-[500px] h-[500px] -top-20 -left-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-accent w-[400px] h-[400px] top-1/3 right-0 pointer-events-none" />
      <div className="gradient-orb gradient-orb-primary w-[350px] h-[350px] bottom-20 left-1/4 pointer-events-none" />
      
      {/* Tech/Finance Background Graphic */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-30 dark:opacity-10">
        <svg
          viewBox="0 0 800 800"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
            <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill="url(#grid)" />
          
          {/* Rising bar chart with gradient */}
          <g className="text-primary">
            <rect x="520" y="450" width="40" height="120" rx="4" fill="url(#barGradient)" />
            <rect x="580" y="380" width="40" height="190" rx="4" fill="url(#barGradient)" />
            <rect x="640" y="300" width="40" height="270" rx="4" fill="url(#barGradient)" />
            <rect x="700" y="220" width="40" height="350" rx="4" fill="url(#barGradient)" />
          </g>
          
          {/* Trend line */}
          <path
            d="M 100 500 Q 200 480 300 420 T 500 320 T 700 180"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-accent"
            strokeLinecap="round"
          />
          
          {/* Data points on trend with glow effect */}
          <g className="text-accent">
            <circle cx="100" cy="500" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="100" cy="500" r="6" fill="currentColor" />
            <circle cx="300" cy="420" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="300" cy="420" r="6" fill="currentColor" />
            <circle cx="500" cy="320" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="500" cy="320" r="6" fill="currentColor" />
            <circle cx="700" cy="180" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="700" cy="180" r="6" fill="currentColor" />
          </g>
          
          {/* Pie chart segment */}
          <g transform="translate(200, 250)">
            <circle cx="0" cy="0" r="80" fill="none" stroke="currentColor" strokeWidth="20" className="text-muted" opacity="0.2" />
            <circle
              cx="0"
              cy="0"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              strokeDasharray="150 350"
              strokeDashoffset="0"
              className="text-primary"
              opacity="0.7"
            />
            <circle
              cx="0"
              cy="0"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              strokeDasharray="100 400"
              strokeDashoffset="-150"
              className="text-accent"
              opacity="0.7"
            />
          </g>
          
          {/* Circuit/tech nodes */}
          <g className="text-primary">
            <circle cx="450" cy="150" r="8" fill="currentColor" opacity="0.6" />
            <circle cx="550" cy="100" r="5" fill="currentColor" opacity="0.5" />
            <circle cx="350" cy="200" r="6" fill="currentColor" opacity="0.7" />
            <line x1="450" y1="150" x2="550" y2="100" stroke="currentColor" strokeWidth="2" opacity="0.4" />
            <line x1="450" y1="150" x2="350" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          </g>
          
          {/* Hexagon tech element */}
          <polygon
            points="650,80 690,60 730,80 730,120 690,140 650,120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
            opacity="0.5"
          />
        </svg>
      </div>
      
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
          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row items-start gap-4">
            <Link to="/auth?mode=signup">
              <Button size="xl" className="shadow-lg shadow-primary/20">
                Register for Free
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="xl" variant="outline" className="shadow-sm bg-background/80 backdrop-blur-sm">
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