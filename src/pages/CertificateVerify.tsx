import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Loader2, Award, Calendar, User, BookOpen, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";
import CertificateDownloadButton from "@/components/certificate/CertificateDownloadButton";
import { useCertificatePDF } from "@/hooks/useCertificatePDF";

interface CertificateData {
  certificate_number: string;
  issued_at: string;
  course: {
    title: string;
  };
  profile: {
    full_name: string;
  } | null;
}

const CertificateDownloadDialog = ({
  certificate,
  open,
  onOpenChange,
}: {
  certificate: CertificateData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const cleanName = certificate.course.title.replace(/^[A-Z]+\d+\s*[-–]\s*/i, "").replace(/\s+/g, "-");
  const { certificateRef, isGenerating, downloadPDF, downloadImage } = useCertificatePDF({
    fileName: `${cleanName}-certificate.pdf`,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Download Certificate
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border">
            <CertificateTemplate
              ref={certificateRef}
              studentName={certificate.profile?.full_name || "Certificate Holder"}
              courseName={certificate.course.title}
              certificateNumber={certificate.certificate_number}
              issuedAt={certificate.issued_at}
            />
          </div>
          <div className="flex justify-end">
            <CertificateDownloadButton
              onDownloadPDF={downloadPDF}
              onDownloadImage={downloadImage}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CertificateVerify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const certificateNumber = searchParams.get("cert");
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(certificateNumber || "");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const verifyCertificate = async (certNumber: string) => {
    if (!certNumber.trim()) {
      setError("Please enter a certificate number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select(`
          certificate_number,
          issued_at,
          user_id,
          course:courses(title)
        `)
        .eq("certificate_number", certNumber.trim())
        .single();

      if (fetchError || !data) {
        setError("Certificate not found or invalid");
        setIsLoading(false);
        return;
      }

      // Fetch profile separately
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", data.user_id)
        .single();

      setCertificate({
        ...data,
        course: data.course as { title: string },
        profile: profileData,
      });
    } catch (err) {
      setError("Failed to verify certificate");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (certificateNumber) {
      verifyCertificate(certificateNumber);
    }
  }, [certificateNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ cert: searchInput.trim() });
    }
  };

  // Clean course name (remove code prefix)
  const cleanCourseName = (name: string) => {
    return name.replace(/^[A-Z]+\d+\s*[-–]\s*/i, "");
  };

  return (
    <Layout>
      <div className="container max-w-2xl pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Certificate Verification
          </h1>
          <p className="text-muted-foreground">
            Verify the authenticity of a Finatix certificate
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter certificate number (e.g., FTX-R3K8X2-M7YN4P)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 font-mono"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
            </Button>
          </div>
        </form>

        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying certificate...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Verification Failed
              </h2>
              <p className="text-muted-foreground text-center">{error}</p>
              {certificateNumber && (
                <p className="text-sm text-muted-foreground mt-4 font-mono">
                  Certificate: {certificateNumber}
                </p>
              )}
            </CardContent>
          </Card>
        ) : certificate ? (
          <Card className="border-primary/30">
            <CardHeader className="text-center border-b">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl text-primary">
                Certificate Verified
              </CardTitle>
              <Badge variant="outline" className="mx-auto mt-2 text-primary border-primary">
                Authentic
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Issued to</p>
                  <p className="font-medium text-foreground">
                    {certificate.profile?.full_name || "Certificate Holder"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium text-foreground">
                    {cleanCourseName(certificate.course.title)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Issue</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(certificate.issued_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Certificate Number</p>
                  <p className="font-medium text-foreground font-mono">
                    {certificate.certificate_number}
                  </p>
                </div>
              </div>

              {/* Download button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => setShowDownloadDialog(true)}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Download Dialog */}
      {certificate && (
        <CertificateDownloadDialog
          certificate={certificate}
          open={showDownloadDialog}
          onOpenChange={setShowDownloadDialog}
        />
      )}
    </Layout>
  );
};

export default CertificateVerify;
