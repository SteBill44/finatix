/**
 * Feature Error Boundary
 * Catches errors at feature boundaries with recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ChevronDown } from "lucide-react";
import { captureReactError } from "@/lib/errorTracking";

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to error tracking
    captureReactError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  toggleStack = () => {
    this.setState((prev) => ({ showStack: !prev.showStack }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { featureName, showDetails = false } = this.props;
      const { error, errorInfo, showStack } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <Card className="w-full max-w-lg mx-auto my-8 border-destructive/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-lg">Something went wrong</CardTitle>
            <CardDescription>
              The {featureName} feature encountered an error
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(showDetails || isDev) && error && (
              <div className="text-sm">
                <p className="font-medium text-destructive">{error.name}</p>
                <p className="text-muted-foreground">{error.message}</p>
                
                {isDev && errorInfo && (
                  <div className="mt-2">
                    <button
                      onClick={this.toggleStack}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          showStack ? "rotate-180" : ""
                        }`}
                      />
                      {showStack ? "Hide" : "Show"} stack trace
                    </button>
                    {showStack && (
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="ghost" size="sm" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to wrap async operations with error boundary awareness
 */
export function useFeatureError(featureName: string) {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const catchError = React.useCallback(
    async <T,>(promise: Promise<T>): Promise<T | null> => {
      try {
        return await promise;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        captureReactError(error, { componentStack: featureName });
        return null;
      }
    },
    [featureName]
  );

  // Re-throw for error boundary to catch
  if (error) {
    throw error;
  }

  return { catchError, resetError };
}
