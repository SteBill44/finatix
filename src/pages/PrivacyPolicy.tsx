import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Finaptics ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our learning management system and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Name and email address when you create an account</li>
              <li>CIMA registration details if provided</li>
              <li>Payment information for course purchases</li>
              <li>Profile information you choose to share</li>
            </ul>
            <h3 className="text-xl font-medium mb-2 mt-4">Usage Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Course progress and completion data</li>
              <li>Quiz and exam results</li>
              <li>Time spent on lessons and modules</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide and maintain our services</li>
              <li>To personalize your learning experience</li>
              <li>To process transactions and send related information</li>
              <li>To send you updates about your courses and progress</li>
              <li>To respond to your comments and questions</li>
              <li>To improve our platform and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Service providers who assist in operating our platform</li>
              <li>Professional bodies (e.g., CIMA) for certification verification</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@finaptics.com" className="text-primary hover:underline">
                privacy@finaptics.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
