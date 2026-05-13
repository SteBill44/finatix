import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Global smooth scroll using Lenis. Mounts once at the app root.
 * Exposes window.__lenis for components that need scroll progress.
 */
const SmoothScroll = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    (window as any).__lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return null;
};

export default SmoothScroll;
