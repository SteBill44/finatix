import { forwardRef } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

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

    return (
      <div
        ref={ref}
        className={`relative w-full aspect-[1.414/1] bg-white overflow-hidden ${className}`}
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

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
              fill="hsl(174, 72%, 40%)"
            />
          </svg>
        </div>

        {/* Elegant border frame */}
        <div className="absolute inset-6 border-2 border-primary/20 rounded-lg" />
        <div className="absolute inset-8 border border-primary/10 rounded-lg" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-12 py-16">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14">
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
              <span className="text-3xl font-bold text-gray-800 tracking-tight">
                Fin<span style={{ color: "hsl(174, 72%, 40%)" }}>atix</span>
              </span>
            </div>

            {/* Certificate title */}
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-2 text-primary/60 text-sm font-medium tracking-[0.3em] uppercase">
                <span className="w-8 h-px bg-primary/40" />
                Official Document
                <span className="w-8 h-px bg-primary/40" />
              </div>
              <h1
                className="text-4xl md:text-5xl font-light tracking-wide mt-2"
                style={{ color: "hsl(174, 72%, 35%)" }}
              >
                Certificate of Completion
              </h1>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center text-center max-w-2xl">
            <p className="text-gray-500 text-lg">This is to certify that</p>
            
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mt-4 mb-2">
              {studentName}
            </h2>
            
            <div className="w-64 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            
            <p className="text-gray-500 text-lg mt-6">has successfully completed the course</p>
            
            <h3
              className="text-2xl md:text-3xl font-semibold mt-4"
              style={{ color: "hsl(174, 72%, 35%)" }}
            >
              {courseName}
            </h3>
            
            <p className="text-gray-500 mt-6">
              and has demonstrated the knowledge and skills required for professional competency
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center w-full">
            {/* Achievement badge */}
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5" style={{ color: "hsl(174, 72%, 40%)" }} />
              <span className="text-sm font-medium text-gray-600">
                CIMA Professional Qualification
              </span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            {/* Signatures and date */}
            <div className="flex justify-between items-end w-full max-w-xl">
              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-gray-300 mb-2" />
                <span className="text-sm text-gray-500">Date of Issue</span>
                <span className="text-sm font-medium text-gray-700">{formattedDate}</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: "hsl(174, 72%, 40%)" }}
                >
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-400">Verified</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-gray-300 mb-2" />
                <span className="text-sm text-gray-500">Certificate No.</span>
                <span className="text-sm font-medium text-gray-700 font-mono">
                  {certificateNumber}
                </span>
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
