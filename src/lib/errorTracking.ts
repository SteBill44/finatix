/**
 * Error tracking utility for production monitoring
 * Provides a unified interface for error reporting that can be connected
 * to services like Sentry, LogRocket, or custom endpoints
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  route?: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
}

interface ErrorTracker {
  captureException: (error: Error, context?: ErrorContext) => void;
  captureMessage: (message: string, level?: "info" | "warning" | "error") => void;
  setUser: (userId: string | null, email?: string) => void;
  addBreadcrumb: (message: string, category?: string, data?: Record<string, unknown>) => void;
}

// Error buffer for when tracking isn't initialized
const errorBuffer: Array<{ error: Error; context?: ErrorContext; timestamp: number }> = [];
const MAX_BUFFER_SIZE = 50;

// Track if we're in development
const isDev = import.meta.env.DEV;

// Current user context
let currentUser: { id: string; email?: string } | null = null;

/**
 * Log error to console in development, buffer for production
 */
function logError(error: Error, context?: ErrorContext): void {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    user: currentUser,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  if (isDev) {
    console.group("🚨 Error Tracked");
    console.error(error);
    console.table(context);
    console.groupEnd();
  } else {
    // Buffer errors for production
    errorBuffer.push({
      error,
      context,
      timestamp: Date.now(),
    });

    // Keep buffer size manageable
    if (errorBuffer.length > MAX_BUFFER_SIZE) {
      errorBuffer.shift();
    }

    // Log to console in production too (for debugging via browser tools)
    console.error("[ErrorTracking]", errorData);
  }
}

/**
 * Main error tracker instance
 */
export const errorTracker: ErrorTracker = {
  captureException(error: Error, context?: ErrorContext): void {
    logError(error, {
      ...context,
      route: context?.route || window.location.pathname,
    });
  },

  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
    const logFn = level === "error" ? console.error : level === "warning" ? console.warn : console.info;
    
    if (isDev) {
      logFn(`[${level.toUpperCase()}]`, message);
    } else {
      logFn(`[ErrorTracking:${level}]`, message, { user: currentUser, url: window.location.href });
    }
  },

  setUser(userId: string | null, email?: string): void {
    if (userId) {
      currentUser = { id: userId, email };
    } else {
      currentUser = null;
    }
  },

  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>): void {
    if (isDev) {
      console.debug(`[Breadcrumb:${category || "default"}]`, message, data);
    }
  },
};

// Performance logging callback
type LogErrorFn = (path: string, error: string) => void;
let performanceLogError: LogErrorFn | null = null;

export function setPerformanceErrorLogger(logger: LogErrorFn) {
  performanceLogError = logger;
}

/**
 * Global error handler for uncaught errors
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    const errorObj = error || new Error(String(message));
    
    errorTracker.captureException(errorObj, {
      metadata: { source, lineno, colno },
    });
    
    // Also log to performance monitoring
    if (performanceLogError) {
      performanceLogError(window.location.pathname, errorObj.message);
    }
    
    return false; // Let default handler run too
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    errorTracker.captureException(error, {
      metadata: { type: "unhandledrejection" },
    });
    
    // Also log to performance monitoring
    if (performanceLogError) {
      performanceLogError(window.location.pathname, error.message);
    }
  };

  // Log when user leaves page with errors in buffer
  if (!isDev) {
    window.addEventListener("beforeunload", () => {
      if (errorBuffer.length > 0) {
        // Could send to beacon API here
        console.log(`[ErrorTracking] ${errorBuffer.length} errors in buffer on page unload`);
      }
    });
  }
}

/**
 * React Error Boundary helper
 */
export function captureReactError(error: Error, errorInfo: { componentStack?: string }): void {
  errorTracker.captureException(error, {
    componentStack: errorInfo.componentStack,
    metadata: { source: "react-error-boundary" },
  });
}

/**
 * Get buffered errors (useful for debugging)
 */
export function getBufferedErrors(): typeof errorBuffer {
  return [...errorBuffer];
}

/**
 * Clear error buffer
 */
export function clearErrorBuffer(): void {
  errorBuffer.length = 0;
}
