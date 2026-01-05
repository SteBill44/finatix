import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const Cookies = () => {
  const lastUpdated = "January 5, 2026";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. What Are Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to the owners of the site. 
                Cookies allow us to recognize your browser and remember certain information about your preferences and interactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Finaptics uses cookies for various purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Essential cookies:</strong> Required for the platform to function properly, including authentication and security</li>
                <li><strong>Preference cookies:</strong> Remember your settings like theme preference (light/dark mode) and language</li>
                <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our platform</li>
                <li><strong>Performance cookies:</strong> Monitor and improve the performance of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    These cookies are necessary for the website to function and cannot be switched off.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Authentication tokens to keep you logged in</li>
                    <li>Session identifiers for security purposes</li>
                    <li>Load balancing to ensure optimal performance</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Functional Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    These cookies enable personalized features and functionality.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Theme preferences (light/dark mode)</li>
                    <li>Language settings</li>
                    <li>Course progress tracking</li>
                    <li>Quiz and exam state preservation</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    These cookies help us understand how visitors use our platform.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Page view statistics</li>
                    <li>Traffic sources and referrals</li>
                    <li>Popular courses and content engagement</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies are placed by third-party services that appear on our pages. We use trusted third-party 
                services for analytics and payment processing. These third parties may use cookies to track your 
                activity across different websites. We have no control over these cookies; please refer to the 
                respective third-party privacy policies for more information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Cookie Duration</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cookies can be either session cookies or persistent cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain on your device until they expire or you delete them (typically up to 1 year for preference cookies)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Browser settings:</strong> Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites</li>
                <li><strong>Private browsing:</strong> Use incognito or private browsing mode to prevent cookies from being stored</li>
                <li><strong>Third-party tools:</strong> Various browser extensions can help manage cookie preferences</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that disabling certain cookies may affect the functionality of our platform. Essential cookies 
                cannot be disabled as they are required for the platform to work correctly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Browser-Specific Instructions</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To manage cookies in your browser, follow these links for specific instructions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed 
                about our use of cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our use of cookies, please contact us at{" "}
                <a href="mailto:privacy@finaptics.com" className="text-primary hover:underline">
                  privacy@finaptics.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Cookies;
