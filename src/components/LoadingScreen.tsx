import { useEffect, useRef, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

const LoadingScreen = ({ onLoadingComplete, minDuration = 1500 }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef<LoadingScreenProps["onLoadingComplete"]>(onLoadingComplete);

  useEffect(() => {
    onCompleteRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onCompleteRef.current?.();
      }, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

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
        {/* Logo icon with animation */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-0.5 animate-scale-in shadow-2xl shadow-primary/30">
            <div className="w-full h-full rounded-2xl bg-background/90 backdrop-blur flex items-center justify-center">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                F
              </span>
            </div>
          </div>
          
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 animate-ping" style={{ animationDuration: "2s" }} />
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Finaptics
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
