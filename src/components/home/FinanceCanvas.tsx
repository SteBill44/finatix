import { useEffect, useRef, useCallback } from "react";

// Colors from branding
const ORANGE = "#E85002";
const ORANGE_LIGHT = "#F16001";
const CREAM = "#D9C3AB";
const GRAY = "#A7A7A7";
const GRADIENT_STOPS = ["#000000", "#C10801", "#F16001", "#D9C3AB"];
const SYMBOLS = ["£", "$", "%", "¥", "€"];

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  phase: number;
}

interface FloatingSymbol {
  x: number;
  y: number;
  symbol: string;
  opacity: number;
  speed: number;
  size: number;
  drift: number;
  phase: number;
}

interface Candlestick {
  x: number;
  y: number;
  width: number;
  bodyHeight: number;
  wickHeight: number;
  bullish: boolean;
  opacity: number;
  speed: number;
  drift: number;
}

const FinanceCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef({
    particles: [] as Particle[],
    symbols: [] as FloatingSymbol[],
    candlesticks: [] as Candlestick[],
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
      // Trending upward with organic noise
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

    // Graph lines
    s.graphPoints = generateGraphPoints(w, h, 1.3, h * 0.28);
    s.graphPoints2 = generateGraphPoints(w, h, 4.7, h * 0.2);

    // Particles along graph
    s.particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 1.5 + Math.random() * 2.5,
      opacity: 0.15 + Math.random() * 0.25,
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    // Floating currency symbols
    s.symbols = Array.from({ length: 10 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      opacity: 0.04 + Math.random() * 0.06,
      speed: 0.15 + Math.random() * 0.25,
      size: 14 + Math.random() * 22,
      drift: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    // Candlestick shapes
    s.candlesticks = Array.from({ length: 8 }, () => ({
      x: Math.random() * w,
      y: h * 0.3 + Math.random() * h * 0.4,
      width: 4 + Math.random() * 6,
      bodyHeight: 12 + Math.random() * 25,
      wickHeight: 20 + Math.random() * 30,
      bullish: Math.random() > 0.4,
      opacity: 0.06 + Math.random() * 0.08,
      speed: 0.1 + Math.random() * 0.2,
      drift: (Math.random() - 0.5) * 0.15,
    }));

    s.graphProgress = 0;
    s.initialized = true;
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
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
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
      alpha: number
    ) => {
      const count = Math.floor(points.length * progress);
      if (count < 2) return;

      // Draw line segments with gradient color
      for (let i = 1; i < count; i++) {
        const t = i / points.length;
        // Map t to gradient stops
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
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Glow at the leading edge
      if (count > 1) {
        const tip = points[count - 1];
        const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 20);
        glow.addColorStop(0, hexToRgba(ORANGE, 0.4 * alpha));
        glow.addColorStop(1, hexToRgba(ORANGE, 0));
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    };

    const draw = () => {
      const s = stateRef.current;
      if (!s.initialized) return;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Black base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      s.time += 0.008;

      // Subtle grid lines
      ctx.strokeStyle = "rgba(232, 80, 2, 0.03)";
      ctx.lineWidth = 0.5;
      const gridSpacing = 60;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Candlesticks (drifting)
      s.candlesticks.forEach((c) => {
        c.y -= c.speed;
        c.x += c.drift;
        if (c.y < -50) {
          c.y = h + 50;
          c.x = Math.random() * w;
        }

        const color = c.bullish ? ORANGE : ORANGE_LIGHT;
        // Wick
        ctx.strokeStyle = hexToRgba(color, c.opacity * 0.7);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x + c.width / 2, c.y - c.wickHeight / 2);
        ctx.lineTo(c.x + c.width / 2, c.y + c.wickHeight / 2);
        ctx.stroke();
        // Body
        ctx.fillStyle = hexToRgba(color, c.opacity);
        ctx.fillRect(c.x, c.y - c.bodyHeight / 2, c.width, c.bodyHeight);
      });

      // Floating symbols
      s.symbols.forEach((sym) => {
        sym.y -= sym.speed;
        sym.x += sym.drift + Math.sin(s.time * 2 + sym.phase) * 0.1;
        if (sym.y < -40) {
          sym.y = h + 40;
          sym.x = Math.random() * w;
        }
        ctx.font = `300 ${sym.size}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = hexToRgba(GRAY, sym.opacity);
        ctx.textAlign = "center";
        ctx.fillText(sym.symbol, sym.x, sym.y);
      });

      // Graph progress — draw, hold, fade, restart
      const cycleDuration = 6; // seconds per draw cycle
      const holdDuration = 2;
      const totalCycle = cycleDuration + holdDuration;
      const cycleTime = s.time % totalCycle;

      if (cycleTime < cycleDuration) {
        s.graphProgress = Math.min(1, cycleTime / cycleDuration);
      } else {
        s.graphProgress = 1;
      }

      // Draw graph lines
      drawGradientLine(s.graphPoints, s.graphProgress, 2, 0.6);
      drawGradientLine(s.graphPoints2, s.graphProgress * 0.85, 1.2, 0.3);

      // Area fill under primary graph
      const count = Math.floor(s.graphPoints.length * s.graphProgress);
      if (count > 1) {
        ctx.beginPath();
        ctx.moveTo(s.graphPoints[0].x, h);
        for (let i = 0; i < count; i++) {
          ctx.lineTo(s.graphPoints[i].x, s.graphPoints[i].y);
        }
        ctx.lineTo(s.graphPoints[count - 1].x, h);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, 0, 0, h);
        areaGrad.addColorStop(0, hexToRgba(ORANGE, 0.08));
        areaGrad.addColorStop(1, hexToRgba(ORANGE, 0));
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }

      // Data point particles with glow
      s.particles.forEach((p) => {
        const floatY = Math.sin(s.time * p.speed * 3 + p.phase) * 8;
        const floatX = Math.cos(s.time * p.speed * 2 + p.phase) * 4;
        const px = p.x + floatX;
        const py = p.y + floatY;

        // Radial glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 5);
        glow.addColorStop(0, hexToRgba(ORANGE, p.opacity * 0.5));
        glow.addColorStop(1, hexToRgba(ORANGE, 0));
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(CREAM, p.opacity);
        ctx.fill();
      });

      // Regenerate graph on cycle restart
      if (cycleTime < 0.01) {
        s.graphPoints = generateGraphPoints(w, h, Math.random() * 10, h * 0.28);
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

// Utility: hex to rgba string
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Utility: lerp between two hex colors
function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

export default FinanceCanvas;
