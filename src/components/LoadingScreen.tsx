import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

const LoadingScreen = ({ onLoadingComplete, minDuration = 1500 }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Logo container */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Geometric F Logo with animation */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-teal-600 animate-scale-in shadow-2xl shadow-teal-500/40 flex items-center justify-center overflow-hidden">
            {/* Geometric F made with CSS */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-14 h-14 md:w-20 md:h-20"
              fill="none"
            >
              {/* Main F shape with geometric cuts */}
              <path
                d="M25 20 L70 20 L70 32 L45 32 L45 45 L65 45 L65 57 L45 57 L45 80 L33 80 L33 32 L25 32 L25 20 Z"
                fill="white"
                className="animate-[pulse_2s_ease-in-out_infinite]"
                style={{ animationDelay: "0.2s" }}
              />
              {/* Accent corner cut */}
              <path
                d="M60 20 L70 20 L70 30 Z"
                fill="rgba(255,255,255,0.6)"
              />
            </svg>
          </div>
          
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-teal-400/60 animate-ping" style={{ animationDuration: "2s" }} />
          
          {/* Secondary glow ring */}
          <div className="absolute -inset-2 rounded-3xl border border-teal-500/30 animate-pulse" style={{ animationDuration: "3s" }} />
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Finatix
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            CIMA Study Platform
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
