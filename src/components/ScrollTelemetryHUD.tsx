import { useScrollTelemetry } from "@/hooks/useScrollTelemetry";
import { useEffect, useState } from "react";

/**
 * Fixed right-edge HUD. Displays live scroll telemetry — progress bar,
 * velocity, session clock, and a rotating orientation dial. Desktop only.
 */
const ScrollTelemetryHUD = () => {
  const tel = useScrollTelemetry(80);
  const [clock, setClock] = useState("00:00");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    setEnabled(true);
    const start = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      setClock(`${m}:${ss}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!enabled) return null;

  const pct = (tel.progress * 100).toFixed(1).padStart(4, "0");
  const vel = tel.velocity.toFixed(2);
  const dir = tel.direction === 1 ? "▼ DESC" : tel.direction === -1 ? "▲ ASC " : "◆ HOLD";
  const angle = tel.progress * 360;

  return (
    <aside
      aria-hidden
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 font-mono text-[10px] tracking-[0.15em] text-primary/80 select-none"
    >
      {/* Rotating dial */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border border-primary/30" />
        <div
          className="absolute inset-0 rounded-full border-t-2 border-primary transition-transform duration-100"
          style={{ transform: `rotate(${angle}deg)` }}
        />
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        <div className="absolute inset-0 flex items-center justify-center text-[9px] text-primary">
          {pct}%
        </div>
      </div>

      {/* Vertical progress rail */}
      <div className="relative h-40 w-[2px] bg-primary/15 overflow-hidden">
        <div
          className="absolute left-0 right-0 top-0 bg-gradient-to-b from-primary via-accent to-transparent transition-[height] duration-100"
          style={{ height: `${tel.progress * 100}%` }}
        />
        {[0.25, 0.5, 0.75].map((m) => (
          <div
            key={m}
            className="absolute -left-1 w-3 h-[1px] bg-primary/40"
            style={{ top: `${m * 100}%` }}
          />
        ))}
      </div>

      {/* Telemetry readouts */}
      <div className="flex flex-col items-end gap-0.5 text-primary/70">
        <div>{dir}</div>
        <div>V {vel}</div>
        <div>T {clock}</div>
      </div>
    </aside>
  );
};

export default ScrollTelemetryHUD;
