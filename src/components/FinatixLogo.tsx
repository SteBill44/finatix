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
      "relative rounded-2xl bg-teal-600 flex items-center justify-center shadow-xl shadow-teal-500/30",
      config.container,
      animated && "animate-scale-in",
      className
    )}>
      {animated && (
        <>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-teal-400/60 animate-ping" style={{ animationDuration: "2s" }} />
          {/* Secondary glow ring */}
          <div className="absolute -inset-2 rounded-3xl border border-teal-500/30 animate-pulse" style={{ animationDuration: "3s" }} />
        </>
      )}
      <svg 
        viewBox="0 0 100 100" 
        className={cn(config.icon, "transition-transform duration-300")}
        fill="none"
      >
        {/* Main F shape */}
        <path
          d="M25 20 L70 20 L70 32 L45 32 L45 45 L65 45 L65 57 L45 57 L45 80 L33 80 L33 32 L25 32 L25 20 Z"
          fill="white"
          className={animated ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
          style={animated ? { animationDelay: "0.2s" } : {}}
        />
        {/* Accent corner cut */}
        <path
          d="M60 20 L70 20 L70 30 Z"
          fill="rgba(255,255,255,0.6)"
        />
      </svg>
    </div>
  );

  const LogoText = showText && (
    <span className={cn("font-bold text-foreground transition-colors duration-300", config.text)}>
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
        className="group inline-flex items-center gap-2 [&>div>div]:group-hover:shadow-lg [&>div>div]:group-hover:shadow-teal-500/40 [&>div>div]:group-hover:scale-110 [&>div>div]:transition-all [&>div>div]:duration-300"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default FinatixLogo;
