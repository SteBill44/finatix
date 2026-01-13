import { forwardRef } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import QRCode from "react-qr-code";

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: string | Date;
  className?: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseName, certificateNumber, issuedAt, className = "" }, ref) => {
    const formattedDate = format(
      typeof issuedAt === "string" ? new Date(issuedAt) : issuedAt,
      "MMMM d, yyyy"
    );

    // Remove course code prefix (e.g., "BA1 - ", "P1 - ", etc.)
    const cleanCourseName = courseName.replace(/^[A-Z]+\d+\s*[-–]\s*/i, "");

    // Generate verification URL
    const verificationUrl = `${window.location.origin}/verify?cert=${encodeURIComponent(certificateNumber)}`;

    return (
      <div
        ref={ref}
        className={`relative w-full aspect-[1.6/1] bg-white overflow-hidden ${className}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexPattern" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                <path
                  d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
                  fill="none"
                  stroke="hsl(174, 72%, 40%)"
                  strokeWidth="1"
                />
                <path
                  d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34"
                  fill="none"
                  stroke="hsl(174, 72%, 40%)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexPattern)" />
          </svg>
        </div>

        {/* Decorative corner accents - responsive sizing */}
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>

        {/* Elegant border frame - responsive inset */}
        <div className="absolute inset-2 sm:inset-4 md:inset-6 border-2 border-primary/20 rounded-lg" />
        <div className="absolute inset-3 sm:inset-5 md:inset-8 border border-primary/10 rounded-lg" />

        {/* Content - responsive padding */}
        <div className="relative z-10 flex min-h-0 flex-col items-center justify-between h-full px-2 py-2 sm:px-6 sm:py-5 md:px-10 md:py-7 lg:px-12 lg:py-10">
          {/* Header */}
          <div className="flex shrink-0 flex-col items-center gap-1 sm:gap-2 md:gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <defs>
                    <linearGradient id="certLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(174, 72%, 40%)" />
                      <stop offset="100%" stopColor="hsl(174, 72%, 35%)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                    fill="url(#certLogoGradient)"
                  />
                  <g fill="white">
                    <rect x="32" y="28" width="12" height="44" />
                    <rect x="44" y="28" width="26" height="10" />
                    <rect x="44" y="46" width="18" height="10" />
                  </g>
                </svg>
              </div>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                Fin<span style={{ color: "hsl(174, 72%, 40%)" }}>atix</span>
              </span>
            </div>

            {/* Certificate title */}
            <div className="flex flex-col items-center mt-1 sm:mt-2 md:mt-2">
              <div className="hidden sm:flex items-center gap-1 sm:gap-2 text-primary/60 text-[9px] sm:text-xs md:text-sm font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                <span className="w-4 sm:w-6 md:w-8 h-px bg-primary/40" />
                Official Document
                <span className="w-4 sm:w-6 md:w-8 h-px bg-primary/40" />
              </div>
              <h1
                className="text-[clamp(1.25rem,3.2vw,3.25rem)] font-light leading-tight tracking-wide mt-1 sm:mt-2 md:mt-2"
                style={{ color: "hsl(174, 72%, 35%)" }}
              >
                Certificate of Completion
              </h1>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center text-center max-w-2xl flex-1 min-h-0 justify-center overflow-hidden py-2 sm:py-3 md:py-3">
            <p className="text-gray-500 text-[clamp(0.75rem,1.6vw,1.125rem)]">This is to certify that</p>

            <h2 className="text-[clamp(1.1rem,3.2vw,2.5rem)] font-semibold leading-tight text-gray-800 mt-1 sm:mt-2 md:mt-3 mb-1 sm:mb-2">
              {studentName}
            </h2>

            <div className="w-28 sm:w-40 md:w-56 lg:w-64 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <p className="text-gray-500 text-[clamp(0.75rem,1.6vw,1.125rem)] mt-2 sm:mt-3 md:mt-4">has successfully completed the course</p>

            <h3
              className="text-[clamp(0.95rem,2.6vw,2rem)] font-semibold leading-tight mt-1 sm:mt-2 md:mt-3 px-2"
              style={{ color: "hsl(174, 72%, 35%)" }}
            >
              {cleanCourseName}
            </h3>

            <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 md:mt-4 px-4 hidden sm:block">
              and has demonstrated the knowledge and skills required for professional competency
            </p>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col items-center w-full">
            {/* Achievement badge */}
            <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4 md:mb-4">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: "hsl(174, 72%, 40%)" }} />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600">
                Professional Certification
              </span>
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500" />
            </div>

            {/* Signatures, QR code, and date */}
            <div className="flex justify-between items-center w-full max-w-2xl px-2 sm:px-4">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-2">{formattedDate}</span>
                <div className="w-16 sm:w-24 md:w-32 lg:w-40 border-b border-gray-300" />
                <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-1 sm:mt-2">Date of Issue</span>
              </div>

              <div className="flex flex-col items-center mx-2 sm:mx-4 md:mx-8">
                <div className="p-1 sm:p-1.5 md:p-2 bg-white rounded-lg shadow-sm border border-gray-200 mb-1 sm:mb-2">
                  <QRCode
                    value={verificationUrl}
                    size={32}
                    level="M"
                    fgColor="hsl(174, 72%, 35%)"
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14"
                  />
                </div>
                <div className="w-12 sm:w-16 md:w-20 border-b border-gray-300" />
                <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-1 sm:mt-2">Verify</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-gray-700 font-mono mb-1 sm:mb-2 truncate max-w-full">
                  {certificateNumber}
                </span>
                <div className="w-16 sm:w-24 md:w-32 lg:w-40 border-b border-gray-300" />
                <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-1 sm:mt-2">Certificate No.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, hsl(174, 72%, 95%, 0.3) 100%)",
          }}
        />
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;
