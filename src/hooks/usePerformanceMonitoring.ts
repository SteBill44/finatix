import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryConfigs } from "@/lib/queryConfig";

interface PerformanceEntry {
  eventType: "page_load" | "api_call" | "error" | "interaction";
  path: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

// Track performance metrics
export const usePerformanceMonitoring = () => {
  const { user } = useAuth();
  const pendingLogs = useRef<PerformanceEntry[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout | null>(null);

  const flushLogs = useCallback(async () => {
    if (pendingLogs.current.length === 0) return;

    const logsToSend = [...pendingLogs.current];
    pendingLogs.current = [];

    try {
      const entries = logsToSend.map((log) => ({
        event_type: log.eventType,
        path: log.path,
        duration_ms: log.durationMs,
        user_id: user?.id || null,
        metadata: (log.metadata || {}) as Record<string, string | number | boolean | null>,
      }));

      await supabase.from("performance_logs").insert(entries);
    } catch (error) {
      console.error("Failed to log performance:", error);
      // Re-add failed logs
      pendingLogs.current = [...logsToSend, ...pendingLogs.current];
    }
  }, [user?.id]);

  const logPerformance = useCallback(
    (entry: PerformanceEntry) => {
      pendingLogs.current.push(entry);

      // Debounce flush - send after 2 seconds of inactivity or when we have 10+ logs
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
      }

      if (pendingLogs.current.length >= 10) {
        flushLogs();
      } else {
        flushTimeout.current = setTimeout(flushLogs, 2000);
      }
    },
    [flushLogs]
  );

  // Log page load time
  const logPageLoad = useCallback(
    (path: string) => {
      const loadTime = performance.now();
      logPerformance({
        eventType: "page_load",
        path,
        durationMs: Math.round(loadTime),
      });
    },
    [logPerformance]
  );

  // Log API call duration
  const logApiCall = useCallback(
    (endpoint: string, durationMs: number, success: boolean) => {
      logPerformance({
        eventType: "api_call",
        path: endpoint,
        durationMs: Math.round(durationMs),
        metadata: { success },
      });
    },
    [logPerformance]
  );

  // Log errors
  const logError = useCallback(
    (path: string, error: string) => {
      logPerformance({
        eventType: "error",
        path,
        metadata: { error },
      });
    },
    [logPerformance]
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
      }
      flushLogs();
    };
  }, [flushLogs]);

  return { logPageLoad, logApiCall, logError, logPerformance };
};

// Admin hook to fetch performance metrics
export const usePerformanceMetrics = (timeRange: "1h" | "24h" | "7d" = "24h") => {
  const timeRangeMap = {
    "1h": "1 hour",
    "24h": "24 hours",
    "7d": "7 days",
  };

  return useQuery({
    queryKey: ["performance_metrics", timeRange],
    queryFn: async () => {
      const interval = timeRangeMap[timeRange];
      
      // Get aggregated metrics
      const { data: logs, error } = await supabase
        .from("performance_logs")
        .select("*")
        .gte("created_at", new Date(Date.now() - getMilliseconds(timeRange)).toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Calculate metrics
      const apiCalls = logs?.filter((l) => l.event_type === "api_call") || [];
      const pageLoads = logs?.filter((l) => l.event_type === "page_load") || [];
      const errors = logs?.filter((l) => l.event_type === "error") || [];

      const avgApiTime =
        apiCalls.length > 0
          ? Math.round(
              apiCalls.reduce((sum, l) => sum + (l.duration_ms || 0), 0) /
                apiCalls.length
            )
          : 0;

      const avgPageLoad =
        pageLoads.length > 0
          ? Math.round(
              pageLoads.reduce((sum, l) => sum + (l.duration_ms || 0), 0) /
                pageLoads.length
            )
          : 0;

      // Group by path for slowest endpoints
      const pathMetrics: Record<string, { count: number; totalTime: number }> = {};
      apiCalls.forEach((log) => {
        const path = log.path || "unknown";
        if (!pathMetrics[path]) {
          pathMetrics[path] = { count: 0, totalTime: 0 };
        }
        pathMetrics[path].count++;
        pathMetrics[path].totalTime += log.duration_ms || 0;
      });

      const slowestEndpoints = Object.entries(pathMetrics)
        .map(([path, data]) => ({
          path,
          avgTime: Math.round(data.totalTime / data.count),
          count: data.count,
        }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 10);

      // Error rate
      const errorRate =
        logs && logs.length > 0
          ? Math.round((errors.length / logs.length) * 100 * 100) / 100
          : 0;

      // Unique users
      const uniqueUsers = new Set(logs?.map((l) => l.user_id).filter(Boolean)).size;

      // Hourly breakdown for chart
      const hourlyData: Record<string, { requests: number; errors: number }> = {};
      logs?.forEach((log) => {
        const hour = new Date(log.created_at).toISOString().slice(0, 13);
        if (!hourlyData[hour]) {
          hourlyData[hour] = { requests: 0, errors: 0 };
        }
        hourlyData[hour].requests++;
        if (log.event_type === "error") {
          hourlyData[hour].errors++;
        }
      });

      const chartData = Object.entries(hourlyData)
        .map(([hour, data]) => ({
          hour: new Date(hour).toLocaleTimeString([], { hour: "2-digit" }),
          requests: data.requests,
          errors: data.errors,
        }))
        .slice(-24);

      return {
        totalRequests: logs?.length || 0,
        avgApiTime,
        avgPageLoad,
        errorRate,
        errorCount: errors.length,
        uniqueUsers,
        slowestEndpoints,
        chartData,
      };
    },
    ...queryConfigs.performance,
  });
};

function getMilliseconds(timeRange: "1h" | "24h" | "7d"): number {
  switch (timeRange) {
    case "1h":
      return 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
  }
}
