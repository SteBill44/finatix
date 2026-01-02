import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FocusMonitorProps {
  isActive: boolean;
  onViolation?: (count: number) => void;
}

const FocusMonitor = ({ isActive, onViolation }: FocusMonitorProps) => {
  const [violations, setViolations] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState<Date | null>(null);

  const handleVisibilityChange = useCallback(() => {
    if (!isActive) return;
    
    if (document.hidden) {
      setIsFocused(false);
      setViolations((prev) => {
        const newCount = prev + 1;
        onViolation?.(newCount);
        return newCount;
      });
      setLastViolationTime(new Date());
      setShowWarning(true);
    } else {
      setIsFocused(true);
    }
  }, [isActive, onViolation]);

  const handleWindowBlur = useCallback(() => {
    if (!isActive) return;
    
    setIsFocused(false);
    setViolations((prev) => {
      const newCount = prev + 1;
      onViolation?.(newCount);
      return newCount;
    });
    setLastViolationTime(new Date());
    setShowWarning(true);
  }, [isActive, onViolation]);

  const handleWindowFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isActive, handleVisibilityChange, handleWindowBlur, handleWindowFocus]);

  return (
    <>
      {/* Focus Status Indicator */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          isFocused
            ? "bg-accent/20 text-accent"
            : "bg-destructive/20 text-destructive animate-pulse"
        )}
      >
        {isFocused ? (
          <>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Focused</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">Away</span>
          </>
        )}
        {violations > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded text-xs">
            {violations}
          </span>
        )}
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Focus Violation Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You have navigated away from the exam window. This has been recorded.
              </p>
              <p className="font-medium text-foreground">
                Total violations: {violations}
              </p>
              <p className="text-sm text-muted-foreground">
                In a real CIMA exam, leaving the exam window may result in disqualification.
                Please remain focused on the exam.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FocusMonitor;
