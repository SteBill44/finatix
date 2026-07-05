import { useEffect, useRef } from "react";

/**
 * FuturisticGrid — a canvas-rendered perspective grid with drifting
 * neon particles, a pulsing horizon glow, and mouse-reactive parallax.
 * Zero dependencies, GPU-friendly, respects prefers-reduced-motion.
 */
const FuturisticGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / rect.width;
      mouse.ty = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMove);

    // Particles drifting upward
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      s: Math.random() * 0.0006 + 0.0002,
      a: Math.random() * 0.6 + 0.2,
    }));

    let t = 0;
    const draw = () => {
      t += reduced ? 0 : 0.008;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      ctx.clearRect(0, 0, w, h);

      // Radial mouse glow
      const gx = mouse.x * w;
      const gy = mouse.y * h;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
      glow.addColorStop(0, "rgba(241, 96, 1, 0.18)");
      glow.addColorStop(0.4, "rgba(193, 8, 1, 0.06)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Perspective grid — horizon at ~55% height
      const horizon = h * 0.55;
      const vp = { x: w * 0.5 + (mouse.x - 0.5) * 60, y: horizon + (mouse.y - 0.5) * 20 };
      const rows = 14;
      const cols = 18;

      ctx.lineWidth = 1;

      // Horizontal receding lines
      for (let i = 0; i <= rows; i++) {
        const p = i / rows;
        // Ease so lines bunch toward horizon; add scroll animation
        const eased = Math.pow((p + t * 0.5) % 1, 2.2);
        const y = horizon + eased * (h - horizon);
        const alpha = 0.08 + (1 - eased) * 0.35;
        ctx.strokeStyle = `rgba(241, 96, 1, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vertical converging lines
      for (let i = -cols; i <= cols; i++) {
        const x = w * 0.5 + (i / cols) * w * 1.2;
        const alpha = 0.08 + (1 - Math.abs(i) / cols) * 0.25;
        ctx.strokeStyle = `rgba(232, 80, 2, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(vp.x, vp.y);
        ctx.stroke();
      }

      // Horizon glow bar
      const bar = ctx.createLinearGradient(0, horizon - 40, 0, horizon + 40);
      bar.addColorStop(0, "rgba(0,0,0,0)");
      bar.addColorStop(0.5, `rgba(241, 96, 1, ${0.35 + Math.sin(t * 2) * 0.08})`);
      bar.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bar;
      ctx.fillRect(0, horizon - 40, w, 80);

      // Sun disc pulse
      const sunR = 90 + Math.sin(t * 1.4) * 6;
      const sun = ctx.createRadialGradient(vp.x, horizon, 0, vp.x, horizon, sunR);
      sun.addColorStop(0, "rgba(255, 200, 120, 0.55)");
      sun.addColorStop(0.5, "rgba(241, 96, 1, 0.25)");
      sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(vp.x, horizon, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Drifting particles
      for (const p of particles) {
        if (!reduced) p.y -= p.s;
        if (p.y < 0) {
          p.y = 1;
          p.x = Math.random();
        }
        const px = p.x * w;
        const py = p.y * h;
        ctx.fillStyle = `rgba(255, 180, 100, ${p.a})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default FuturisticGrid;
