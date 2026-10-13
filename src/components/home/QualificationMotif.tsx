import { CIMA_LEVELS } from "@/lib/cimaLevels";

/**
 * Original vector motif: four rails stepping up towards Strategic.
 * Monochrome geometry with one brand-orange line. Decorative; the labels are
 * repeated as real links in the levels section below.
 */
const QualificationMotif = () => {
  const steps = CIMA_LEVELS.map((lv, i) => ({ ...lv, x: 20 + i * 140, y: 300 - i * 80 }));
  const path = steps
    .map((s, i) => (i === 0 ? `M ${s.x} ${s.y}` : `L ${s.x} ${steps[i - 1].y} L ${s.x} ${s.y}`))
    .join(" ") + ` L 580 ${steps[3].y}`;

  return (
    <svg viewBox="0 0 600 360" role="img" aria-label="CIMA levels: Certificate, Operational, Management, Strategic" className="h-auto w-full text-foreground">
      {/* rails */}
      {steps.map((s) => (
        <line key={`r-${s.id}`} x1={s.x} y1={s.y} x2={580} y2={s.y} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      ))}
      {steps.map((s) => (
        <line key={`v-${s.id}`} x1={s.x} y1={20} x2={s.x} y2={340} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
      ))}
      {/* the journey line */}
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinejoin="miter" />
      {steps.map((s, i) => (
        <g key={s.id}>
          <rect x={s.x - 5} y={s.y - 5} width="10" height="10" fill={i === 3 ? "hsl(var(--primary))" : "hsl(var(--background))"} stroke="hsl(var(--primary))" strokeWidth="2" />
          <text x={s.x + 14} y={s.y - 30} fill="currentColor" fillOpacity="0.45" fontSize="12" fontFamily="ui-monospace, monospace">
            0{i + 1}
          </text>
          <text x={s.x + 14} y={s.y - 12} fill="currentColor" fontSize="15" fontWeight="600">
            {s.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default QualificationMotif;
