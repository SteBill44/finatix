import { motion } from "framer-motion";

/**
 * HeroHUD — decorative sci-fi overlay: corner brackets, ID strip,
 * rotating rings, live coordinate ticker. Pure visual, no data.
 */
const HeroHUD = () => {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none z-[5] font-mono text-[10px] tracking-[0.2em] text-primary/70">
      {/* Corner brackets */}
      {[
        "top-6 left-6 border-t-2 border-l-2",
        "top-6 right-6 border-t-2 border-r-2",
        "bottom-6 left-6 border-b-2 border-l-2",
        "bottom-6 right-6 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-8 h-8 border-primary/60 ${cls}`} />
      ))}

      {/* Top ID strip */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 uppercase">
        <span className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
        <span>FNX-01 · SYS.ONLINE · CIMA/GATEWAY</span>
        <span className="w-1.5 h-1.5 bg-accent animate-pulse rounded-full" />
      </div>

      {/* Bottom-left telemetry block */}
      <div className="absolute bottom-8 left-8 space-y-1 uppercase">
        <div>› NODE 042 / SECTOR ORION</div>
        <div>› BANDWIDTH · <span className="text-accent">98.4%</span></div>
        <div>› LAT 51.5074 · LON -0.1278</div>
      </div>

      {/* Rotating ring assembly, right side */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-28 h-28">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-primary/40"
          style={{
            maskImage:
              "conic-gradient(from 0deg, black 0deg, black 90deg, transparent 90deg, transparent 180deg, black 180deg, black 270deg, transparent 270deg)",
            WebkitMaskImage:
              "conic-gradient(from 0deg, black 0deg, black 90deg, transparent 90deg, transparent 180deg, black 180deg, black 270deg, transparent 270deg)",
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border border-accent/50 border-dashed"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 rounded-full border-t-2 border-primary"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
        </div>
      </div>

      {/* Vertical text, left */}
      <div
        className="absolute left-8 top-1/2 -translate-y-1/2 uppercase"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
      >
        <span className="opacity-70">FINATIX · FUTURE FINANCE PROTOCOL · v2.6</span>
      </div>
    </div>
  );
};

export default HeroHUD;
