import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileImage, FileText, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface CertificateDownloadButtonProps {
  onDownloadPDF: () => Promise<void>;
  onDownloadImage: () => Promise<void>;
  isGenerating: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const CertificateDownloadButton = ({
  onDownloadPDF,
  onDownloadImage,
  isGenerating,
  variant = "default",
  size = "default",
  className = "",
}: CertificateDownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (type: "pdf" | "image") => {
    setIsDownloading(true);
    try {
      if (type === "pdf") {
        await onDownloadPDF();
        toast.success("PDF downloaded successfully!");
      } else {
        await onDownloadImage();
        toast.success("Image downloaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to download certificate");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const loading = isGenerating || isDownloading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("pdf")} disabled={loading}>
          <FileText className="w-4 h-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("image")} disabled={loading}>
          <FileImage className="w-4 h-4 mr-2" />
          Download as Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CertificateDownloadButton;
