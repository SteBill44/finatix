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

// Abstract geometric shape types — replaces literal currency symbols
type ShapeKind = "dot" | "dash" | "square" | "ring" | "tick";
const SHAPE_KINDS: ShapeKind[] = ["dot", "dash", "square", "ring", "tick"];

interface Particle {
  x: number; y: number;
  radius: number; opacity: number;
  speed: number; phase: number;
  depth: number; // 0..1, used for parallax + size scaling
}

interface FloatingShape {
  x: number; y: number;
  kind: ShapeKind; opacity: number;
  speed: number; size: number;
  drift: number; phase: number;
  rotation: number; rotSpeed: number;
  depth: number; // parallax depth
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
    shapes:       [] as FloatingShape[],
    candlesticks: [] as Candlestick[],
    scanLines:    [] as ScanLine[],
    graphProgress: 0,
    graphPoints:  [] as { x: number; y: number }[],
    graphPoints2: [] as { x: number; y: number }[],
    initialized:  false,
    time:         0,
    parallaxX:    0,
    parallaxY:    0,
    targetParallaxX: 0,
    targetParallaxY: 0,
    scrollY:      0,
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

    // Doubled particle count (~45) for more vibrant data-flow atmosphere
    s.particles = Array.from({ length: 45 }, () => {
      const depth = Math.random(); // 0 = far/background, 1 = near/foreground
      return {
        x:       Math.random() * w,
        y:       Math.random() * h,
        radius:  (1 + Math.random() * 2) * (0.6 + depth * 0.8),
        opacity: 0.15 + Math.random() * 0.4,
        speed:   0.3 + Math.random() * 0.7,
        phase:   Math.random() * Math.PI * 2,
        depth,
      };
    });

    // Abstract geometric shapes (replaces literal currency symbols)
    s.shapes = Array.from({ length: 18 }, () => {
      const depth = Math.random();
      return {
        x:        Math.random() * w,
        y:        Math.random() * h,
        kind:     SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)],
        opacity:  0.06 + Math.random() * 0.10,
        speed:    0.2 + Math.random() * 0.5,
        size:     3 + Math.random() * 8 * (0.5 + depth),
        drift:    (Math.random() - 0.5) * 0.3,
        phase:    Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        depth,
      };
    });

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

    // Draw a smooth bezier path with a single horizontal gradient — supports parallax offset and glow trail
    const drawGradientLine = (
      points: { x: number; y: number }[],
      progress: number,
      lineWidth: number,
      alpha: number,
      offsetX: number = 0,
      offsetY: number = 0,
      withGlowTrail: boolean = false,
    ) => {
      const count = Math.floor(points.length * progress);
      if (count < 2) return;

      // Single horizontal gradient spanning the drawn portion
      const x0   = points[0].x + offsetX;
      const tipX = points[count - 1].x + offsetX;
      const grad = ctx.createLinearGradient(x0, 0, tipX, 0);
      grad.addColorStop(0,    hexToRgba(GRADIENT_STOPS[0], alpha * 0.4));
      grad.addColorStop(0.3,  hexToRgba(GRADIENT_STOPS[1], alpha * 0.75));
      grad.addColorStop(0.65, hexToRgba(GRADIENT_STOPS[2], alpha));
      grad.addColorStop(1,    hexToRgba(GRADIENT_STOPS[3], alpha));

      const buildPath = () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x + offsetX, points[0].y + offsetY);
        for (let i = 1; i < count - 1; i++) {
          const mx = (points[i].x + points[i + 1].x) / 2 + offsetX;
          const my = (points[i].y + points[i + 1].y) / 2 + offsetY;
          ctx.quadraticCurveTo(points[i].x + offsetX, points[i].y + offsetY, mx, my);
        }
        ctx.lineTo(points[count - 1].x + offsetX, points[count - 1].y + offsetY);
      };

      // Outer glow trail — soft halo along the entire stroke
      if (withGlowTrail) {
        buildPath();
        ctx.strokeStyle = hexToRgba(P.ORANGE, alpha * 0.18);
        ctx.lineWidth   = lineWidth * 4;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.stroke();

        buildPath();
        ctx.strokeStyle = hexToRgba(P.ORANGE_LIGHT, alpha * 0.28);
        ctx.lineWidth   = lineWidth * 2.2;
        ctx.stroke();
      }

      // Main stroke (smooth bezier through midpoints)
      buildPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = lineWidth;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();

      // Leading-tip glow removed: the lines now span the full width, so a "tip" highlight at the off-screen edge would look out of place.

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

      // Horizontal scan lines removed per design preference


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

      // Floating abstract shapes (mid-depth parallax layer)
      s.shapes.forEach((sh) => {
        sh.y -= sh.speed;
        sh.x += sh.drift + Math.sin(s.time * 2 + sh.phase) * 0.12;
        sh.rotation += sh.rotSpeed;
        if (sh.y < -40) { sh.y = h + 40; sh.x = Math.random() * w; }

        // Mid-layer parallax: shapes shift moderately with mouse + scroll
        const px = sh.x + s.parallaxX * (0.4 + sh.depth * 0.6);
        const py = sh.y + s.parallaxY * (0.4 + sh.depth * 0.6) - s.scrollY * 0.15 * sh.depth;

        const a = sh.opacity * SYMBOL_BOOST;
        const col = sh.depth > 0.5 ? P.ORANGE : P.GRAY;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(sh.rotation);
        ctx.fillStyle   = hexToRgba(col, a);
        ctx.strokeStyle = hexToRgba(col, a * 1.2);
        ctx.lineWidth   = 1;
        switch (sh.kind) {
          case "dot":
            ctx.beginPath();
            ctx.arc(0, 0, sh.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "dash":
            ctx.fillRect(-sh.size * 0.6, -sh.size * 0.08, sh.size * 1.2, sh.size * 0.16);
            break;
          case "square":
            ctx.strokeRect(-sh.size * 0.4, -sh.size * 0.4, sh.size * 0.8, sh.size * 0.8);
            break;
          case "ring":
            ctx.beginPath();
            ctx.arc(0, 0, sh.size * 0.45, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "tick":
            ctx.beginPath();
            ctx.moveTo(-sh.size * 0.4, sh.size * 0.1);
            ctx.lineTo(-sh.size * 0.05, sh.size * 0.4);
            ctx.lineTo(sh.size * 0.5, -sh.size * 0.3);
            ctx.stroke();
            break;
        }
        ctx.restore();
      });

      // Smoothly interpolate parallax toward target (mouse position)
      s.parallaxX += (s.targetParallaxX - s.parallaxX) * 0.06;
      s.parallaxY += (s.targetParallaxY - s.parallaxY) * 0.06;

      // Graph cycle still drives reseeding, but the line itself always renders fully across
      const cycleDuration = 3;
      const holdDuration  = 1.5;
      const cycleTime     = s.time % (cycleDuration + holdDuration);
      s.graphProgress = 1;

      const graphParX = s.parallaxX * 0.15;
      const graphParY = s.parallaxY * 0.15 - s.scrollY * 0.05;

      // Both lines span edge-to-edge; no glow halo trail
      drawGradientLine(s.graphPoints,  1,    4.5, 1.0,  graphParX,       graphParY,       false);
      drawGradientLine(s.graphPoints2, 1,    2.2, 0.55, graphParX * 1.2, graphParY * 1.2, false);

      // Area fill under primary graph (with parallax offset to match)
      const count = Math.floor(s.graphPoints.length * s.graphProgress);
      if (count > 1) {
        ctx.beginPath();
        ctx.moveTo(s.graphPoints[0].x + graphParX, h);
        for (let i = 1; i < count - 1; i++) {
          const mx = (s.graphPoints[i].x + s.graphPoints[i + 1].x) / 2 + graphParX;
          const my = (s.graphPoints[i].y + s.graphPoints[i + 1].y) / 2 + graphParY;
          ctx.quadraticCurveTo(s.graphPoints[i].x + graphParX, s.graphPoints[i].y + graphParY, mx, my);
        }
        ctx.lineTo(s.graphPoints[count - 1].x + graphParX, s.graphPoints[count - 1].y + graphParY);
        ctx.lineTo(s.graphPoints[count - 1].x + graphParX, h);
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, 0, 0, h);
        ag.addColorStop(0, hexToRgba(P.ORANGE, AREA_TOP_ALPHA));
        ag.addColorStop(0.6, hexToRgba(P.ORANGE, AREA_MID_ALPHA));
        ag.addColorStop(1, hexToRgba(P.ORANGE, 0));
        ctx.fillStyle = ag;
        ctx.fill();
      }

      // Particles — FOREGROUND parallax layer (strongest mouse/scroll response)
      // First pass: compute final on-screen positions so we can draw constellation lines underneath.
      const particlePositions: { x: number; y: number; pulse: number; p: typeof s.particles[number] }[] = [];
      s.particles.forEach((p) => {
        const pulse = 0.7 + 0.3 * Math.sin(s.time * 3 + p.phase);
        const parX = s.parallaxX * (0.8 + p.depth * 1.4);
        const parY = s.parallaxY * (0.8 + p.depth * 1.4) - s.scrollY * 0.3 * p.depth;
        const px = p.x + Math.cos(s.time * p.speed * 2 + p.phase) * 4 + parX;
        const py = p.y + Math.sin(s.time * p.speed * 3 + p.phase) * 8 + parY;
        particlePositions.push({ x: px, y: py, pulse, p });
      });

      // Constellation lines — connect particles within MAX_DIST, fading by distance
      const MAX_DIST = 140;
      const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
      const LINE_BASE_ALPHA = isDark ? 0.18 : 0.22;
      ctx.lineWidth = 0.6;
      ctx.lineCap   = "round";
      for (let i = 0; i < particlePositions.length; i++) {
        const a = particlePositions[i];
        for (let j = i + 1; j < particlePositions.length; j++) {
          const b = particlePositions[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq > MAX_DIST_SQ) continue;
          const d = Math.sqrt(dSq);
          // Fade by distance, modulated by both particles' opacity & depth
          const proximity = 1 - d / MAX_DIST;
          const depthAvg  = (a.p.depth + b.p.depth) / 2;
          const alpha = LINE_BASE_ALPHA * proximity * proximity * (0.4 + depthAvg * 0.6)
                      * Math.min(1, (a.p.opacity + b.p.opacity));
          if (alpha < 0.005) continue;
          ctx.strokeStyle = hexToRgba(P.ORANGE, alpha);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Draw particles on top of the constellation web
      particlePositions.forEach(({ x: px, y: py, pulse, p }) => {
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

    // Mouse parallax — track cursor relative to canvas center
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      // Normalized -1..1, scaled to a max ~25px parallax shift
      const nx = (e.clientX - cx) / (rect.width  / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      stateRef.current.targetParallaxX = Math.max(-1, Math.min(1, nx)) * 25;
      stateRef.current.targetParallaxY = Math.max(-1, Math.min(1, ny)) * 18;
    };
    const handleScroll = () => {
      stateRef.current.scrollY = window.scrollY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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
