import { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const ExamTimer = ({ initialMinutes, onTimeUp, isPaused = false }: ExamTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onTimeUp, timeLeft]);

  const isLowTime = timeLeft < 300; // Less than 5 minutes
  const isCritical = timeLeft < 60; // Less than 1 minute

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors",
        isCritical
          ? "bg-destructive/20 text-destructive animate-pulse"
          : isLowTime
          ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
          : "bg-secondary text-foreground"
      )}
    >
      {isCritical ? (
        <AlertTriangle className="w-5 h-5" />
      ) : (
        <Clock className="w-5 h-5" />
      )}
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default ExamTimer;
