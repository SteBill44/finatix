import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only radial spotlight that follows the cursor. Uses a single
 * fixed div with a translate transform for GPU acceleration.
 */
const CursorSpotlight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      x += (tx - x) * 0.15;
      y += (ty - y) * 0.15;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[600px] w-[600px] rounded-full"
      style={{
        background:
          "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 30%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
};

export default CursorSpotlight;
