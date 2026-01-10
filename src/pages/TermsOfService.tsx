import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

const TermsOfService = () => {
  return (
    <Layout>
      <SEO
        title="Terms of Service"
        description="Finaptics Terms of Service - Read the terms and conditions governing your use of our CIMA study platform and course materials."
        noindex={false}
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Finaptics ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Finaptics provides online educational content and resources for CIMA (Chartered Institute of Management Accountants) exam preparation, including but not limited to video lessons, practice questions, mock exams, and study materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You must be at least 16 years old to create an account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Course Access and Licensing</h2>
            <p className="text-muted-foreground">
              Upon purchase, you are granted a limited, non-exclusive, non-transferable license to access the course content for personal, non-commercial educational purposes. This license does not include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>The right to resell or redistribute course content</li>
              <li>The right to share account access with others</li>
              <li>The right to copy, modify, or create derivative works</li>
              <li>The right to use content for commercial purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Payment and Refunds</h2>
            <h3 className="text-xl font-medium mb-2">Payment</h3>
            <p className="text-muted-foreground mb-4">
              All prices are displayed in GBP and are inclusive of applicable taxes. Payment must be made in full before accessing paid content.
            </p>
            <h3 className="text-xl font-medium mb-2">Refund Policy</h3>
            <p className="text-muted-foreground">
              We offer a 14-day money-back guarantee from the date of purchase. To request a refund, contact our support team. Refunds are processed within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on Finaptics, including text, graphics, logos, videos, and software, is the property of Finaptics or its content suppliers and is protected by intellectual property laws. Unauthorized use may violate copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. User Conduct</h2>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Share your account credentials with others</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or defamatory content</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses. We do not guarantee exam success or any specific outcomes from using our materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Finaptics shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modifications to Service</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice. We may also update course content periodically to reflect changes in exam syllabi or best practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may revise these Terms at any time by updating this page. Your continued use of the Service after changes constitutes acceptance of the new Terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@finaptics.com" className="text-primary hover:underline">
                legal@finaptics.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
