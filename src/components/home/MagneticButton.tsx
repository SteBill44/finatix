import { ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Retained for backwards-compat; no longer used. */
  strength?: number;
}

/**
 * Static wrapper — previously applied a magnetic cursor-follow effect.
 * Now simply renders children in place so buttons stay anchored.
 */
const MagneticButton = ({ children, className = "" }: MagneticButtonProps) => {
  return <div className={className}>{children}</div>;
};

export default MagneticButton;
