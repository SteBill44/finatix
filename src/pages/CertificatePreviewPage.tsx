import Layout from "@/components/layout/Layout";
import CertificatePreview from "@/components/certificate/CertificatePreview";

const CertificatePreviewPage = () => {
  // Demo data for preview
  const demoData = {
    studentName: "Your Name Here",
    courseName: "BA1 - Fundamentals of Business Economics",
    certificateNumber: "FTX-R3K8X2-M7YN4P",
    issuedAt: new Date(),
  };

  return (
    <Layout>
      <div className="container max-w-4xl pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Certificate Preview</h1>
          <p className="text-muted-foreground">
            This is how your completion certificate will look
          </p>
        </div>

        <CertificatePreview
          studentName={demoData.studentName}
          courseName={demoData.courseName}
          certificateNumber={demoData.certificateNumber}
          issuedAt={demoData.issuedAt}
        />
      </div>
    </Layout>
  );
};

export default CertificatePreviewPage;
