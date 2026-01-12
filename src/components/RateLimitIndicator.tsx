import { AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface RateLimitIndicatorProps {
  isLimited: boolean;
  remainingTime: number;
  maxTime?: number;
}

export function RateLimitIndicator({
  isLimited,
  remainingTime,
  maxTime = 60,
}: RateLimitIndicatorProps) {
  if (!isLimited) return null;

  const progress = ((maxTime - remainingTime) / maxTime) * 100;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Rate limited. Please wait {remainingTime}s before trying again.</span>
        </div>
        <Progress value={progress} className="w-24 h-2" />
      </AlertDescription>
    </Alert>
  );
}
