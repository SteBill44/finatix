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

  // Parallax values driven by scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden -mt-16"
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base warm wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.04]" />
        
        {/* Soft radial mesh spots */}
        <motion.div
          animate={{ opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%]"
          style={{
            background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[15%] w-[55%] h-[60%]"
          style={{
            background: "radial-gradient(ellipse at center, hsl(var(--accent) / 0.06) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%]"
          style={{
            background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.05) 0%, transparent 65%)",
          }}
        />

        {/* Fine noise grain overlay for texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* Top gradient fade for smooth navbar transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-[1]" />


      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="container mx-auto px-4 py-20 relative z-10"
      >
        <div className="max-w-4xl">

          {/* Heading — Lusion-style split text reveal */}
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            <SplitTextReveal
              as="span"
              delay={0.2}
              className="block"
            >
              KICKSTART YOUR CAREER
            </SplitTextReveal>
            <SplitTextReveal
              as="span"
              delay={0.5}
              className="block text-primary drop-shadow-sm"
            >
              IN MANAGEMENT ACCOUNTING
            </SplitTextReveal>
          </div>

          {/* Subheading — smooth blur-in */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Master CIMA with modern, competency-based training trusted by leading professionals worldwide
          </motion.p>

          {/* CTA Buttons — magnetic hover */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <MagneticButton strength={0.2}>
              <Link to="/auth?mode=signup">
                <Button
                  size="xl"
                  className="shadow-lg shadow-primary/20 group transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  Register for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link to="/courses">
                <Button
                  size="xl"
                  variant="outline"
                  className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:shadow-md hover:border-primary/50"
                >
                  <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Explore courses
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link to="/why-cima">
                <Button
                  size="xl"
                  variant="outline"
                  className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:shadow-md hover:border-primary/50"
                >
                  <GraduationCap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Why CIMA?
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator — Lusion-style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em] font-medium">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-muted-foreground/50"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
