import { useEffect, useRef } from "react";
import { scrollTelemetry } from "@/hooks/useScrollTelemetry";

/**
 * FuturisticGrid — canvas perspective grid + horizon sun + ember particles.
 * Reacts to scroll: grid accelerates, horizon rises, chromatic split intensifies.
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

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      s: Math.random() * 0.0006 + 0.0002,
      a: Math.random() * 0.6 + 0.2,
    }));

    // Distant "city" silhouette bars
    const skyline = Array.from({ length: 24 }, () => ({
      x: Math.random(),
      w: Math.random() * 0.04 + 0.01,
      h: Math.random() * 0.08 + 0.02,
    }));

    let t = 0;
    const draw = () => {
      // Time advances faster with scroll velocity
      const vel = Math.min(0.02, Math.abs(scrollTelemetry.velocity) * 0.004);
      t += reduced ? 0 : 0.006 + vel;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      ctx.clearRect(0, 0, w, h);

      // Horizon rises with scroll (parallax lift)
      const horizonBase = h * 0.58;
      const horizon = horizonBase - scrollTelemetry.progress * h * 0.15;

      // Radial mouse glow
      const gx = mouse.x * w;
      const gy = mouse.y * h;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
      glow.addColorStop(0, "rgba(241, 96, 1, 0.22)");
      glow.addColorStop(0.4, "rgba(193, 8, 1, 0.07)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Skyline silhouette above horizon
      ctx.fillStyle = "rgba(30, 15, 5, 0.35)";
      for (const s of skyline) {
        const sx = s.x * w;
        const sw = s.w * w;
        const sh = s.h * h;
        ctx.fillRect(sx, horizon - sh, sw, sh);
      }

      const vp = { x: w * 0.5 + (mouse.x - 0.5) * 60, y: horizon + (mouse.y - 0.5) * 20 };
      const rows = 16;
      const cols = 22;

      // Chromatic aberration on grid — draw twice with offset when scrolling
      const chroma = Math.min(3, Math.abs(scrollTelemetry.velocity) * 0.6);

      const drawGrid = (offX: number, color: string) => {
        ctx.lineWidth = 1;
        // Horizontal receding lines
        for (let i = 0; i <= rows; i++) {
          const p = i / rows;
          const eased = Math.pow((p + t * 0.6) % 1, 2.2);
          const y = horizon + eased * (h - horizon);
          const alpha = 0.08 + (1 - eased) * 0.4;
          ctx.strokeStyle = color.replace("A", String(alpha.toFixed(3)));
          ctx.beginPath();
          ctx.moveTo(offX, y);
          ctx.lineTo(w + offX, y);
          ctx.stroke();
        }
        // Vertical converging lines
        for (let i = -cols; i <= cols; i++) {
          const x = w * 0.5 + (i / cols) * w * 1.3 + offX;
          const alpha = 0.08 + (1 - Math.abs(i) / cols) * 0.3;
          ctx.strokeStyle = color.replace("A", String(alpha.toFixed(3)));
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(vp.x + offX, vp.y);
          ctx.stroke();
        }
      };

      if (chroma > 0.3) {
        drawGrid(-chroma, "rgba(0, 200, 255, A)");
        drawGrid(chroma, "rgba(255, 40, 40, A)");
      }
      drawGrid(0, "rgba(241, 96, 1, A)");

      // Horizon glow bar
      const bar = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 50);
      bar.addColorStop(0, "rgba(0,0,0,0)");
      bar.addColorStop(0.5, `rgba(241, 96, 1, ${0.4 + Math.sin(t * 2) * 0.1})`);
      bar.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bar;
      ctx.fillRect(0, horizon - 50, w, 100);

      // Sun disc pulse — grows with scroll
      const sunR = 90 + Math.sin(t * 1.4) * 8 + scrollTelemetry.progress * 60;
      const sun = ctx.createRadialGradient(vp.x, horizon, 0, vp.x, horizon, sunR);
      sun.addColorStop(0, "rgba(255, 220, 160, 0.6)");
      sun.addColorStop(0.4, "rgba(241, 96, 1, 0.3)");
      sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(vp.x, horizon, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Concentric horizon rings
      ctx.strokeStyle = "rgba(255, 180, 100, 0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const r = sunR + 30 + i * 40 + Math.sin(t * 1.5 + i) * 8;
        ctx.beginPath();
        ctx.arc(vp.x, horizon, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drifting embers
      for (const p of particles) {
        if (!reduced) p.y -= p.s + vel * 0.5;
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
