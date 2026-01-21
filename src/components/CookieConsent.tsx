import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-card border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                We use cookies.{" "}
                <Link to="/cookies" className="text-primary hover:underline">
                  Learn more
                </Link>
              </p>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecline}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
