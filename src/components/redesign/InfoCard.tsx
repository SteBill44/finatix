import React from "react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "info" | "premium";
  className?: string;
}

const variantStyles = {
  default: "bg-card border-border text-foreground",
  success: "bg-success/10 border-success/20 text-success",
  warning: "bg-warning/10 border-warning/20 text-warning",
  info: "bg-info/10 border-info/20 text-info",
  premium: "bg-premium/10 border-premium/20 text-premium",
};

const InfoCard = ({
  icon,
  label,
  value,
  subtext,
  variant = "default",
  className,
}: InfoCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all duration-300 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {icon && <div className="text-xl">{icon}</div>}
        </div>

        <div>
          <div className="text-3xl font-bold">{value}</div>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
