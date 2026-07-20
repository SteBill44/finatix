import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  progress: number;
  label?: string;
  details?: string;
  variant?: "default" | "success" | "warning";
  className?: string;
  showPercentage?: boolean;
}

const variantStyles = {
  default: "bg-secondary/20",
  success: "bg-success/20",
  warning: "bg-warning/20",
};

const ProgressCard = ({
  title,
  progress,
  label,
  details,
  variant = "default",
  className,
  showPercentage = true,
}: ProgressCardProps) => {
  return (
    <div className={cn("rounded-xl bg-card border border-border p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {label && (
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            )}
          </div>
          {showPercentage && (
            <div className="text-2xl font-bold text-primary">{progress}%</div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          {details && (
            <p className="text-xs text-muted-foreground">{details}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
