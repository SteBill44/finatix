import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { parseError } from "@/lib/errorHandling";

interface RateLimitState {
  isLimited: boolean;
  retryAfter: number | null;
  remainingTime: number;
}

export function useRateLimitFeedback() {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    retryAfter: null,
    remainingTime: 0,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    setState({
      isLimited: true,
      retryAfter: Date.now() + seconds * 1000,
      remainingTime: seconds,
    });

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start countdown
    timerRef.current = setInterval(() => {
      setState((prev) => {
        const remaining = Math.max(0, Math.ceil((prev.retryAfter! - Date.now()) / 1000));
        
        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return { isLimited: false, retryAfter: null, remainingTime: 0 };
        }
        
        return { ...prev, remainingTime: remaining };
      });
    }, 1000);
  }, []);

  const handleRateLimitError = useCallback(
    (error: unknown): boolean => {
      const parsed = parseError(error);
      
      if (parsed.type === "rate_limit") {
        // Extract retry-after from error if available
        const retryAfter = extractRetryAfter(error) || 60;
        
        startCountdown(retryAfter);
        
        toast.error("Slow down!", {
          description: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
          duration: 5000,
        });
        
        return true;
      }
      
      return false;
    },
    [startCountdown]
  );

  const clearRateLimit = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState({ isLimited: false, retryAfter: null, remainingTime: 0 });
  }, []);

  return {
    isLimited: state.isLimited,
    remainingTime: state.remainingTime,
    handleRateLimitError,
    clearRateLimit,
  };
}

// Helper to extract retry-after from various error formats
function extractRetryAfter(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  
  const err = error as Record<string, unknown>;
  
  // Check for retry_after in response
  if (typeof err.retry_after === "number") {
    return err.retry_after;
  }
  
  // Check in headers (for fetch responses)
  if (err.headers && typeof err.headers === "object") {
    const headers = err.headers as Record<string, string>;
    const retryHeader = headers["retry-after"] || headers["Retry-After"];
    if (retryHeader) {
      return parseInt(retryHeader, 10);
    }
  }
  
  // Check in message for rate limit details
  const message = (err.message as string) || "";
  const match = message.match(/(\d+)\s*seconds?/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}
