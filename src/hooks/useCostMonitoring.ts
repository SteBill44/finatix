import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Pricing constants (based on Lovable Cloud/Supabase pricing)
const PRICING = {
  AI_COST_PER_MESSAGE: 0.002, // ~$0.002 per message for gemini-2.5-flash
  EDGE_FUNCTION_FREE_TIER: 500000, // 500K free invocations
  EDGE_FUNCTION_COST_PER_MILLION: 2, // $2 per million after free tier
  DATABASE_FREE_TIER_MB: 500, // 500MB free
  DATABASE_COST_PER_GB: 0.125, // $0.125/GB/month after free tier
  STORAGE_FREE_TIER_GB: 1, // 1GB free
  STORAGE_COST_PER_GB: 0.021, // $0.021/GB/month after free tier
};

export interface CostBreakdown {
  ai: { count: number; cost: number };
  edgeFunctions: { count: number; cost: number };
  database: { sizeMB: number; cost: number };
  storage: { sizeMB: number; cost: number };
  total: number;
}

export interface DailyUsage {
  date: string;
  aiMessages: number;
  edgeFunctionCalls: number;
  cost: number;
}

export interface CostMonitoringData {
  currentMonth: CostBreakdown;
  previousMonth: CostBreakdown;
  dailyUsage: DailyUsage[];
  projectedMonthlyCost: number;
  isLoading: boolean;
  error: Error | null;
}

// Calculate AI cost
export function calculateAICost(messageCount: number): number {
  return messageCount * PRICING.AI_COST_PER_MESSAGE;
}

// Calculate edge function cost
export function calculateEdgeFunctionCost(invocations: number): number {
  if (invocations <= PRICING.EDGE_FUNCTION_FREE_TIER) return 0;
  const billableInvocations = invocations - PRICING.EDGE_FUNCTION_FREE_TIER;
  return (billableInvocations / 1000000) * PRICING.EDGE_FUNCTION_COST_PER_MILLION;
}

// Calculate database cost
export function calculateDatabaseCost(sizeMB: number): number {
  if (sizeMB <= PRICING.DATABASE_FREE_TIER_MB) return 0;
  const billableGB = (sizeMB - PRICING.DATABASE_FREE_TIER_MB) / 1024;
  return billableGB * PRICING.DATABASE_COST_PER_GB;
}

// Calculate storage cost
export function calculateStorageCost(sizeMB: number): number {
  const sizeGB = sizeMB / 1024;
  if (sizeGB <= PRICING.STORAGE_FREE_TIER_GB) return 0;
  const billableGB = sizeGB - PRICING.STORAGE_FREE_TIER_GB;
  return billableGB * PRICING.STORAGE_COST_PER_GB;
}

export function useCostMonitoring(timeRange: "7d" | "30d" | "90d" = "30d") {
  const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Get current month start
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  // Get previous month dates
  const previousMonthStart = new Date(currentMonthStart);
  previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
  const previousMonthEnd = new Date(currentMonthStart);
  previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);

  return useQuery({
    queryKey: ["cost-monitoring", timeRange],
    queryFn: async (): Promise<CostMonitoringData> => {
      // Fetch AI messages count for current month
      const { count: currentAICount } = await supabase
        .from("ai_chat_messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", currentMonthStart.toISOString());

      // Fetch AI messages count for previous month
      const { count: previousAICount } = await supabase
        .from("ai_chat_messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", previousMonthStart.toISOString())
        .lt("created_at", currentMonthStart.toISOString());

      // Fetch edge function calls from performance logs
      const { count: currentEdgeCalls } = await supabase
        .from("performance_logs")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "api_call")
        .gte("created_at", currentMonthStart.toISOString());

      const { count: previousEdgeCalls } = await supabase
        .from("performance_logs")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "api_call")
        .gte("created_at", previousMonthStart.toISOString())
        .lt("created_at", currentMonthStart.toISOString());

      // Database size: count all user-facing tables and use per-table byte estimates
      // based on average row sizes measured from the schema (much more accurate than 1KB/row)
      const DB_TABLE_ESTIMATES: Array<{ table: string; bytesPerRow: number }> = [
        { table: "profiles", bytesPerRow: 512 },
        { table: "courses", bytesPerRow: 2048 },
        { table: "lessons", bytesPerRow: 4096 },
        { table: "enrollments", bytesPerRow: 256 },
        { table: "quiz_questions", bytesPerRow: 1024 },
        { table: "quiz_attempts", bytesPerRow: 512 },
        { table: "lesson_progress", bytesPerRow: 128 },
        { table: "lesson_resources", bytesPerRow: 512 },
        { table: "ai_chat_messages", bytesPerRow: 1024 },
        { table: "badges", bytesPerRow: 256 },
        { table: "user_badges", bytesPerRow: 128 },
      ];
      let estimatedDBBytes = 0;
      for (const { table, bytesPerRow } of DB_TABLE_ESTIMATES) {
        const { count } = await supabase
          .from(table as any)
          .select("*", { count: "exact", head: true });
        estimatedDBBytes += (count || 0) * bytesPerRow;
      }
      const estimatedDBSizeMB = estimatedDBBytes / (1024 * 1024);

      // Storage size: query the real Supabase Storage API by listing all objects
      // in every bucket and summing their sizes.
      let estimatedStorageBytes = 0;
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets) {
          for (const bucket of buckets) {
            // Supabase storage list returns up to 100 items; paginate if needed
            let offset = 0;
            const limit = 100;
            while (true) {
              const { data: files } = await supabase.storage
                .from(bucket.name)
                .list("", { limit, offset });
              if (!files || files.length === 0) break;
              for (const file of files) {
                estimatedStorageBytes += file.metadata?.size ?? 0;
              }
              if (files.length < limit) break;
              offset += limit;
            }
          }
        }
      } catch {
        // Storage API may not be accessible in all environments; fall back to 0
      }
      const estimatedStorageMB = estimatedStorageBytes / (1024 * 1024);

      // Fetch daily usage for trend chart
      const { data: dailyAIMessages } = await supabase
        .from("ai_chat_messages")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      const { data: dailyEdgeCalls } = await supabase
        .from("performance_logs")
        .select("created_at")
        .eq("event_type", "api_call")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Aggregate by day
      const dailyMap = new Map<string, { aiMessages: number; edgeFunctionCalls: number }>();
      
      // Initialize all days in range
      for (let i = 0; i < daysBack; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dailyMap.set(dateStr, { aiMessages: 0, edgeFunctionCalls: 0 });
      }

      // Count AI messages by day
      dailyAIMessages?.forEach((msg) => {
        const dateStr = new Date(msg.created_at).toISOString().split("T")[0];
        const existing = dailyMap.get(dateStr);
        if (existing) {
          existing.aiMessages++;
        }
      });

      // Count edge function calls by day
      dailyEdgeCalls?.forEach((call) => {
        const dateStr = new Date(call.created_at).toISOString().split("T")[0];
        const existing = dailyMap.get(dateStr);
        if (existing) {
          existing.edgeFunctionCalls++;
        }
      });

      // Convert to array and calculate daily costs
      const dailyUsage: DailyUsage[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          aiMessages: data.aiMessages,
          edgeFunctionCalls: data.edgeFunctionCalls,
          cost: calculateAICost(data.aiMessages) + calculateEdgeFunctionCost(data.edgeFunctionCalls),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate cost breakdowns
      const currentMonth: CostBreakdown = {
        ai: { count: currentAICount || 0, cost: calculateAICost(currentAICount || 0) },
        edgeFunctions: { count: currentEdgeCalls || 0, cost: calculateEdgeFunctionCost(currentEdgeCalls || 0) },
        database: { sizeMB: estimatedDBSizeMB, cost: calculateDatabaseCost(estimatedDBSizeMB) },
        storage: { sizeMB: estimatedStorageMB, cost: calculateStorageCost(estimatedStorageMB) },
        total: 0,
      };
      currentMonth.total = currentMonth.ai.cost + currentMonth.edgeFunctions.cost + 
                           currentMonth.database.cost + currentMonth.storage.cost;

      const previousMonth: CostBreakdown = {
        ai: { count: previousAICount || 0, cost: calculateAICost(previousAICount || 0) },
        edgeFunctions: { count: previousEdgeCalls || 0, cost: calculateEdgeFunctionCost(previousEdgeCalls || 0) },
        database: { sizeMB: estimatedDBSizeMB, cost: calculateDatabaseCost(estimatedDBSizeMB) },
        storage: { sizeMB: estimatedStorageMB, cost: calculateStorageCost(estimatedStorageMB) },
        total: 0,
      };
      previousMonth.total = previousMonth.ai.cost + previousMonth.edgeFunctions.cost + 
                            previousMonth.database.cost + previousMonth.storage.cost;

      // Project monthly cost based on current usage rate
      const today = new Date();
      const dayOfMonth = today.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const projectedMonthlyCost = (currentMonth.total / dayOfMonth) * daysInMonth;

      return {
        currentMonth,
        previousMonth,
        dailyUsage,
        projectedMonthlyCost,
        isLoading: false,
        error: null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export { PRICING };
