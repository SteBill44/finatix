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
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        
        {/* Horizontal hexagon (flat top and bottom) */}
        <path
          d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
          fill="url(#logoGradient)"
          className={animated ? "animate-pulse" : ""}
          style={animated ? { animationDuration: "2s" } : {}}
        />
        
        {/* Clean geometric F */}
        <g fill="hsl(var(--primary-foreground))">
          {/* Vertical bar */}
          <rect x="32" y="28" width="12" height="44" />
          
          {/* Top horizontal bar */}
          <rect x="44" y="28" width="26" height="10" />
          
          {/* Middle horizontal bar */}
          <rect x="44" y="46" width="18" height="10" />
        </g>
      </svg>
    </div>
  );

  const LogoText = showText && (
    <span className={cn(
      "font-bold transition-colors duration-300 tracking-tight",
      config.text
    )}>
      <span className="text-white dark:text-foreground">Fin</span><span className="text-primary">atix</span>
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
