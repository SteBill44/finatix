import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer } from "lucide-react";
import { toast } from "sonner";
import CertificateTemplate from "./CertificateTemplate";

interface CertificatePreviewProps {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: string | Date;
}

const CertificatePreview = ({
  studentName,
  courseName,
  certificateNumber,
  issuedAt,
}: CertificatePreviewProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${courseName} Certificate`,
          text: `I've completed the ${courseName} course on Finatix!`,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share certificate");
        }
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a simple canvas-based download
      const element = certificateRef.current;
      if (!element) return;

      // For now, trigger print as PDF download
      toast.info("Use 'Save as PDF' in print dialog to download");
      window.print();
    } catch (error) {
      toast.error("Failed to download certificate");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Certificate display */}
      <div className="rounded-xl overflow-hidden shadow-xl border border-border bg-white print:shadow-none print:border-none print:rounded-none">
        <CertificateTemplate
          ref={certificateRef}
          studentName={studentName}
          courseName={courseName}
          certificateNumber={certificateNumber}
          issuedAt={issuedAt}
        />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [data-certificate-container],
          [data-certificate-container] * {
            visibility: visible;
          }
          [data-certificate-container] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePreview;
