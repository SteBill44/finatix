import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SplitTextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  staggerChildren?: number;
  once?: boolean;
}

/**
 * Lusion-inspired split text reveal — each word clips in from below with stagger.
 */
const SplitTextReveal = ({
  children,
  className = "",
  as: Tag = "h1",
  delay = 0,
  staggerChildren = 0.04,
  once = true,
}: SplitTextRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const words = children.split(" ");

  return (
    <Tag className={className}>
      <span ref={ref} className="inline">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", rotateX: 40, opacity: 0 }}
              animate={isInView ? { y: "0%", rotateX: 0, opacity: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: delay + i * staggerChildren,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && "\u00A0"}
          </span>
        ))}
      </span>
    </Tag>
  );
};

export default SplitTextReveal;
