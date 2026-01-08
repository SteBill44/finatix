import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VisitorSnapshot {
  id: string;
  visitor_count: number;
  user_count: number;
  recorded_at: string;
}

// Record a snapshot of current visitor counts
export const useRecordVisitorSnapshot = (
  visitorCount: number,
  userCount: number,
  isConnected: boolean
) => {
  const lastRecordedRef = useRef<number>(0);

  useEffect(() => {
    // Only record if connected and counts are valid
    if (!isConnected || visitorCount === 0) return;

    const now = Date.now();
    // Record at most once every 5 minutes
    if (now - lastRecordedRef.current < 5 * 60 * 1000) return;

    const recordSnapshot = async () => {
      const { error } = await supabase
        .from("visitor_snapshots")
        .insert({
          visitor_count: visitorCount,
          user_count: userCount,
        });

      if (!error) {
        lastRecordedRef.current = now;
        console.log("Recorded visitor snapshot:", { visitorCount, userCount });
      }
    };

    recordSnapshot();
  }, [visitorCount, userCount, isConnected]);
};

// Fetch historical visitor trends
export const useVisitorTrends = (timeRange: "1h" | "24h" | "7d") => {
  return useQuery({
    queryKey: ["visitor-trends", timeRange],
    queryFn: async () => {
      const now = new Date();
      let startTime: Date;

      switch (timeRange) {
        case "1h":
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await supabase
        .from("visitor_snapshots")
        .select("*")
        .gte("recorded_at", startTime.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      // Group data by hour for the chart
      const groupedData = groupByInterval(data || [], timeRange);
      return groupedData;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Group snapshots by time interval for chart display
function groupByInterval(
  snapshots: VisitorSnapshot[],
  timeRange: "1h" | "24h" | "7d"
) {
  if (snapshots.length === 0) return [];

  const intervalMs = timeRange === "1h" 
    ? 5 * 60 * 1000  // 5 minutes for 1h
    : timeRange === "24h"
    ? 60 * 60 * 1000  // 1 hour for 24h
    : 4 * 60 * 60 * 1000; // 4 hours for 7d

  const grouped: Map<number, { visitors: number[]; users: number[] }> = new Map();

  snapshots.forEach((snapshot) => {
    const time = new Date(snapshot.recorded_at).getTime();
    const bucket = Math.floor(time / intervalMs) * intervalMs;

    if (!grouped.has(bucket)) {
      grouped.set(bucket, { visitors: [], users: [] });
    }
    grouped.get(bucket)!.visitors.push(snapshot.visitor_count);
    grouped.get(bucket)!.users.push(snapshot.user_count);
  });

  return Array.from(grouped.entries())
    .map(([time, counts]) => ({
      time: new Date(time).toISOString(),
      label: formatTimeLabel(new Date(time), timeRange),
      visitors: Math.round(
        counts.visitors.reduce((a, b) => a + b, 0) / counts.visitors.length
      ),
      users: Math.round(
        counts.users.reduce((a, b) => a + b, 0) / counts.users.length
      ),
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

function formatTimeLabel(date: Date, timeRange: "1h" | "24h" | "7d"): string {
  if (timeRange === "1h") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (timeRange === "24h") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    return date.toLocaleDateString([], { weekday: "short", hour: "2-digit" });
  }
}
