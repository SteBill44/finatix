import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface QueuedRequest {
  id: string;
  fn: () => Promise<unknown>;
  timestamp: number;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const queuedRequests = useRef<QueuedRequest[]>([]);
  const { toast } = useToast();

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast({
          title: "Back online",
          description: `Connection restored. ${queuedRequests.current.length > 0 ? "Retrying queued requests..." : ""}`,
        });
        // Process queued requests
        processQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast({
        title: "You're offline",
        description: "Changes will be saved when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline, toast]);

  // Process queued requests when back online
  const processQueue = useCallback(async () => {
    const requests = [...queuedRequests.current];
    queuedRequests.current = [];

    for (const request of requests) {
      try {
        await request.fn();
      } catch (error) {
        console.error("Failed to process queued request:", error);
      }
    }

    if (requests.length > 0) {
      toast({
        title: "Requests processed",
        description: `${requests.length} queued request(s) have been processed.`,
      });
    }
  }, [toast]);

  // Queue a request for later retry
  const queueRequest = useCallback((fn: () => Promise<unknown>) => {
    const id = crypto.randomUUID();
    queuedRequests.current.push({
      id,
      fn,
      timestamp: Date.now(),
    });
    return id;
  }, []);

  // Remove a request from the queue
  const removeFromQueue = useCallback((id: string) => {
    queuedRequests.current = queuedRequests.current.filter(
      (req) => req.id !== id
    );
  }, []);

  // Get queue length
  const getQueueLength = useCallback(() => {
    return queuedRequests.current.length;
  }, []);

  return {
    isOnline,
    wasOffline,
    queueRequest,
    removeFromQueue,
    getQueueLength,
    processQueue,
  };
}

// Singleton instance for global network status
let globalNetworkStatus: ReturnType<typeof useNetworkStatus> | null = null;

export function getNetworkStatus() {
  return globalNetworkStatus;
}

export function setGlobalNetworkStatus(
  status: ReturnType<typeof useNetworkStatus>
) {
  globalNetworkStatus = status;
}
