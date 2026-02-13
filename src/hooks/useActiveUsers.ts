import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Generate a stable visitor ID for anonymous tracking
const getVisitorId = () => {
  let visitorId = sessionStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = 'visitor-' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Shared state so multiple consumers see the same counts
let sharedState = {
  activeUserCount: 0,
  activeVisitorCount: 0,
  isConnected: false,
};
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

// Subscribe to shared presence state (read-only)
export const useActiveUsers = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    activeUserCount: sharedState.activeUserCount,
    activeVisitorCount: sharedState.activeVisitorCount,
    isConnected: sharedState.isConnected,
  };
};

// Hook for tracking user presence globally (used in Layout)
// This is the ONLY place that creates presence channels
export const useTrackUserPresence = () => {
  const { user } = useAuth();
  const visitorIdRef = useRef<string>(getVisitorId());

  useEffect(() => {
    const visitorId = visitorIdRef.current;

    // All-visitors channel
    const visitorsChannel = supabase.channel('all-visitors-presence', {
      config: { presence: { key: visitorId } },
    });

    visitorsChannel
      .on('presence', { event: 'sync' }, () => {
        const state = visitorsChannel.presenceState();
        sharedState.activeVisitorCount = Object.keys(state).length;
        notifyListeners();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          sharedState.isConnected = true;
          notifyListeners();
          await visitorsChannel.track({
            visitorId,
            isAuthenticated: !!user?.id,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    // Authenticated users channel
    let usersChannel: ReturnType<typeof supabase.channel> | null = null;

    if (user?.id) {
      usersChannel = supabase.channel('authenticated-users-presence', {
        config: { presence: { key: user.id } },
      });

      usersChannel
        .on('presence', { event: 'sync' }, () => {
          const state = usersChannel!.presenceState();
          sharedState.activeUserCount = Object.keys(state).length;
          notifyListeners();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await usersChannel!.track({
              userId: user.id,
              onlineAt: new Date().toISOString(),
            });
          }
        });
    }

    return () => {
      visitorsChannel.unsubscribe();
      usersChannel?.unsubscribe();
      sharedState.isConnected = false;
      notifyListeners();
    };
  }, [user?.id]);
};
