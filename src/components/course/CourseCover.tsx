import { useId } from "react";

type CoverLevel = "certificate" | "operational" | "management" | "strategic";

interface CourseCoverProps {
  level: string;
  code: string;
  className?: string;
}

/**
 * CourseCover — generated cover art for course tiles.
 *
 * Every course in a level shares one theme: a colour palette matched to the
 * level's identity plus a finance motif set inside the brand hexagon. Courses
 * are told apart by their code (BA1, E2, SCS…). Pure inline SVG — crisp at any
 * size, theme-agnostic (self-contained dark gradient), no hosted assets.
 */

interface Theme {
  stops: [string, string, string];
  accent: string;
  label: string;
  motif: "foundation" | "flow" | "analytics" | "summit";
}

const THEMES: Record<CoverLevel, Theme> = {
  certificate: {
    stops: ["#14b8a6", "#0f766e", "#134e4a"],
    accent: "#5eead4",
    label: "Certificate",
    motif: "foundation",
  },
  operational: {
    stops: ["#f97316", "#c2410c", "#7c2d12"],
    accent: "#fdba74",
    label: "Operational",
    motif: "flow",
  },
  management: {
    stops: ["#8b5cf6", "#6d28d9", "#4c1d95"],
    accent: "#c4b5fd",
    label: "Management",
    motif: "analytics",
  },
  strategic: {
    stops: ["#f43f5e", "#be123c", "#881337"],
    accent: "#fda4af",
    label: "Strategic",
    motif: "summit",
  },
};

// Brand hexagon (flat top/bottom) in a 0..100 box, positioned bottom-right
const HEX_PATH = "M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z";

const Motif = ({ kind, color }: { kind: Theme["motif"]; color: string }) => {
  // All motifs drawn around origin (0,0), ~40 units wide, accent-coloured
  switch (kind) {
    case "foundation": // stacked blocks — building the fundamentals
      return (
        <g fill={color}>
          <rect x={-20} y={6} width={40} height={9} rx={2} />
          <rect x={-15} y={-6} width={30} height={9} rx={2} />
          <rect x={-9} y={-18} width={18} height={9} rx={2} />
        </g>
      );
    case "flow": // interlocking flow / process rings
      return (
        <g fill="none" stroke={color} strokeWidth={4}>
          <circle cx={-11} cy={0} r={11} />
          <circle cx={11} cy={0} r={11} />
          <path d="M-11 -18 v-6 M11 18 v6" strokeLinecap="round" />
        </g>
      );
    case "analytics": // rising bar chart
      return (
        <g fill={color}>
          <rect x={-21} y={0} width={9} height={14} rx={1.5} />
          <rect x={-8} y={-8} width={9} height={22} rx={1.5} />
          <rect x={5} y={-18} width={9} height={32} rx={1.5} />
        </g>
      );
    case "summit": // peaks — leading from the top
      return (
        <g fill={color}>
          <path d="M-22 16 L-6 -14 L10 16 Z" />
          <path d="M2 16 L16 -8 L28 16 Z" opacity={0.7} />
        </g>
      );
  }
};

const CourseCover = ({ level, code, className }: CourseCoverProps) => {
  const uid = useId().replace(/:/g, "");
  const theme = THEMES[(level as CoverLevel)] ?? THEMES.operational;
  const [c0, c1, c2] = theme.stops;

  const gradId = `cc-grad-${uid}`;
  const glowId = `cc-glow-${uid}`;
  const hexPatId = `cc-hex-${uid}`;
  const grainId = `cc-grain-${uid}`;

  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${theme.label} level course ${code}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c0} />
          <stop offset="55%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>

        <radialGradient id={glowId} cx="22%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Faint hexagon-dot texture */}
        <pattern id={hexPatId} width="24" height="21" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path d="M12 2 L20 6.5 L20 15.5 L12 20 L4 15.5 L4 6.5 Z" fill="none" stroke={theme.accent} strokeOpacity="0.12" strokeWidth="1" />
        </pattern>

        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* Base gradient */}
      <rect width="320" height="180" fill={`url(#${gradId})`} />
      {/* Hex texture */}
      <rect width="320" height="180" fill={`url(#${hexPatId})`} />
      {/* Top-left sheen */}
      <rect width="320" height="180" fill={`url(#${glowId})`} />

      {/* Large brand hexagon, cropped off the bottom-right, holding the motif */}
      <g transform="translate(188,58) scale(1.55)">
        <path d={HEX_PATH} fill={theme.accent} fillOpacity="0.08" stroke={theme.accent} strokeOpacity="0.35" strokeWidth="1.6" />
      </g>
      <g transform="translate(258,138)" opacity="0.9">
        <g opacity="0.85">
          <Motif kind={theme.motif} color={theme.accent} />
        </g>
      </g>

      {/* Level label */}
      <text
        x="20"
        y="34"
        fill="#ffffff"
        fillOpacity="0.85"
        fontSize="12"
        fontWeight="600"
        letterSpacing="2.5"
        style={{ textTransform: "uppercase", fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {theme.label}
      </text>

      {/* Course code */}
      <text
        x="20"
        y="150"
        fill="#ffffff"
        fontSize="58"
        fontWeight="800"
        letterSpacing="-1"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {code}
      </text>

      {/* Film grain */}
      <rect width="320" height="180" filter={`url(#${grainId})`} opacity="0.06" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
};

export default CourseCover;
