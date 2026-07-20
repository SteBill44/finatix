import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: "up" | "down";
  };
  trend?: string;
  className?: string;
  variant?: "default" | "success" | "warning";
}

const StatCard = ({
  icon,
  label,
  value,
  change,
  trend,
  className,
  variant = "default",
}: StatCardProps) => {
  const bgColor =
    variant === "success"
      ? "bg-success/10"
      : variant === "warning"
        ? "bg-warning/10"
        : "bg-primary/10";

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-6 shadow-sm",
        "transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg",
          bgColor
        )}
      >
        <span className="text-xl">{icon}</span>
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>

      {/* Value */}
      <p className="text-3xl font-bold text-foreground mb-2">{value}</p>

      {/* Trend/Change */}
      {change && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              change.direction === "up" ? "text-success" : "text-destructive"
            )}
          >
            {change.direction === "up" ? "↑" : "↓"} {change.value}%
          </span>
          {trend && (
            <span className="text-xs text-muted-foreground">{trend}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
