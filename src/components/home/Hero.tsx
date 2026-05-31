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
      {/* Cinematic noir backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Noir spotlight */}
        <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/20 dark:bg-primary/15 blur-[160px] animate-cinema-pulse" />
        {/* Anamorphic lens flare streak */}
        <div className="absolute top-[46%] -left-[10%] w-[120%] h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent blur-[1px] animate-cinema-drift" />
        <div className="absolute top-[46%] -left-[10%] w-[120%] h-1.5 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-[14px] animate-cinema-drift" />
        {/* Subtle grain via radial dots */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_95%)]" />
        {/* Letterbox bars */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background to-transparent z-20" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent z-20" />
      </div>

      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="container mx-auto px-4 py-20 relative z-10"
      >
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-[10px] md:text-xs font-black tracking-[0.5em] uppercase text-primary">
              The Future of Finance
            </span>
          </motion.div>

          {/* Heading */}
          <div className="text-5xl md:text-7xl lg:text-8xl font-black italic leading-[0.88] mb-8 tracking-tighter uppercase">
            <SplitTextReveal
              as="span"
              delay={0.2}
              className="block text-charcoal dark:text-white"
            >
              LAUNCH YOUR
            </SplitTextReveal>
            <SplitTextReveal
              as="span"
              delay={0.35}
              className="block bg-gradient-to-b from-charcoal to-charcoal/50 dark:from-white dark:to-white/40 bg-clip-text text-transparent"
            >
              CAREER IN
            </SplitTextReveal>
            <SplitTextReveal
              as="span"
              delay={0.5}
              className="block text-primary [text-shadow:0_0_35px_hsl(var(--primary)/0.45)]"
            >
              MANAGEMENT
            </SplitTextReveal>
            <SplitTextReveal
              as="span"
              delay={0.65}
              className="block text-primary [text-shadow:0_0_35px_hsl(var(--primary)/0.45)]"
            >
              ACCOUNTING
            </SplitTextReveal>
          </div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-charcoal/75 dark:text-white/70 max-w-xl mb-12 font-light leading-relaxed border-l border-primary/50 pl-6"
          >
            Build exam-ready confidence with structured CIMA lessons, adaptive practice, mock exams, progress insights, and focused revision tools for every qualification level.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <MagneticButton strength={0.08}>
              <Link to="/auth?mode=signup">
                <Button
                  size="xl"
                  className="shadow-lg shadow-primary/30 group transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 uppercase tracking-widest text-xs font-bold"
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
                  className="shadow-md bg-white/70 border-charcoal/30 text-charcoal hover:bg-white/90 hover:border-charcoal/50 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 dark:hover:border-white/40 backdrop-blur-md group transition-all duration-300 hover:shadow-lg uppercase tracking-widest text-xs font-bold"
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
                  variant="ghost"
                  className="text-charcoal/70 dark:text-white/60 hover:text-primary dark:hover:text-primary uppercase tracking-widest text-xs font-bold"
                >
                  <GraduationCap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Why CIMA?
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Cinematic frame markers */}
      <div className="hidden md:flex absolute bottom-6 right-8 z-20 gap-6 text-[10px] font-mono tracking-[0.2em] uppercase text-primary/40">
        <span>LAT: 51.5074 N</span>
        <span>FRAME: 0042 / FTX</span>
        <span className="text-charcoal/40 dark:text-white/30 underline decoration-primary">REC</span>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-charcoal dark:text-white/80 uppercase tracking-[0.2em] font-semibold">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-charcoal/70 dark:border-white/60 flex items-start justify-center pt-1.5"
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
