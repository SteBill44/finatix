import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SplitTextReveal from "./SplitTextReveal";
import MagneticButton from "./MagneticButton";

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-12 overflow-hidden -mt-16"
    >
      {/* Solid base background — dark in dark mode, warm cream in light mode */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          background:
            "linear-gradient(135deg, #FFFDF9 0%, #FFF0E3 42%, #FFC489 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background:
            "linear-gradient(135deg, #351303 0%, #1D0B04 48%, #080608 100%)",
        }}
      />


      {/* Warm gradient overlay — lighter wash in light mode, dramatic in dark mode */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,237,219,0.26) 28%, hsl(var(--brand-orange) / 0.28) 64%, hsl(var(--brand-orange-light) / 0.38) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background:
            "linear-gradient(135deg, rgba(48,18,4,0.56) 0%, rgba(34,13,5,0.44) 30%, hsl(var(--brand-orange) / 0.42) 65%, hsl(var(--brand-orange-dark) / 0.58) 100%)",
        }}
      />

      <div className="absolute inset-0 hex-pattern opacity-80 dark:opacity-100 pointer-events-none" />
      <div className="gradient-orb gradient-orb-primary w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -top-20 -left-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-accent w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-1/4 -right-20 pointer-events-none" />

      {/* Top gradient fade for smooth navbar transition (subtler in light mode) */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/10 dark:from-black/40 to-transparent pointer-events-none z-[1]" />

      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="container mx-auto px-4 py-20 relative z-10"
      >
        <div className="max-w-4xl">
          {/* Heading */}
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 tracking-tight">
            <SplitTextReveal
              as="span"
              delay={0.2}
              className="block text-charcoal dark:text-white"
            >
              LAUNCH YOUR CAREER IN
            </SplitTextReveal>
            <SplitTextReveal
              as="span"
              delay={0.5}
              className="block text-primary drop-shadow-sm"
            >
              MANAGEMENT ACCOUNTING
            </SplitTextReveal>
          </div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-charcoal/75 dark:text-white/70 max-w-2xl mb-10"
          >
            Build exam-ready confidence with structured CIMA lessons, adaptive practice, mock exams, progress insights, and focused revision tools for every qualification level.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <MagneticButton strength={0.08}>
              <Link to="/auth?mode=signup">
                <Button
                  size="xl"
                  className="shadow-lg shadow-primary/20 group transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.08}>
              <Link to="/courses">
                <Button
                  size="xl"
                  variant="outline"
                  className="shadow-md bg-white/70 border-charcoal/30 text-charcoal hover:bg-white/90 hover:border-charcoal/50 dark:bg-black/50 dark:border-white/40 dark:text-white dark:hover:bg-black/70 dark:hover:border-white/60 backdrop-blur-md group transition-all duration-300 hover:shadow-lg"
                >
                  <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Explore courses
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.08}>
              <Link to="/why-cima">
                <Button
                  size="xl"
                  variant="outline"
                  className="shadow-md bg-white/70 border-charcoal/30 text-charcoal hover:bg-white/90 hover:border-charcoal/50 dark:bg-black/50 dark:border-white/40 dark:text-white dark:hover:bg-black/70 dark:hover:border-white/60 backdrop-blur-md group transition-all duration-300 hover:shadow-lg"
                >
                  <GraduationCap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Why CIMA?
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-charcoal/50 dark:text-white/40 uppercase tracking-[0.2em] font-medium">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-charcoal/30 dark:border-white/20 flex items-start justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-charcoal/50 dark:bg-white/40"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
