import { forwardRef, useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PdfViewerProps {
  sourceUrl: string;
  title: string;
}

const PdfViewer = forwardRef<HTMLDivElement, PdfViewerProps>(({ sourceUrl, title }, ref) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setHasError(false);
      setPdfBlobUrl(null);

      try {
        const response = await fetch(sourceUrl, {
          method: "GET",
          mode: "cors",
          credentials: "omit",
        });

        if (!response.ok) {
          throw new Error(`Failed to load PDF (${response.status})`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (isActive) {
          setPdfBlobUrl(objectUrl);
        }
      } catch (error) {
        console.error("PDF load failed:", error);
        if (isActive) {
          setHasError(true);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [sourceUrl]);

  const openPdf = () => {
    window.open(pdfBlobUrl ?? sourceUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading PDF…</p>
        </div>
      </Card>
    );
  }

  if (hasError || !pdfBlobUrl) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">Inline PDF preview unavailable</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your browser may be blocking embedded PDFs. Open it in a new tab instead.
            </p>
          </div>
          <Button onClick={openPdf} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open PDF
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div ref={ref} className="rounded-lg overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground truncate">{title}</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2" onClick={openPdf}>
          <ExternalLink className="w-4 h-4" />
          Open
        </Button>
      </div>

      <div className="h-[80vh] overflow-hidden">
        <object
          data={pdfBlobUrl}
          type="application/pdf"
          className="w-full h-full"
          aria-label={`${title} PDF preview`}
        >
          <iframe
            src={pdfBlobUrl}
            className="w-full h-full border-none"
            title={`${title} - Study Material`}
          />
        </object>
      </div>
    </div>
  );
});

PdfViewer.displayName = "PdfViewer";

export default PdfViewer;

