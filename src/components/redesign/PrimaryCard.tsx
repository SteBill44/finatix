import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PrimaryCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  loading?: boolean;
}

const PrimaryCard = ({
  icon,
  title,
  subtitle,
  description,
  actionLabel = "Start",
  onAction,
  className,
  loading = false,
}: PrimaryCardProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5",
        "border border-primary/20 p-8 shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:border-primary/40 hover:-translate-y-1",
        className
      )}
    >
      {/* Gradient accent background */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Icon */}
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={onAction}
          disabled={loading}
          className="w-full mt-4 gap-2 group/btn"
          size="lg"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default PrimaryCard;
