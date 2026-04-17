import { useEffect, useRef, useCallback } from "react";

// Deep navy-teal palette — ties into the existing teal design token
// while being a clear departure from the original black/orange
const TEAL_BRIGHT  = "#17B8C8";
const TEAL_MID     = "#0D8A9A";
const TEAL_DARK    = "#063A4A";
const NAVY_BASE    = "#05121A";
const CREAM        = "#D9C3AB";
const GRAY         = "#7ABBC8";

// Gradient that draws across the graph lines: navy → teal-dark → teal-mid → teal-bright
const GRADIENT_STOPS = [NAVY_BASE, TEAL_DARK, TEAL_MID, TEAL_BRIGHT];

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
  y: number; speed: number; opacity: number; width: number;
}

const FinanceCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef({
    particles: [] as Particle[],
    symbols: [] as FloatingSymbol[],
    candlesticks: [] as Candlestick[],
    scanLines: [] as ScanLine[],
    graphProgress: 0,
    graphPoints: [] as { x: number; y: number }[],
    graphPoints2: [] as { x: number; y: number }[],
    initialized: false,
    time: 0,
  });

  const generateGraphPoints = useCallback((w: number, h: number, seed: number, amplitude: number) => {
    const points: { x: number; y: number }[] = [];
    const segments = 60;
    const midY = h * 0.55;
    let y = midY + (Math.random() - 0.5) * amplitude * 0.3;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * (w + 100) - 50;
      const trend = -amplitude * 0.4 * (i / segments);
      const noise =
        Math.sin(i * 0.3 + seed) * amplitude * 0.25 +
        Math.sin(i * 0.7 + seed * 2) * amplitude * 0.15 +
        Math.sin(i * 0.13 + seed * 3) * amplitude * 0.1;
      y = midY + trend + noise;
      points.push({ x, y: Math.max(h * 0.15, Math.min(h * 0.85, y)) });
    }
    return points;
  }, []);

  const initState = useCallback((w: number, h: number) => {
    const s = stateRef.current;

    s.graphPoints  = generateGraphPoints(w, h, 1.3, h * 0.28);
    s.graphPoints2 = generateGraphPoints(w, h, 4.7, h * 0.2);

    // Faster-moving particles (2× the original speeds)
    s.particles = Array.from({ length: 22 }, () => ({
      x:       Math.random() * w,
      y:       Math.random() * h,
      radius:  1.5 + Math.random() * 2.5,
      opacity: 0.2 + Math.random() * 0.35,
      speed:   0.5 + Math.random() * 0.8,   // was 0.2–0.6
      phase:   Math.random() * Math.PI * 2,
    }));

    // Faster-rising currency symbols
    s.symbols = Array.from({ length: 12 }, () => ({
      x:       Math.random() * w,
      y:       Math.random() * h,
      symbol:  SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      opacity: 0.05 + Math.random() * 0.08,
      speed:   0.4 + Math.random() * 0.5,   // was 0.15–0.4
      size:    14 + Math.random() * 22,
      drift:   (Math.random() - 0.5) * 0.35,
      phase:   Math.random() * Math.PI * 2,
    }));

    // Faster-drifting candlesticks
    s.candlesticks = Array.from({ length: 10 }, () => ({
      x:          Math.random() * w,
      y:          h * 0.3 + Math.random() * h * 0.4,
      width:      4 + Math.random() * 6,
      bodyHeight: 12 + Math.random() * 25,
      wickHeight: 20 + Math.random() * 30,
      bullish:    Math.random() > 0.4,
      opacity:    0.07 + Math.random() * 0.1,
      speed:      0.3 + Math.random() * 0.4,  // was 0.1–0.3
      drift:      (Math.random() - 0.5) * 0.2,
    }));

    // Horizontal scan lines — new animation element
    s.scanLines = Array.from({ length: 3 }, (_, i) => ({
      y:       (h / 3) * i + Math.random() * (h / 3),
      speed:   0.6 + Math.random() * 0.8,
      opacity: 0.03 + Math.random() * 0.04,
      width:   0.5 + Math.random() * 0.5,
    }));

    s.graphProgress = 0;
    s.initialized   = true;
  }, [generateGraphPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const drawGradientLine = (
      points: { x: number; y: number }[],
      progress: number,
      lineWidth: number,
      alpha: number,
    ) => {
      const count = Math.floor(points.length * progress);
      if (count < 2) return;

      for (let i = 1; i < count; i++) {
        const t = i / points.length;
        let color: string;
        if (t < 0.33) {
          color = lerpColor(GRADIENT_STOPS[0], GRADIENT_STOPS[1], t / 0.33);
        } else if (t < 0.66) {
          color = lerpColor(GRADIENT_STOPS[1], GRADIENT_STOPS[2], (t - 0.33) / 0.33);
        } else {
          color = lerpColor(GRADIENT_STOPS[2], GRADIENT_STOPS[3], (t - 0.66) / 0.34);
        }
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
        ctx.strokeStyle = hexToRgba(color, alpha);
        ctx.lineWidth   = lineWidth;
        ctx.lineCap     = "round";
        ctx.stroke();
      }

      // Teal glow at the leading tip
      if (count > 1) {
        const tip  = points[count - 1];
        const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 22);
        glow.addColorStop(0, hexToRgba(TEAL_BRIGHT, 0.45 * alpha));
        glow.addColorStop(1, hexToRgba(TEAL_BRIGHT, 0));
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    };

    const draw = () => {
      const s = stateRef.current;
      if (!s.initialized) return;

      const w = canvas.width  / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // Navy base fill
      ctx.fillStyle = NAVY_BASE;
      ctx.fillRect(0, 0, w, h);

      // Subtle radial spotlight in upper-left (depth effect)
      const spot = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.7);
      spot.addColorStop(0, hexToRgba(TEAL_DARK, 0.25));
      spot.addColorStop(1, hexToRgba(TEAL_DARK, 0));
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      // Faster time step (was 0.008, now 0.018 — ~2.25× speed)
      s.time += 0.018;

      // Grid lines in teal
      ctx.strokeStyle = hexToRgba(TEAL_MID, 0.04);
      ctx.lineWidth   = 0.5;
      const gridSpacing = 60;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // ── New: horizontal scan lines ──────────────────────────────────────
      s.scanLines.forEach((sl) => {
        sl.y += sl.speed;
        if (sl.y > h + 10) sl.y = -10;

        const scanGrad = ctx.createLinearGradient(0, sl.y - 8, 0, sl.y + 8);
        scanGrad.addColorStop(0, hexToRgba(TEAL_BRIGHT, 0));
        scanGrad.addColorStop(0.5, hexToRgba(TEAL_BRIGHT, sl.opacity));
        scanGrad.addColorStop(1, hexToRgba(TEAL_BRIGHT, 0));
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, sl.y - 8, w, 16);
      });

      // Candlesticks
      s.candlesticks.forEach((c) => {
        c.y -= c.speed;
        c.x += c.drift;
        if (c.y < -50) { c.y = h + 50; c.x = Math.random() * w; }

        const color = c.bullish ? TEAL_BRIGHT : TEAL_MID;
        ctx.strokeStyle = hexToRgba(color, c.opacity * 0.7);
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(c.x + c.width / 2, c.y - c.wickHeight / 2);
        ctx.lineTo(c.x + c.width / 2, c.y + c.wickHeight / 2);
        ctx.stroke();
        ctx.fillStyle = hexToRgba(color, c.opacity);
        ctx.fillRect(c.x, c.y - c.bodyHeight / 2, c.width, c.bodyHeight);
      });

      // Floating currency symbols
      s.symbols.forEach((sym) => {
        sym.y -= sym.speed;
        sym.x += sym.drift + Math.sin(s.time * 2 + sym.phase) * 0.12;
        if (sym.y < -40) { sym.y = h + 40; sym.x = Math.random() * w; }
        ctx.font      = `300 ${sym.size}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = hexToRgba(GRAY, sym.opacity);
        ctx.textAlign = "center";
        ctx.fillText(sym.symbol, sym.x, sym.y);
      });

      // Graph draw cycle — 3 s draw + 1.5 s hold (was 6 + 2)
      const cycleDuration = 3;
      const holdDuration  = 1.5;
      const totalCycle    = cycleDuration + holdDuration;
      const cycleTime     = s.time % totalCycle;

      s.graphProgress = cycleTime < cycleDuration ? Math.min(1, cycleTime / cycleDuration) : 1;

      drawGradientLine(s.graphPoints,  s.graphProgress,        2,   0.65);
      drawGradientLine(s.graphPoints2, s.graphProgress * 0.85, 1.2, 0.3);

      // Teal area fill under primary graph
      const count = Math.floor(s.graphPoints.length * s.graphProgress);
      if (count > 1) {
        ctx.beginPath();
        ctx.moveTo(s.graphPoints[0].x, h);
        for (let i = 0; i < count; i++) ctx.lineTo(s.graphPoints[i].x, s.graphPoints[i].y);
        ctx.lineTo(s.graphPoints[count - 1].x, h);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, 0, 0, h);
        areaGrad.addColorStop(0, hexToRgba(TEAL_MID, 0.1));
        areaGrad.addColorStop(1, hexToRgba(TEAL_MID, 0));
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }

      // Data-point particles — pulsing glow
      s.particles.forEach((p) => {
        const pulse   = 0.7 + 0.3 * Math.sin(s.time * 3 + p.phase);
        const floatY  = Math.sin(s.time * p.speed * 3 + p.phase) * 8;
        const floatX  = Math.cos(s.time * p.speed * 2 + p.phase) * 4;
        const px = p.x + floatX;
        const py = p.y + floatY;

        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 5 * pulse);
        glow.addColorStop(0, hexToRgba(TEAL_BRIGHT, p.opacity * 0.55 * pulse));
        glow.addColorStop(1, hexToRgba(TEAL_BRIGHT, 0));
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(CREAM, p.opacity * pulse);
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
  }, [initState, generateGraphPoints]);

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
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

export default FinanceCanvas;
