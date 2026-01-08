import { useEffect, useState, useRef } from "react";
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

export const useActiveUsers = () => {
  const { user } = useAuth();
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [activeVisitorCount, setActiveVisitorCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Channel for tracking authenticated users only
    const usersChannel = supabase.channel('authenticated-users-presence');
    
    // Channel for tracking all visitors (including anonymous)
    const visitorsChannel = supabase.channel('all-visitors-presence');

    usersChannel
      .on('presence', { event: 'sync' }, () => {
        const state = usersChannel.presenceState();
        const count = Object.keys(state).length;
        setActiveUserCount(count);
      })
      .subscribe();

    visitorsChannel
      .on('presence', { event: 'sync' }, () => {
        const state = visitorsChannel.presenceState();
        const count = Object.keys(state).length;
        setActiveVisitorCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    return () => {
      usersChannel.unsubscribe();
      visitorsChannel.unsubscribe();
    };
  }, []);

  return { activeUserCount, activeVisitorCount, isConnected };
};

// Hook for tracking user presence globally (to be used in Layout)
export const useTrackUserPresence = () => {
  const { user } = useAuth();
  const visitorIdRef = useRef<string>(getVisitorId());

  useEffect(() => {
    const visitorId = visitorIdRef.current;
    
    // Always track in visitors channel (all site visitors)
    const visitorsChannel = supabase.channel('all-visitors-presence', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    visitorsChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await visitorsChannel.track({
          visitorId,
          isAuthenticated: !!user?.id,
          onlineAt: new Date().toISOString(),
        });
      }
    });

    // If authenticated, also track in users channel
    let usersChannel: ReturnType<typeof supabase.channel> | null = null;
    
    if (user?.id) {
      usersChannel = supabase.channel('authenticated-users-presence', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      usersChannel.subscribe(async (status) => {
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
    };
  }, [user?.id]);
};
