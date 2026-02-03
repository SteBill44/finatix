/**
 * Tracked Supabase utilities for performance monitoring
 * Wraps Supabase queries to automatically log API call durations
 */

type LogApiCall = (endpoint: string, durationMs: number, success: boolean) => void;

// Global reference to the logging function (set by PerformanceProvider)
let globalLogApiCall: LogApiCall | null = null;

export function setApiLogger(logger: LogApiCall) {
  globalLogApiCall = logger;
}

/**
 * Execute any async operation with automatic performance tracking
 */
export async function trackedOperation<T>(
  operationName: string,
  operationFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await operationFn();
    const duration = performance.now() - start;
    
    if (globalLogApiCall) {
      // Check if result has an error property (Supabase pattern)
      const hasError = result && typeof result === 'object' && 'error' in result && (result as any).error;
      globalLogApiCall(operationName, duration, !hasError);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    if (globalLogApiCall) {
      globalLogApiCall(operationName, duration, false);
    }
    
    throw error;
  }
}

/**
 * HOC to wrap React Query queryFn with performance tracking
 */
export function withTracking<T>(
  queryName: string,
  queryFn: () => Promise<T>
): () => Promise<T> {
  return () => trackedOperation(queryName, queryFn);
}
