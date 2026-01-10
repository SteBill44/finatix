import Layout from "@/components/layout/Layout";

const CookiePolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
            
            <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
            <p className="text-muted-foreground mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management. You cannot opt out of these cookies.
            </p>

            <h3 className="text-xl font-medium mb-2">Performance Cookies</h3>
            <p className="text-muted-foreground mb-4">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the way our website works.
            </p>

            <h3 className="text-xl font-medium mb-2">Functional Cookies</h3>
            <p className="text-muted-foreground mb-4">
              These cookies enable the website to provide enhanced functionality and personalization, such as remembering your preferences, theme settings, and login details.
            </p>

            <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
            <p className="text-muted-foreground">
              We use analytics cookies to track information about how the website is used so that we can make improvements. We may also use analytics cookies to test new features and how users interact with them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Cookie Name</th>
                    <th className="border border-border p-3 text-left">Purpose</th>
                    <th className="border border-border p-3 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-border p-3">sb-auth-token</td>
                    <td className="border border-border p-3">Authentication session</td>
                    <td className="border border-border p-3">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">theme</td>
                    <td className="border border-border p-3">Theme preference (light/dark)</td>
                    <td className="border border-border p-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">cookie-consent</td>
                    <td className="border border-border p-3">Cookie consent status</td>
                    <td className="border border-border p-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
            <p className="text-muted-foreground">
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, if you block or delete cookies, some features of our website may not function properly.
            </p>
            <p className="text-muted-foreground mt-4">
              To learn more about how to manage cookies in your browser:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies, please contact us at{" "}
              <a href="mailto:privacy@finatix.com" className="text-primary hover:underline">
                privacy@finatix.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default CookiePolicy;
