import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface FinatixLogoProps {
  size?: LogoSize;
  showText?: boolean;
  linkTo?: string | null;
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  sm: {
    container: "w-8 h-8",
    icon: "w-5 h-5",
    text: "text-xl",
  },
  md: {
    container: "w-12 h-12",
    icon: "w-7 h-7",
    text: "text-2xl",
  },
  lg: {
    container: "w-20 h-20",
    icon: "w-12 h-12",
    text: "text-3xl md:text-4xl",
  },
  xl: {
    container: "w-24 h-24 md:w-32 md:h-32",
    icon: "w-14 h-14 md:w-20 md:h-20",
    text: "text-3xl md:text-4xl",
  },
};

const FinatixLogo = ({ 
  size = "sm", 
  showText = true, 
  linkTo = "/",
  className,
  animated = false,
}: FinatixLogoProps) => {
  const config = sizeConfig[size];

  const LogoIcon = (
    <div className={cn(
      "relative flex items-center justify-center",
      config.container,
      animated && "animate-scale-in",
      className
    )}>
      {animated && (
        <>
          {/* Rotating outer ring */}
          <div 
            className="absolute inset-0 rounded-xl border-2 border-primary/40 animate-spin" 
            style={{ animationDuration: "3s" }} 
          />
          {/* Pulsing glow */}
          <div 
            className="absolute -inset-1 rounded-xl bg-primary/20 animate-pulse blur-sm" 
            style={{ animationDuration: "1.5s" }} 
          />
        </>
      )}
      <svg 
        viewBox="0 0 100 100" 
        className={cn(config.container, "transition-transform duration-300")}
        fill="none"
      >
        <defs>
          {/* Modern gradient */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
          </linearGradient>
          {/* Accent gradient for geometric elements */}
          <linearGradient id="accentGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Geometric base - hexagonal inspired shape */}
        <path
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
          fill="url(#logoGradient)"
          className={animated ? "animate-pulse" : ""}
          style={animated ? { animationDuration: "2s" } : {}}
        />
        
        {/* Angular accent cut - top right */}
        <path
          d="M70 5 L90 25 L90 15 L80 5 Z"
          fill="hsl(var(--primary))"
          opacity="0.5"
        />
        
        {/* Modern geometric F */}
        <g>
          {/* Vertical bar */}
          <path
            d="M32 28 L42 28 L42 72 L32 72 Z"
            fill="url(#accentGradient)"
          />
          
          {/* Top horizontal bar - angled */}
          <path
            d="M42 28 L68 28 L72 33 L68 38 L42 38 Z"
            fill="url(#accentGradient)"
          />
          
          {/* Middle horizontal bar - shorter, angled */}
          <path
            d="M42 46 L58 46 L62 51 L58 56 L42 56 Z"
            fill="url(#accentGradient)"
          />
        </g>
        
        {/* Subtle geometric accent line */}
        <path
          d="M72 33 L78 40 L78 45 L72 38 Z"
          fill="hsl(var(--primary-foreground))"
          opacity="0.3"
        />
      </svg>
    </div>
  );

  const LogoText = showText && (
    <span className={cn(
      "font-bold text-foreground transition-colors duration-300 tracking-tight",
      config.text
    )}>
      Fin<span className="text-primary">atix</span>
    </span>
  );

  const content = (
    <div className="flex items-center gap-2">
      {LogoIcon}
      {LogoText}
    </div>
  );

  if (linkTo) {
    return (
      <Link 
        to={linkTo} 
        className="group inline-flex items-center gap-2 [&_svg]:group-hover:scale-110 [&_svg]:transition-transform [&_svg]:duration-300"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default FinatixLogo;
