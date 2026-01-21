import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { hasConsented, acceptAll, declineAll } = useCookieConsent();

  useEffect(() => {
    if (!hasConsented) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [hasConsented]);

  const handleAccept = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleDecline = () => {
    declineAll();
    setShowBanner(false);
  };

  const handleClose = () => {
    // Just hide banner temporarily - will show again on next page load
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="relative bg-card border border-border rounded-lg shadow-lg p-4 md:p-6">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1 pr-8 md:pr-0">
                  <h3 className="font-semibold text-lg mb-1">We value your privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience and analyze our traffic. 
                    Declining will block non-essential cookies and analytics.{" "}
                    <Link to="/cookies" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 md:flex-none"
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 md:flex-none"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
