import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SplitTextReveal from "./SplitTextReveal";
import MagneticButton from "./MagneticButton";
import FinanceCanvas from "./FinanceCanvas";

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
      className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden -mt-16"
    >
      {/* Solid base background so the area above the canvas stays on-brand */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #1C0D04 0%, #0F0806 50%, #06060A 100%)",
        }}
      />

      {/* Finance-themed canvas animation — confined to the lower half, behind the text */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none">
        <FinanceCanvas />
        {/* Soft fade at the top of the canvas so it blends into the background */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0F0806] to-transparent pointer-events-none" />
      </div>

      {/* Warm gradient overlay — charcoal at top-left fading into orange at bottom-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,6,4,0.4) 0%, rgba(20,10,5,0.3) 30%, hsl(var(--brand-orange) / 0.28) 65%, hsl(var(--brand-orange-dark) / 0.45) 100%)",
        }}
      />

      {/* Top gradient fade for smooth navbar transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[1]" />

      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="container mx-auto px-4 py-20 relative z-10"
      >
        <div className="max-w-4xl">
          {/* Heading */}
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            <SplitTextReveal
              as="span"
              delay={0.2}
              className="block text-white"
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
            className="text-lg md:text-xl text-white/70 max-w-2xl mb-10"
          >
            Master CIMA with modern, competency-based training trusted by leading professionals worldwide
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
                  Register for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.08}>
              <Link to="/courses">
                <Button
                  size="xl"
                  variant="outline"
                  className="shadow-md bg-black/50 border-white/40 text-white hover:bg-black/70 hover:border-white/60 backdrop-blur-md group transition-all duration-300 hover:shadow-lg"
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
                  className="shadow-md bg-black/50 border-white/40 text-white hover:bg-black/70 hover:border-white/60 backdrop-blur-md group transition-all duration-300 hover:shadow-lg"
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
        <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-white/40"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
