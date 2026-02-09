import { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { setApiLogger } from "@/lib/api/client";
import { setPerformanceErrorLogger } from "@/lib/errorTracking";

interface PerformanceContextValue {
  logPageLoad: (path: string) => void;
  logApiCall: (endpoint: string, durationMs: number, success: boolean) => void;
  logError: (path: string, error: string) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const { logPageLoad, logApiCall, logError } = usePerformanceMonitoring();
  const location = useLocation();

  // Connect the API logger globally
  useEffect(() => {
    setApiLogger(logApiCall);
    setPerformanceErrorLogger(logError);
    
    return () => {
      setApiLogger(() => {});
      setPerformanceErrorLogger(() => {});
    };
  }, [logApiCall, logError]);

  // Track page loads on route changes
  useEffect(() => {
    logPageLoad(location.pathname);
  }, [location.pathname, logPageLoad]);

  return (
    <PerformanceContext.Provider value={{ logPageLoad, logApiCall, logError }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
    // Return no-op functions if used outside provider (e.g., during SSR or tests)
    return {
      logPageLoad: () => {},
      logApiCall: () => {},
      logError: () => {},
    };
  }
  return context;
}
