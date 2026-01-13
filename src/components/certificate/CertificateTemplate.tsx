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
        <div className="absolute top-0 left-0 w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>

        {/* Elegant border frame - responsive inset */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 lg:inset-6 border-2 border-primary/20 rounded-lg" />
        <div className="absolute inset-3 sm:inset-4 md:inset-5 lg:inset-8 border border-primary/10 rounded-lg" />

        {/* Content - responsive padding */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-2 py-2 sm:px-4 sm:py-3 md:px-8 md:py-6 lg:px-12 lg:py-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
            {/* Logo */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="relative w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 lg:w-12 lg:h-12">
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
              <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">
                Fin<span style={{ color: "hsl(174, 72%, 40%)" }}>atix</span>
              </span>
            </div>

            {/* Certificate title */}
            <div className="flex flex-col items-center mt-0.5 sm:mt-1 md:mt-2">
              <div className="hidden sm:flex items-center gap-1 md:gap-2 text-primary/60 text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase">
                <span className="w-3 sm:w-4 md:w-6 lg:w-8 h-px bg-primary/40" />
                Official Document
                <span className="w-3 sm:w-4 md:w-6 lg:w-8 h-px bg-primary/40" />
              </div>
              <h1
                className="text-sm sm:text-lg md:text-2xl lg:text-4xl font-light tracking-wide mt-0.5 sm:mt-1"
                style={{ color: "hsl(174, 72%, 35%)" }}
              >
                Certificate of Completion
              </h1>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center text-center max-w-2xl flex-1 justify-center py-1 sm:py-2 md:py-4">
            <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm lg:text-base">This is to certify that</p>
            
            <h2 className="text-sm sm:text-base md:text-xl lg:text-3xl font-semibold text-gray-800 mt-0.5 sm:mt-1 md:mt-2 mb-0.5 sm:mb-1">
              {studentName}
            </h2>
            
            <div className="w-20 sm:w-32 md:w-48 lg:w-64 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            
            <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2 md:mt-3">has successfully completed the course</p>
            
            <h3
              className="text-xs sm:text-sm md:text-lg lg:text-2xl font-semibold mt-0.5 sm:mt-1 md:mt-2 px-1 sm:px-2"
              style={{ color: "hsl(174, 72%, 35%)" }}
            >
              {cleanCourseName}
            </h3>
            
            <p className="text-gray-500 text-[8px] sm:text-[10px] md:text-xs lg:text-sm mt-1 sm:mt-2 md:mt-3 px-2 sm:px-4 hidden md:block">
              and has demonstrated the knowledge and skills required for professional competency
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center w-full">
            {/* Achievement badge */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2 md:mb-3">
              <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" style={{ color: "hsl(174, 72%, 40%)" }} />
              <span className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-medium text-gray-600">
                Professional Certification
              </span>
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-500" />
            </div>

            {/* Signatures, QR code, and date */}
            <div className="flex justify-between items-center w-full max-w-2xl px-1 sm:px-2 md:px-4">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">{formattedDate}</span>
                <div className="w-12 sm:w-16 md:w-24 lg:w-32 border-b border-gray-300" />
                <span className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-gray-500 mt-0.5 sm:mt-1">Date of Issue</span>
              </div>

              <div className="flex flex-col items-center mx-1 sm:mx-2 md:mx-4 lg:mx-8">
                <div className="p-0.5 sm:p-1 md:p-1.5 bg-white rounded shadow-sm border border-gray-200 mb-0.5 sm:mb-1">
                  <QRCode
                    value={verificationUrl}
                    size={24}
                    level="L"
                    fgColor="hsl(174, 72%, 35%)"
                    className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                  />
                </div>
                <div className="w-8 sm:w-12 md:w-16 lg:w-20 border-b border-gray-300" />
                <span className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500 mt-0.5 sm:mt-1">Verify</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                <span className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs font-medium text-gray-700 font-mono mb-0.5 sm:mb-1 truncate max-w-full">
                  {certificateNumber}
                </span>
                <div className="w-12 sm:w-16 md:w-24 lg:w-32 border-b border-gray-300" />
                <span className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-gray-500 mt-0.5 sm:mt-1">Certificate No.</span>
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
