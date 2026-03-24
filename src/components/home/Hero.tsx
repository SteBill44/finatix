import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12 hex-pattern hero-gradient-light overflow-hidden -mt-16">
      {/* Top gradient fade for smooth navbar transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-[1]" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="gradient-orb gradient-orb-primary w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] -top-20 -left-20 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="gradient-orb gradient-orb-accent w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] top-1/3 -right-20 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="gradient-orb gradient-orb-primary w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bottom-20 left-1/4 pointer-events-none"
      />

      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[15%] w-16 h-16 rounded-2xl border-2 border-primary/20 bg-primary/5 pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-32 right-[25%] w-10 h-10 rounded-full border-2 border-accent/20 bg-accent/5 pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[40%] right-[10%] w-8 h-8 rounded-lg border-2 border-primary/15 bg-primary/5 pointer-events-none hidden lg:block"
      />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now enrolling — Limited free access
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight"
          >
            KICKSTART{" "}
            <span className="text-primary drop-shadow-sm">YOUR CAREER</span>{" "}
            IN MANAGEMENT ACCOUNTING
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Master CIMA with modern, competency-based training trusted by leading professionals worldwide
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link to="/auth?mode=signup">
              <Button 
                size="xl" 
                className="shadow-lg shadow-primary/20 group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
              >
                Register for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button 
                size="xl" 
                variant="outline" 
                className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
              >
                <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Explore courses
              </Button>
            </Link>
            <Link to="/why-cima">
              <Button 
                size="xl" 
                variant="outline" 
                className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
              >
                <GraduationCap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Why CIMA?
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
