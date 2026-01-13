import { cn } from "@/lib/utils";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

interface AutoFitProps {
  children: React.ReactNode;
  /** Smallest scale we allow before we give up and start clipping. */
  minScale?: number;
  /** Largest scale (usually 1). */
  maxScale?: number;
  className?: string;
}

/**
 * Scales its children uniformly to ensure they fully fit within the available
 * width/height of the container (useful for certificates on phone/tablet).
 */
export default function AutoFit({
  children,
  minScale = 0.78,
  maxScale = 1,
  className,
}: AutoFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(maxScale);

  const clamp = useMemo(
    () => (value: number) => Math.max(minScale, Math.min(maxScale, value)),
    [minScale, maxScale]
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Layout sizes are not affected by transform scaling, so we can compute
    // the needed scale using scroll sizes (which reflect the full content).
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    // Use scroll sizes to capture the *actual* content needs.
    const contentW = Math.max(content.scrollWidth, content.offsetWidth);
    const contentH = Math.max(content.scrollHeight, content.offsetHeight);

    if (containerW <= 0 || containerH <= 0 || contentW <= 0 || contentH <= 0) return;

    const next = clamp(Math.min(maxScale, containerW / contentW, containerH / contentH));
    setScale(next);
  }, [clamp, maxScale]);

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    if (typeof ResizeObserver === "undefined") {
      const onResize = () => measure();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    ro.observe(content);

    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)}>
      <div className="h-full w-full origin-center" style={{ transform: `scale(${scale})` }}>
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}
