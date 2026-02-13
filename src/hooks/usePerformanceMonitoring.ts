import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { from, tracked } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryConfigs } from "@/lib/queryConfig";

interface PerformanceEntry {
  eventType: "page_load" | "api_call" | "error" | "interaction";
  path: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

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
      await from("performance_logs").insert(entries);
    } catch (error) {
      console.error("Failed to log performance:", error);
      pendingLogs.current = [...logsToSend, ...pendingLogs.current];
    }
  }, [user?.id]);

  const logPerformance = useCallback(
    (entry: PerformanceEntry) => {
      pendingLogs.current.push(entry);
      if (flushTimeout.current) clearTimeout(flushTimeout.current);
      if (pendingLogs.current.length >= 10) {
        flushLogs();
      } else {
        flushTimeout.current = setTimeout(flushLogs, 2000);
      }
    },
    [flushLogs]
  );

  const logPageLoad = useCallback(
    (path: string) => {
      logPerformance({ eventType: "page_load", path, durationMs: Math.round(performance.now()) });
    },
    [logPerformance]
  );

  const logApiCall = useCallback(
    (endpoint: string, durationMs: number, success: boolean) => {
      logPerformance({ eventType: "api_call", path: endpoint, durationMs: Math.round(durationMs), metadata: { success } });
    },
    [logPerformance]
  );

  const logError = useCallback(
    (path: string, error: string) => {
      logPerformance({ eventType: "error", path, metadata: { error } });
    },
    [logPerformance]
  );

  useEffect(() => {
    return () => {
      if (flushTimeout.current) clearTimeout(flushTimeout.current);
      flushLogs();
    };
  }, [flushLogs]);

  return { logPageLoad, logApiCall, logError, logPerformance };
};

function getMilliseconds(timeRange: "1h" | "24h" | "7d"): number {
  switch (timeRange) {
    case "1h": return 60 * 60 * 1000;
    case "24h": return 24 * 60 * 60 * 1000;
    case "7d": return 7 * 24 * 60 * 60 * 1000;
  }
}

export const usePerformanceMetrics = (timeRange: "1h" | "24h" | "7d" = "24h") => {
  return useQuery({
    queryKey: ["performance_metrics", timeRange],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - getMilliseconds(timeRange)).toISOString();

      // Fetch real data from multiple tables in parallel
      const [perfLogsResult, enrollmentsResult, quizAttemptsResult, lessonProgressResult, profilesResult] = await Promise.all([
        supabase
          .from("performance_logs")
          .select("*")
          .gte("created_at", cutoff)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("enrollments")
          .select("id, enrolled_at, user_id")
          .gte("enrolled_at", cutoff),
        supabase
          .from("quiz_attempts")
          .select("id, attempted_at, user_id, score, max_score")
          .gte("attempted_at", cutoff),
        supabase
          .from("lesson_progress")
          .select("id, completed_at, user_id")
          .eq("completed", true)
          .gte("completed_at", cutoff),
        supabase
          .from("profiles")
          .select("user_id, created_at"),
      ]);

      const logs = perfLogsResult.data || [];
      const enrollments = enrollmentsResult.data || [];
      const quizAttempts = quizAttemptsResult.data || [];
      const lessonProgress = lessonProgressResult.data || [];
      const allProfiles = profilesResult.data || [];

      // Calculate real activity counts
      const totalActivity = enrollments.length + quizAttempts.length + lessonProgress.length + logs.length;

      // API performance from actual logs
      const apiCalls = logs.filter((l) => l.event_type === "api_call");
      const errors = logs.filter((l) => l.event_type === "error");

      const avgApiTime = apiCalls.length > 0
        ? Math.round(apiCalls.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / apiCalls.length) 
        : 0;

      // Unique active users from real activity data
      const activeUserIds = new Set<string>();
      enrollments.forEach((e) => { if (e.user_id) activeUserIds.add(e.user_id); });
      quizAttempts.forEach((q) => { if (q.user_id) activeUserIds.add(q.user_id); });
      lessonProgress.forEach((l) => { if (l.user_id) activeUserIds.add(l.user_id); });
      logs.forEach((l) => { if (l.user_id) activeUserIds.add(l.user_id); });

      // Path metrics for slowest endpoints
      const pathMetrics: Record<string, { count: number; totalTime: number }> = {};
      apiCalls.forEach((log) => {
        const path = log.path || "unknown";
        if (!pathMetrics[path]) pathMetrics[path] = { count: 0, totalTime: 0 };
        pathMetrics[path].count++;
        pathMetrics[path].totalTime += log.duration_ms || 0;
      });

      const slowestEndpoints = Object.entries(pathMetrics)
        .map(([path, data]) => ({ path, avgTime: Math.round(data.totalTime / data.count), count: data.count }))
        .sort((a, b) => b.avgTime - a.avgTime).slice(0, 10);

      const errorRate = totalActivity > 0 
        ? Math.round((errors.length / totalActivity) * 100 * 100) / 100 
        : 0;

      // Build chart data from real activity (enrollments + quiz attempts + lesson completions)
      const hourlyData: Record<string, { requests: number; errors: number }> = {};
      
      const addToHourly = (dateStr: string, isError = false) => {
        const hour = new Date(dateStr).toISOString().slice(0, 13);
        if (!hourlyData[hour]) hourlyData[hour] = { requests: 0, errors: 0 };
        hourlyData[hour].requests++;
        if (isError) hourlyData[hour].errors++;
      };

      enrollments.forEach((e) => addToHourly(e.enrolled_at));
      quizAttempts.forEach((q) => addToHourly(q.attempted_at));
      lessonProgress.forEach((l) => { if (l.completed_at) addToHourly(l.completed_at); });
      logs.forEach((log) => {
        addToHourly(log.created_at, log.event_type === "error");
      });

      const chartData = Object.entries(hourlyData)
        .map(([hour, data]) => ({ 
          hour: new Date(hour + ":00:00Z").toLocaleTimeString([], { hour: "2-digit" }), 
          requests: data.requests, 
          errors: data.errors 
        }))
        .sort((a, b) => a.hour.localeCompare(b.hour))
        .slice(-24);

      // New users in period
      const newUsersInPeriod = allProfiles.filter(
        (p) => new Date(p.created_at) >= new Date(cutoff)
      ).length;

      return { 
        totalRequests: totalActivity, 
        avgApiTime, 
        avgPageLoad: 0,
        errorRate, 
        errorCount: errors.length, 
        uniqueUsers: activeUserIds.size,
        totalRegisteredUsers: allProfiles.length,
        newUsers: newUsersInPeriod,
        enrollmentCount: enrollments.length,
        quizAttemptCount: quizAttempts.length,
        lessonCompletionCount: lessonProgress.length,
        slowestEndpoints, 
        chartData 
      };
    },
    ...queryConfigs.performance,
  });
};
