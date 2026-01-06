import { motion } from "framer-motion";
import { format } from "date-fns";
import { Award, Download, ExternalLink, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CertificateCardProps {
  certificate: {
    id: string;
    certificate_number: string;
    issued_at: string;
    pdf_url: string | null;
    courses?: {
      title: string;
      slug: string;
      image_url: string | null;
    } | null;
  };
  onViewDetails?: () => void;
}

const CertificateCard = ({ certificate, onViewDetails }: CertificateCardProps) => {
  const handleDownload = () => {
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, "_blank");
    } else {
      toast.info("PDF certificate will be available soon");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify/${certificate.certificate_number}`;
    const shareText = `I earned a certificate for completing ${certificate.courses?.title || "a course"} on Finaptics!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Finaptics Certificate",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Certificate link copied to clipboard!");
    }
  };

  const handleLinkedIn = () => {
    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.set("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.set("name", certificate.courses?.title || "Course Completion");
    linkedInUrl.searchParams.set("organizationName", "Finaptics");
    linkedInUrl.searchParams.set("issueYear", format(new Date(certificate.issued_at), "yyyy"));
    linkedInUrl.searchParams.set("issueMonth", format(new Date(certificate.issued_at), "M"));
    linkedInUrl.searchParams.set("certId", certificate.certificate_number);
    linkedInUrl.searchParams.set("certUrl", `${window.location.origin}/verify/${certificate.certificate_number}`);
    
    window.open(linkedInUrl.toString(), "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden group">
        {/* Certificate Preview */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="absolute top-4 right-4 opacity-10">
            <Award className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <Award className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">
              {certificate.courses?.title || "Course Certificate"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Issued {format(new Date(certificate.issued_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Certificate Number */}
          <div className="mb-4 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground">Certificate Number</p>
            <p className="font-mono text-sm">{certificate.certificate_number}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleLinkedIn}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Add to LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CertificateCard;
