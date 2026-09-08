import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, PlayCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import MagneticButton from "./MagneticButton";

const Hero = () => {
  return (
    <section className="relative flex flex-col justify-center pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden -mt-16 bg-secondary/[0.38]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              AI-powered CIMA learning platform
            </span>
          </motion.div>

          <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
            <SplitTextReveal as="span" delay={0.1} className="block text-charcoal dark:text-white">
              The smarter way
            </SplitTextReveal>
            <SplitTextReveal as="span" delay={0.35} className="block" wordClassName="text-gradient-brand">
              to pass CIMA.
            </SplitTextReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-charcoal/75 dark:text-white/70 max-w-2xl mb-8"
          >
            AI-powered CIMA learning that adapts to what you know, identifies what you don't,
            and tells you exactly what to study next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <MagneticButton strength={0.08}>
              <Link to="/auth?mode=signup" className="block">
                <Button size="xl" className="w-full sm:w-auto shadow-lg shadow-primary/20 group">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.08}>
              <Link to="/demo" className="block">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto shadow-md bg-white/70 border-charcoal/30 text-charcoal hover:bg-white/90 dark:bg-black/50 dark:border-white/40 dark:text-white dark:hover:bg-black/70 backdrop-blur-md group"
                >
                  <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  See a Demo
                </Button>
              </Link>
            </MagneticButton>
            <Link to="/courses" className="block">
              <Button
                size="xl"
                variant="ghost"
                className="w-full sm:w-auto text-charcoal dark:text-white hover:bg-charcoal/5 dark:hover:bg-white/10"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore CIMA Courses
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-5 text-sm text-charcoal/60 dark:text-white/55"
          >
            Free account. No card needed. Cancel a paid plan any time.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
