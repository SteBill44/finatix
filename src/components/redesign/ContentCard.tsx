import React from "react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  badge?: {
    label: string;
    variant: "default" | "success" | "warning" | "primary";
  };
  onClick?: () => void;
}

interface ContentCardProps {
  title: string;
  items: ContentItem[];
  className?: string;
  emptyState?: React.ReactNode;
}

const badgeStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  primary: "bg-primary/20 text-primary",
};

const ContentCard = ({
  title,
  items,
  className,
  emptyState,
}: ContentCardProps) => {
  return (
    <div className={cn("rounded-xl bg-card border border-border p-6", className)}>
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>

      <div className="space-y-2">
        {items.length === 0 ? (
          emptyState || (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items yet
            </p>
          )
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "flex items-start justify-between gap-3 p-3 rounded-lg",
                "border border-transparent transition-all duration-200",
                item.onClick &&
                  "hover:bg-secondary/50 hover:border-border cursor-pointer"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.metadata && (
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.metadata}
                  </p>
                )}
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap",
                      badgeStyles[item.badge.variant]
                    )}
                  >
                    {item.badge.label}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContentCard;
