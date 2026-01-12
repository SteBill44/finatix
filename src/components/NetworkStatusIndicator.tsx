import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, CloudOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkStatus, setGlobalNetworkStatus } from "@/hooks/useNetworkStatus";

export function NetworkStatusIndicator() {
  const networkStatus = useNetworkStatus();
  const { isOnline, getQueueLength } = networkStatus;
  const [showIndicator, setShowIndicator] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Set global network status for use in other parts of the app
  useEffect(() => {
    setGlobalNetworkStatus(networkStatus);
  }, [networkStatus]);

  // Update queue count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueCount(getQueueLength());
    }, 1000);
    return () => clearInterval(interval);
  }, [getQueueLength]);

  // Show indicator when offline or when coming back online
  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      // Hide after a delay when back online
      const timeout = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg backdrop-blur-sm",
            "flex items-center gap-2 text-sm font-medium",
            isOnline
              ? "bg-green-500/90 text-white"
              : "bg-destructive/90 text-destructive-foreground"
          )}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Back online</span>
              {queueCount > 0 && (
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Syncing...
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You're offline</span>
              {queueCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {queueCount} pending
                </span>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Persistent offline banner for bottom of screen
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm lg:bottom-0 bottom-16">
      <div className="flex items-center justify-center gap-2">
        <CloudOff className="h-4 w-4" />
        <span>No internet connection. Some features may be unavailable.</span>
      </div>
    </div>
  );
}
