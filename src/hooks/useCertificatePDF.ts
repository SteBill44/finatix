import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface UseCertificatePDFOptions {
  fileName?: string;
}

export const useCertificatePDF = (options: UseCertificatePDFOptions = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!certificateRef.current) {
      console.error("Certificate ref not found");
      return;
    }

    setIsGenerating(true);

    try {
      // Wait for fonts and images to load
      await document.fonts.ready;
      
      const element = certificateRef.current;
      
      // Create high-quality canvas
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // Calculate PDF dimensions (landscape A4)
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add the certificate image
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Center the image on the page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate positioning to center
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // Generate filename
      const fileName = options.fileName || `certificate-${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!certificateRef.current) {
      console.error("Certificate ref not found");
      return;
    }

    setIsGenerating(true);

    try {
      await document.fonts.ready;
      
      const element = certificateRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = options.fileName?.replace(".pdf", ".png") || `certificate-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    certificateRef,
    isGenerating,
    downloadPDF,
    downloadImage,
  };
};
