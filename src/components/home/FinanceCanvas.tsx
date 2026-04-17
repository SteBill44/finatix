import { useEffect, useRef, useCallback, useState } from "react";

// ---------- Dark theme palette ----------
const DARK = {
  BG_TOP:       "#1C0D04",
  BG_MID:       "#0F0806",
  BG_BOTTOM:    "#06060A",
  ORANGE:       "#E85002",
  ORANGE_LIGHT: "#F16001",
  ORANGE_DARK:  "#5A1E00",
  CREAM:        "#D9C3AB",
  GRAY:         "#A7A7A7",
  BLOOM:        "#5A1E00",
};

// ---------- Light theme palette ----------
// Soft cream → warm peach background, with vivid orange accents kept brand-aligned
const LIGHT = {
  BG_TOP:       "#FFF6EE",
  BG_MID:       "#FFE9D6",
  BG_BOTTOM:    "#FFD9BD",
  ORANGE:       "#E85002",
  ORANGE_LIGHT: "#F16001",
  ORANGE_DARK:  "#C10801",
  CREAM:        "#FFFFFF",
  GRAY:         "#7A6A5C",
  BLOOM:        "#FFB07A",
};

const SYMBOLS = ["£", "$", "%", "¥", "€"];

interface Particle {
  x: number; y: number;
  radius: number; opacity: number;
  speed: number; phase: number;
}

interface FloatingSymbol {
  x: number; y: number;
  symbol: string; opacity: number;
  speed: number; size: number;
  drift: number; phase: number;
}

interface Candlestick {
  x: number; y: number;
  width: number; bodyHeight: number;
  wickHeight: number; bullish: boolean;
  opacity: number; speed: number; drift: number;
}

interface ScanLine {
  y: number; speed: number; opacity: number;
}

const FinanceCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  // Watch theme changes by observing the `dark` class on <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const stateRef = useRef({
    particles:    [] as Particle[],
    symbols:      [] as FloatingSymbol[],
    candlesticks: [] as Candlestick[],
    scanLines:    [] as ScanLine[],
    graphProgress: 0,
    graphPoints:  [] as { x: number; y: number }[],
    graphPoints2: [] as { x: number; y: number }[],
    initialized:  false,
    time:         0,
  });

  // Lower-frequency noise → wider, smoother waves
  const generateGraphPoints = useCallback((w: number, h: number, seed: number, amplitude: number) => {
    const points: { x: number; y: number }[] = [];
    const segments = 60;
    const midY = h * 0.55;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * (w + 100) - 50;
      const trend = -amplitude * 0.4 * (i / segments);
      const noise =
        Math.sin(i * 0.18 + seed)       * amplitude * 0.30 +
        Math.sin(i * 0.38 + seed * 2)   * amplitude * 0.14 +
        Math.sin(i * 0.07 + seed * 3)   * amplitude * 0.12;
      const y = midY + trend + noise;
      points.push({ x, y: Math.max(h * 0.15, Math.min(h * 0.85, y)) });
    }
    return points;
  }, []);

  const initState = useCallback((w: number, h: number) => {
    const s = stateRef.current;

    s.graphPoints  = generateGraphPoints(w, h, 1.3, h * 0.28);
    s.graphPoints2 = generateGraphPoints(w, h, 4.7, h * 0.2);

    s.particles = Array.from({ length: 20 }, () => ({
      x:       Math.random() * w,
      y:       Math.random() * h,
      radius:  1.5 + Math.random() * 2.5,
      opacity: 0.2 + Math.random() * 0.35,
      speed:   0.5 + Math.random() * 0.8,
      phase:   Math.random() * Math.PI * 2,
    }));

    s.symbols = Array.from({ length: 12 }, () => ({
      x:       Math.random() * w,
      y:       Math.random() * h,
      symbol:  SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      opacity: 0.04 + Math.random() * 0.06,
      speed:   0.4 + Math.random() * 0.5,
      size:    14 + Math.random() * 22,
      drift:   (Math.random() - 0.5) * 0.35,
      phase:   Math.random() * Math.PI * 2,
    }));

    s.candlesticks = Array.from({ length: 10 }, () => ({
      x:          Math.random() * w,
      y:          h * 0.3 + Math.random() * h * 0.4,
      width:      4 + Math.random() * 6,
      bodyHeight: 12 + Math.random() * 25,
      wickHeight: 20 + Math.random() * 30,
      bullish:    Math.random() > 0.4,
      opacity:    0.07 + Math.random() * 0.09,
      speed:      0.3 + Math.random() * 0.4,
      drift:      (Math.random() - 0.5) * 0.2,
    }));

    s.scanLines = Array.from({ length: 3 }, (_, i) => ({
      y:       (h / 3) * i + Math.random() * (h / 3),
      speed:   0.6 + Math.random() * 0.8,
      opacity: 0.025 + Math.random() * 0.03,
    }));

    s.graphProgress = 0;
    s.initialized   = true;
  }, [generateGraphPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve palette per render — re-runs when isDark changes
    const P = isDark ? DARK : LIGHT;
    const GRADIENT_STOPS = isDark
      ? [P.BG_TOP, P.ORANGE_DARK, P.ORANGE, P.ORANGE_LIGHT]
      : [P.CREAM, P.ORANGE_LIGHT, P.ORANGE, P.ORANGE_DARK];

    // Visual tuning that differs between themes
    const GRID_ALPHA       = isDark ? 0.03 : 0.06;
    const SCAN_BOOST       = isDark ? 1    : 1.6;
    const CANDLE_BOOST     = isDark ? 1    : 1.8;
    const SYMBOL_BOOST     = isDark ? 1    : 2.2;
    const AREA_TOP_ALPHA   = isDark ? 0.18 : 0.22;
    const AREA_MID_ALPHA   = isDark ? 0.05 : 0.08;
    const PARTICLE_GLOW_A  = isDark ? 0.5  : 0.55;
    const BLOOM_ALPHA      = isDark ? 0.35 : 0.45;
    const PARTICLE_CORE    = isDark ? P.CREAM : P.ORANGE_LIGHT;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width  = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initState(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Draw a smooth bezier path with a single horizontal gradient — no per-segment stroking
    const drawGradientLine = (
      points: { x: number; y: number }[],
      progress: number,
      lineWidth: number,
      alpha: number,
    ) => {
      const count = Math.floor(points.length * progress);
      if (count < 2) return;

      // Single horizontal gradient spanning the drawn portion
      const x0   = points[0].x;
      const tipX = points[count - 1].x;
      const grad = ctx.createLinearGradient(x0, 0, tipX, 0);
      grad.addColorStop(0,    hexToRgba(GRADIENT_STOPS[0], alpha * 0.4));
      grad.addColorStop(0.3,  hexToRgba(GRADIENT_STOPS[1], alpha * 0.75));
      grad.addColorStop(0.65, hexToRgba(GRADIENT_STOPS[2], alpha));
      grad.addColorStop(1,    hexToRgba(GRADIENT_STOPS[3], alpha));

      // Smooth quadratic bezier through midpoints — eliminates all jaggedness
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < count - 1; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.lineTo(points[count - 1].x, points[count - 1].y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = lineWidth;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();

      // Glow dot at the leading tip
      const tip  = points[count - 1];
      const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 28);
      glow.addColorStop(0, hexToRgba(P.ORANGE_LIGHT, 0.75 * alpha));
      glow.addColorStop(0.4, hexToRgba(P.ORANGE, 0.4 * alpha));
      glow.addColorStop(1, hexToRgba(P.ORANGE, 0));
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    };

    const draw = () => {
      const s = stateRef.current;
      if (!s.initialized) return;

      const w = canvas.width  / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // Background: diagonal gradient from dark warm charcoal (top-left) to near-black (bottom-right)
      const bgGrad = ctx.createLinearGradient(0, 0, w * 0.6, h);
      bgGrad.addColorStop(0,   P.BG_TOP);
      bgGrad.addColorStop(0.5, P.BG_MID);
      bgGrad.addColorStop(1,   P.BG_BOTTOM);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Warm radial bloom in upper-left to amplify the orange warmth
      const bloom = ctx.createRadialGradient(w * 0.15, h * 0.25, 0, w * 0.15, h * 0.25, w * 0.65);
      bloom.addColorStop(0, hexToRgba(P.BLOOM, BLOOM_ALPHA));
      bloom.addColorStop(1, hexToRgba(P.BLOOM, 0));
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      s.time += 0.018;

      // Faint orange grid
      ctx.strokeStyle = hexToRgba(P.ORANGE, GRID_ALPHA);
      ctx.lineWidth   = 0.5;
      const gs = 60;
      for (let x = 0; x < w; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Horizontal scan lines in orange
      s.scanLines.forEach((sl) => {
        sl.y += sl.speed;
        if (sl.y > h + 10) sl.y = -10;
        const sg = ctx.createLinearGradient(0, sl.y - 8, 0, sl.y + 8);
        sg.addColorStop(0,   hexToRgba(P.ORANGE_LIGHT, 0));
        sg.addColorStop(0.5, hexToRgba(P.ORANGE_LIGHT, sl.opacity * SCAN_BOOST));
        sg.addColorStop(1,   hexToRgba(P.ORANGE_LIGHT, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(0, sl.y - 8, w, 16);
      });

      // Candlesticks
      s.candlesticks.forEach((c) => {
        c.y -= c.speed;
        c.x += c.drift;
        if (c.y < -50) { c.y = h + 50; c.x = Math.random() * w; }
        const col = c.bullish ? P.ORANGE : P.GRAY;
        ctx.strokeStyle = hexToRgba(col, c.opacity * 0.7 * CANDLE_BOOST);
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(c.x + c.width / 2, c.y - c.wickHeight / 2);
        ctx.lineTo(c.x + c.width / 2, c.y + c.wickHeight / 2);
        ctx.stroke();
        ctx.fillStyle = hexToRgba(col, c.opacity * CANDLE_BOOST);
        ctx.fillRect(c.x, c.y - c.bodyHeight / 2, c.width, c.bodyHeight);
      });

      // Floating currency symbols
      s.symbols.forEach((sym) => {
        sym.y -= sym.speed;
        sym.x += sym.drift + Math.sin(s.time * 2 + sym.phase) * 0.12;
        if (sym.y < -40) { sym.y = h + 40; sym.x = Math.random() * w; }
        ctx.font      = `300 ${sym.size}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = hexToRgba(P.GRAY, sym.opacity * SYMBOL_BOOST);
        ctx.textAlign = "center";
        ctx.fillText(sym.symbol, sym.x, sym.y);
      });

      // Graph draw cycle
      const cycleDuration = 3;
      const holdDuration  = 1.5;
      const cycleTime     = s.time % (cycleDuration + holdDuration);
      s.graphProgress = cycleTime < cycleDuration ? Math.min(1, cycleTime / cycleDuration) : 1;

      drawGradientLine(s.graphPoints,  s.graphProgress,        3,   0.9);
      drawGradientLine(s.graphPoints2, s.graphProgress * 0.85, 2,   0.55);

      // Area fill under primary graph
      const count = Math.floor(s.graphPoints.length * s.graphProgress);
      if (count > 1) {
        ctx.beginPath();
        ctx.moveTo(s.graphPoints[0].x, h);
        for (let i = 1; i < count - 1; i++) {
          const mx = (s.graphPoints[i].x + s.graphPoints[i + 1].x) / 2;
          const my = (s.graphPoints[i].y + s.graphPoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(s.graphPoints[i].x, s.graphPoints[i].y, mx, my);
        }
        ctx.lineTo(s.graphPoints[count - 1].x, s.graphPoints[count - 1].y);
        ctx.lineTo(s.graphPoints[count - 1].x, h);
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, 0, 0, h);
        ag.addColorStop(0, hexToRgba(P.ORANGE, AREA_TOP_ALPHA));
        ag.addColorStop(0.6, hexToRgba(P.ORANGE, AREA_MID_ALPHA));
        ag.addColorStop(1, hexToRgba(P.ORANGE, 0));
        ctx.fillStyle = ag;
        ctx.fill();
      }

      // Particles — pulsing orange glow with cream core
      s.particles.forEach((p) => {
        const pulse = 0.7 + 0.3 * Math.sin(s.time * 3 + p.phase);
        const px = p.x + Math.cos(s.time * p.speed * 2 + p.phase) * 4;
        const py = p.y + Math.sin(s.time * p.speed * 3 + p.phase) * 8;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 5 * pulse);
        glow.addColorStop(0, hexToRgba(P.ORANGE, p.opacity * PARTICLE_GLOW_A * pulse));
        glow.addColorStop(1, hexToRgba(P.ORANGE, 0));
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(PARTICLE_CORE, p.opacity * pulse);
        ctx.fill();
      });

      if (cycleTime < 0.02) {
        s.graphPoints  = generateGraphPoints(w, h, Math.random() * 10, h * 0.28);
        s.graphPoints2 = generateGraphPoints(w, h, Math.random() * 10, h * 0.2);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initState, generateGraphPoints, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const r  = Math.round(ar + (br - ar) * t);
  const g  = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

export default FinanceCanvas;
