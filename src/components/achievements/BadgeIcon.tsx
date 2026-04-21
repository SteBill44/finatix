import React from "react";

interface BadgeIconProps {
  icon: string;
  isEarned: boolean;
  size?: number;
}

const O1 = "#f05007";
const O2 = "#f57b0c";
const L1 = "#6b7280";
const L2 = "#9ca3af";
const W = "#ffffff";
const LW = "#d1d5db";

type IconFn = (e: boolean) => React.ReactNode;

const icons: Record<string, IconFn> = {
  footprints: (e) => (
    <>
      <ellipse cx="16" cy="30" rx="5" ry="7" fill={e ? O1 : L1} opacity="0.9" />
      <ellipse cx="13" cy="22" rx="2.5" ry="3" fill={e ? O1 : L1} opacity="0.7" />
      <ellipse cx="17.5" cy="21" rx="2" ry="2.5" fill={e ? O1 : L1} opacity="0.7" />
      <ellipse cx="21.5" cy="22.5" rx="1.8" ry="2.2" fill={e ? O1 : L1} opacity="0.7" />
      <ellipse cx="32" cy="18" rx="5" ry="7" fill={e ? O2 : L2} opacity="0.9" />
      <ellipse cx="29" cy="10" rx="2.5" ry="3" fill={e ? O2 : L2} opacity="0.7" />
      <ellipse cx="33.5" cy="9" rx="2" ry="2.5" fill={e ? O2 : L2} opacity="0.7" />
      <ellipse cx="37.5" cy="10.5" rx="1.8" ry="2.2" fill={e ? O2 : L2} opacity="0.7" />
    </>
  ),

  zap: (e) => (
    <>
      {e && (
        <defs>
          <linearGradient id="zapG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor={O2} />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="27,6 12,26 22,26 21,42 36,22 26,22"
        fill={e ? "url(#zapG)" : L1}
      />
    </>
  ),

  "book-open": (e) => (
    <>
      <path d="M8 10 C8 10 14 9 24 13 L24 40 C14 36 8 37 8 37 Z" fill={e ? O1 : L1} />
      <path d="M40 10 C40 10 34 9 24 13 L24 40 C34 36 40 37 40 37 Z" fill={e ? O2 : L2} />
      <rect x="22.5" y="11" width="3" height="30" fill={e ? W : LW} opacity="0.35" rx="1.5" />
      <line x1="11" y1="20" x2="21" y2="22" stroke={e ? W : LW} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="11" y1="26" x2="21" y2="28" stroke={e ? W : LW} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="11" y1="32" x2="21" y2="34" stroke={e ? W : LW} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="27" y1="22" x2="37" y2="20" stroke={e ? W : LW} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="27" y1="28" x2="37" y2="26" stroke={e ? W : LW} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="27" y1="34" x2="37" y2="32" stroke={e ? W : LW} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </>
  ),

  "graduation-cap": (e) => (
    <>
      <polygon points="24,8 44,18 24,28 4,18" fill={e ? O1 : L1} />
      <polygon points="24,8 44,18 24,28 4,18" fill={e ? O2 : L2} opacity="0.4" />
      <rect x="36" y="18" width="3" height="14" rx="1.5" fill={e ? O1 : L1} opacity="0.85" />
      <circle cx="37.5" cy="33" r="3" fill={e ? O2 : L2} />
      <path d="M14 21 L14 34 Q14 40 24 40 Q34 40 34 34 L34 21" fill={e ? O2 : L2} opacity="0.85" />
    </>
  ),

  "circle-check": (e) => (
    <>
      <circle cx="24" cy="24" r="18" fill={e ? O1 : L1} opacity="0.12" />
      <circle cx="24" cy="24" r="18" stroke={e ? O1 : L1} strokeWidth="3" fill="none" />
      <polyline
        points="14,24 21,31 34,17"
        stroke={e ? O1 : L1}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  trophy: (e) => (
    <>
      <path d="M14 8 L34 8 L34 24 Q34 34 24 34 Q14 34 14 24 Z" fill={e ? O1 : L1} />
      <path d="M34 12 Q42 12 42 20 Q42 26 34 26" stroke={e ? O2 : L2} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M14 12 Q6 12 6 20 Q6 26 14 26" stroke={e ? O2 : L2} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="19" y="34" width="10" height="5" fill={e ? O2 : L2} rx="1" />
      <rect x="15" y="39" width="18" height="3" fill={e ? O1 : L1} rx="1.5" />
      <ellipse cx="20" cy="18" rx="3" ry="6" fill={W} opacity={e ? 0.18 : 0.08} />
    </>
  ),

  star: (e) => (
    <>
      <polygon
        points="24,5 29,18 43,18 32,27 36,41 24,32 12,41 16,27 5,18 19,18"
        fill={e ? O1 : L1}
        stroke={e ? O2 : L2}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon
        points="24,12 27.5,21 37,21 29.5,26.5 32,36 24,30.5 16,36 18.5,26.5 11,21 20.5,21"
        fill={e ? O2 : L2}
        opacity={e ? 0.5 : 0.3}
      />
    </>
  ),

  award: (e) => (
    <>
      <path d="M17 30 L13 44 L24 38 L35 44 L31 30" fill={e ? O1 : L1} opacity="0.75" />
      <circle cx="24" cy="22" r="15" fill={e ? O2 : L2} />
      <circle cx="24" cy="22" r="12" fill={e ? O1 : L1} />
      <polygon
        points="24,14 26.5,20 33,20 27.5,24 29.5,31 24,27 18.5,31 20.5,24 15,20 21.5,20"
        fill={e ? W : LW}
        opacity="0.9"
      />
    </>
  ),

  medal: (e) => (
    <>
      <rect x="15" y="4" width="18" height="6" rx="3" fill={e ? O1 : L1} />
      <path d="M18 10 L16 22 L24 18 L32 22 L30 10" fill={e ? O2 : L2} opacity="0.75" />
      <circle cx="24" cy="33" r="14" fill={e ? O2 : L2} />
      <circle cx="24" cy="33" r="11" fill={e ? O1 : L1} />
      <text
        x="24" y="39"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill={e ? W : LW}
        fontFamily="system-ui, sans-serif"
      >
        1
      </text>
    </>
  ),

  flame: (e) => (
    <>
      <path
        d="M24 6 C24 6 34 16 34 24 C34 28 31 31 28 30 C31 22 24 16 24 16 C24 16 19 24 21 31 C17 29 14 25 14 20 C14 12 24 6 24 6 Z"
        fill={e ? O1 : L1}
      />
      <path
        d="M24 16 C24 16 29 23 27 30 C25 32 21 31 21 31 C21 24 24 16 24 16 Z"
        fill={e ? "#fbbf24" : L2}
        opacity="0.85"
      />
      <ellipse cx="24" cy="35" rx="7" ry="4" fill={e ? O2 : L2} opacity="0.4" />
    </>
  ),

  fire: (e) => (
    <>
      <path
        d="M24 4 C24 4 36 16 36 26 C36 33 31 38 24 40 C17 38 12 33 12 26 C12 16 24 4 24 4 Z"
        fill={e ? O1 : L1}
      />
      <path
        d="M24 14 C24 14 32 22 32 28 C32 33 28.5 36 24 36 C19.5 36 16 33 16 28 C16 22 24 14 24 14 Z"
        fill={e ? "#fbbf24" : L2}
        opacity="0.8"
      />
      <path
        d="M24 22 C24 22 28 26 28 30 C28 32.5 26 34 24 34 C22 34 20 32.5 20 30 C20 26 24 22 24 22 Z"
        fill={e ? "#ef4444" : L2}
        opacity="0.9"
      />
    </>
  ),

  crown: (e) => (
    <>
      <path d="M6 36 L8 18 L18 28 L24 10 L30 28 L40 18 L42 36 Z" fill={e ? O1 : L1} />
      <rect x="6" y="35" width="36" height="5" fill={e ? O2 : L2} rx="1" />
      <circle cx="24" cy="18" r="3" fill={e ? "#fbbf24" : L2} />
      <circle cx="10" cy="26" r="2.5" fill={e ? "#fbbf24" : L2} opacity="0.85" />
      <circle cx="38" cy="26" r="2.5" fill={e ? "#fbbf24" : L2} opacity="0.85" />
    </>
  ),

  "message-circle": (e) => (
    <>
      <path
        d="M8 12 Q8 8 12 8 L36 8 Q40 8 40 12 L40 30 Q40 34 36 34 L28 34 L20 42 L20 34 L12 34 Q8 34 8 30 Z"
        fill={e ? O1 : L1}
      />
      <circle cx="17" cy="21" r="2.5" fill={e ? W : LW} />
      <circle cx="24" cy="21" r="2.5" fill={e ? W : LW} />
      <circle cx="31" cy="21" r="2.5" fill={e ? W : LW} />
    </>
  ),

  "thumbs-up": (e) => (
    <>
      <path
        d="M20 22 L16 10 Q16 6 20 6 Q24 6 24 10 L24 18 L34 18 Q38 18 38 22 L36 36 Q35 40 31 40 L16 40 Q12 40 12 36 L12 26 Q12 22 16 22 Z"
        fill={e ? O1 : L1}
      />
      <rect x="6" y="22" width="8" height="18" rx="3" fill={e ? O2 : L2} />
      <path
        d="M26 20 Q32 20 33 24"
        stroke={e ? W : LW}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />
    </>
  ),

  clock: (e) => {
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const deg = i * 30 - 90;
      const rad = (deg * Math.PI) / 180;
      const r1 = i % 3 === 0 ? 13 : 15.5;
      const r2 = 18;
      return (
        <line
          key={i}
          x1={24 + r1 * Math.cos(rad)}
          y1={24 + r1 * Math.sin(rad)}
          x2={24 + r2 * Math.cos(rad)}
          y2={24 + r2 * Math.sin(rad)}
          stroke={e ? O1 : L1}
          strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          strokeLinecap="round"
        />
      );
    });
    return (
      <>
        <circle cx="24" cy="24" r="18" fill={e ? O1 : L1} opacity="0.1" />
        <circle cx="24" cy="24" r="18" stroke={e ? O1 : L1} strokeWidth="3" fill="none" />
        {ticks}
        {/* minute hand pointing ~10 o'clock */}
        <line x1="24" y1="24" x2="16" y2="13" stroke={e ? O2 : L2} strokeWidth="3" strokeLinecap="round" />
        {/* hour hand pointing ~2 o'clock */}
        <line x1="24" y1="24" x2="33" y2="17" stroke={e ? O1 : L1} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.5" fill={e ? O2 : L2} />
      </>
    );
  },
};

const BadgeIcon = ({ icon, isEarned, size = 48 }: BadgeIconProps) => {
  const renderFn = icons[icon];
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {renderFn ? renderFn(isEarned) : (
        <>
          <circle cx="24" cy="24" r="18" fill={isEarned ? O1 : L1} opacity="0.25" />
          <circle cx="24" cy="24" r="18" stroke={isEarned ? O1 : L1} strokeWidth="2.5" fill="none" />
        </>
      )}
    </svg>
  );
};

export default BadgeIcon;
