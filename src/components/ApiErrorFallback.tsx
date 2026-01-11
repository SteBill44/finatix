import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseError, ErrorType } from "@/lib/errorHandling";

interface ApiErrorFallbackProps {
  error: unknown;
  onRetry?: () => void;
  compact?: boolean;
}

const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case "network":
      return <WifiOff className="w-8 h-8 text-destructive" />;
    default:
      return <AlertCircle className="w-8 h-8 text-destructive" />;
  }
};

export function ApiErrorFallback({ error, onRetry, compact = false }: ApiErrorFallbackProps) {
  const parsedError = parseError(error);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive flex-1">{parsedError.message}</p>
        {onRetry && parsedError.retryable && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-destructive/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          {getErrorIcon(parsedError.type)}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {parsedError.type === "network" ? "Connection Problem" : "Something went wrong"}
        </h3>
        <p className="text-muted-foreground max-w-md mb-6">
          {parsedError.message}
        </p>
        {onRetry && parsedError.retryable && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Inline error message for forms
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm mt-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default ApiErrorFallback;
