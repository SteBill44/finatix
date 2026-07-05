import { useEffect, useState } from "react";

export interface ScrollTelemetry {
  y: number;
  progress: number; // 0..1 of full document
  velocity: number; // px/ms, smoothed
  direction: 1 | -1 | 0;
}

// Shared ref-like store, updated on rAF for any subscriber (canvas etc.)
export const scrollTelemetry: ScrollTelemetry = {
  y: 0,
  progress: 0,
  velocity: 0,
  direction: 0,
};

let started = false;
function ensureLoop() {
  if (started || typeof window === "undefined") return;
  started = true;
  let last = window.scrollY;
  let lastT = performance.now();
  let raf = 0;
  const tick = () => {
    const now = performance.now();
    const y = window.scrollY;
    const dy = y - last;
    const dt = Math.max(1, now - lastT);
    const inst = dy / dt;
    scrollTelemetry.velocity = scrollTelemetry.velocity * 0.8 + inst * 0.2;
    scrollTelemetry.direction = dy > 0.1 ? 1 : dy < -0.1 ? -1 : 0;
    scrollTelemetry.y = y;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollTelemetry.progress = Math.min(1, Math.max(0, y / max));
    last = y;
    lastT = now;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
}

/** React hook for components that want to re-render on scroll changes. */
export function useScrollTelemetry(throttleMs = 60): ScrollTelemetry {
  const [state, setState] = useState<ScrollTelemetry>({ ...scrollTelemetry });
  useEffect(() => {
    ensureLoop();
    let last = 0;
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      if (now - last >= throttleMs) {
        last = now;
        setState({ ...scrollTelemetry });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [throttleMs]);
  return state;
}

// Kick the loop off at module load (client only)
if (typeof window !== "undefined") ensureLoop();
