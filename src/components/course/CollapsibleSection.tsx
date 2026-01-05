import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  className,
  headerClassName,
  isOpen: controlledIsOpen,
  onOpenChange,
}: CollapsibleSectionProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleOpenChange = (open: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange} className={className}>
      <CollapsibleTrigger className={cn(
        "w-full flex items-center justify-between gap-3 group cursor-pointer",
        headerClassName
      )}>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          {icon}
          {title}
        </h2>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-6 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleSection;
