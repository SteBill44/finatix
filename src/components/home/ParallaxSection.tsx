import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // negative = slower, positive = faster
  offset?: [string, string];
}

/**
 * Lusion-inspired parallax wrapper — content moves at different scroll speeds.
 */
const ParallaxSection = ({
  children,
  className = "",
  speed = -50,
  offset = ["start end", "end start"],
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

export default ParallaxSection;
