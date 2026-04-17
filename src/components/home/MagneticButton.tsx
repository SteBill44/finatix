import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Lusion-inspired magnetic hover effect — element subtly follows cursor on hover.
 */
const MagneticButton = ({ children, className = "", strength = 0.08 }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Cap displacement so the button stays anchored
    const maxOffset = 6;
    const rawX = (e.clientX - centerX) * strength;
    const rawY = (e.clientY - centerY) * strength;
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, rawX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, rawY)),
    });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 22, mass: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MagneticButton;
