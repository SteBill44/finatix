import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const Terms = () => {
  const lastUpdated = "January 5, 2026";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Finaptics, you agree to be bound by these Terms and Conditions and all applicable laws 
                and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this 
                platform. The materials contained on this platform are protected by applicable copyright and trademark law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Permission is granted to temporarily access the materials (information or software) on Finaptics for personal, 
                non-commercial educational use only. This is the grant of a license, not a transfer of title, and under this 
                license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of our platform, you must register for an account. You agree to provide accurate, 
                current, and complete information during the registration process and to update such information to keep it 
                accurate, current, and complete. You are responsible for safeguarding your password and for all activities 
                that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Course Content and Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All course materials, including but not limited to videos, text, graphics, logos, images, audio clips, 
                digital downloads, and data compilations are the property of Finaptics or its content suppliers and are 
                protected by international copyright laws. The compilation of all content on this platform is the exclusive 
                property of Finaptics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Payment and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By purchasing courses on our platform, you agree to our payment terms:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>All prices are displayed in your local currency where available</li>
                <li>Payment is required before accessing paid course content</li>
                <li>Refund requests may be considered within 14 days of purchase if less than 20% of the course has been completed</li>
                <li>Promotional pricing and discounts are subject to change without notice</li>
                <li>Subscription plans renew automatically unless cancelled before the renewal date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use the platform to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Submit false or misleading information</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Interfere with or disrupt the platform or servers</li>
                <li>Engage in any form of cheating during quizzes or exams</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems to access the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Certificates</h2>
              <p className="text-muted-foreground leading-relaxed">
                Upon successful completion of a course, you may receive a certificate of completion. These certificates 
                represent your achievement within our platform and are not official CIMA certifications. Certificates are 
                for personal use and professional development purposes. Falsifying completion records or certificates is 
                strictly prohibited and may result in account termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials on Finaptics are provided on an 'as is' basis. Finaptics makes no warranties, expressed or 
                implied, and hereby disclaims and negates all other warranties including, without limitation, implied 
                warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of 
                intellectual property or other violation of rights. While we strive to prepare students for CIMA examinations, 
                we do not guarantee exam success.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Limitations</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Finaptics or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use the materials on Finaptics, even if Finaptics or a Finaptics authorized representative has been 
                notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Account Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your account and access to the platform immediately, without 
                prior notice or liability, for any reason whatsoever, including without limitation if you breach these 
                Terms and Conditions. Upon termination, your right to use the platform will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with applicable laws, and you 
                irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Finaptics reserves the right to revise these Terms and Conditions at any time without notice. By using this 
                platform, you are agreeing to be bound by the then-current version of these Terms and Conditions. We will 
                notify registered users of significant changes via email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at{" "}
                <a href="mailto:legal@finaptics.com" className="text-primary hover:underline">
                  legal@finaptics.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Terms;
