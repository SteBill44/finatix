import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:border-muted-foreground/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-7",
        xl: "h-12 px-7 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Marketing CTAs only: draws a perimeter stroke clockwise on pointer hover (see .btn-trace in index.css). */
  trace?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, trace = false, children, ...props }, ref) => {
    const elementRef = React.useRef<HTMLButtonElement | null>(null);
    const [bounds, setBounds] = React.useState({ width: 0, height: 0, radius: 6 });
    const setRef = React.useCallback((node: HTMLButtonElement | null) => {
      elementRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }, [ref]);
    React.useEffect(() => {
      const node = elementRef.current;
      if (!trace || !node) return;
      const measure = () => {
        const box = node.getBoundingClientRect();
        setBounds({ width: box.width, height: box.height, radius: parseFloat(getComputedStyle(node).borderRadius) || 0 });
      };
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, [trace]);
    const inset = variant === "outline" ? 1 : 3;
    const perimeter = trace && bounds.width > 0 && <svg className="button-perimeter" aria-hidden="true" focusable="false" viewBox={`0 0 ${bounds.width} ${bounds.height}`}>
      <rect x={inset} y={inset} width={Math.max(0, bounds.width - inset * 2)} height={Math.max(0, bounds.height - inset * 2)} rx={Math.max(0, bounds.radius - inset)} pathLength="1" />
    </svg>;
    const Comp = asChild ? Slot : "button";
    const content = asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
      ? React.cloneElement(children, {}, <>{children.props.children}{perimeter}</>)
      : <>{children}{perimeter}</>;
    return <Comp className={cn(buttonVariants({ variant, size, className }), trace && "btn-trace", trace && variant === "outline" && "btn-trace-outline")} ref={setRef} {...props}>{content}</Comp>;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };