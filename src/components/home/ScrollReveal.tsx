import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

/**
 * Pinned, scroll-driven word-by-word reveal section.
 * Lusion-style: as user scrolls, words light up in sequence and a 3D tilt builds.
 */
const HEADLINE = "Built for ambitious accountants who refuse to settle for ordinary results.";

const Word = ({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [12, 0]);
  const blur = useTransform(progress, range, [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.span
      style={{ opacity, y, filter }}
      className="inline-block mr-[0.25em] text-charcoal dark:text-white"
    >
      {word}
    </motion.span>
  );
};

const ScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });

  // Pin-style transforms for inner content
  const rotateX = useTransform(smooth, [0, 0.5, 1], [18, 0, -10]);
  const scale = useTransform(smooth, [0, 0.5, 1], [0.9, 1.02, 0.95]);
  const yShift = useTransform(smooth, [0, 1], ["0%", "-10%"]);

  const words = HEADLINE.split(" ");

  return (
    <section
      ref={ref}
      className="relative py-32 lg:py-48 overflow-hidden bg-background"
      style={{ perspective: 1200 }}
    >
      <div className="sticky top-1/4 container mx-auto px-4">
        <motion.div
          style={{
            rotateX,
            scale,
            y: yShift,
            transformStyle: "preserve-3d",
          }}
          className="max-w-5xl mx-auto text-center will-change-transform"
        >
          <motion.span
            style={{ opacity: useTransform(smooth, [0, 0.2], [0, 1]) }}
            className="block text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-8"
          >
            The Finatix difference
          </motion.span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            {words.map((w, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;
              return <Word key={i} word={w} range={[start * 0.9, end * 0.9]} progress={smooth} />;
            })}
          </h2>
        </motion.div>
      </div>

      {/* Spacer to give the sticky section scroll runway */}
      <div className="h-[60vh]" aria-hidden />
    </section>
  );
};

export default ScrollReveal;
