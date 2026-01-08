import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCostMonitoring, PRICING } from "@/hooks/useCostMonitoring";
import { useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { 
  DollarSign, Brain, Server, Database, HardDrive, 
  TrendingUp, TrendingDown, AlertCircle, Info
} from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  cost: { label: "Cost", color: "hsl(var(--primary))" },
  aiMessages: { label: "AI Messages", color: "hsl(var(--chart-1))" },
  edgeFunctions: { label: "Edge Functions", color: "hsl(var(--chart-2))" },
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function CostMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading, error } = useCostMonitoring(timeRange);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load cost monitoring data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return value < 0.01 && value > 0 ? "<$0.01" : `$${value.toFixed(2)}`;
  };

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Prepare pie chart data
  const pieData = data ? [
    { name: "AI Usage", value: data.currentMonth.ai.cost, count: data.currentMonth.ai.count },
    { name: "Edge Functions", value: data.currentMonth.edgeFunctions.cost, count: data.currentMonth.edgeFunctions.count },
    { name: "Database", value: data.currentMonth.database.cost, sizeMB: data.currentMonth.database.sizeMB },
    { name: "Storage", value: data.currentMonth.storage.cost, sizeMB: data.currentMonth.storage.sizeMB },
  ].filter(item => item.value > 0 || item.count > 0 || item.sizeMB > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cost Monitoring</h2>
          <p className="text-muted-foreground">Track usage and estimate monthly costs</p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Month Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(data?.currentMonth.total || 0)}
                </div>
                {data && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {data.currentMonth.total > data.previousMonth.total ? (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span>
                      {getChangePercent(data.currentMonth.total, data.previousMonth.total)}% vs last month
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Projected Monthly */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Monthly</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(data?.projectedMonthlyCost || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on current usage rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Messages</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.currentMonth.ai.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(data?.currentMonth.ai.cost || 0)} this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edge Functions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.currentMonth.edgeFunctions.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(data?.currentMonth.edgeFunctions.cost || 0)} ({((data?.currentMonth.edgeFunctions.count || 0) / 500000 * 100).toFixed(1)}% of free tier)
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Cost Trend</CardTitle>
            <CardDescription>Estimated costs over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.dailyUsage || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      className="text-xs"
                    />
                    <YAxis 
                      tickFormatter={(v) => `$${v.toFixed(2)}`}
                      className="text-xs"
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)"
                      name="Daily Cost"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Breakdown by service</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : pieData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Info className="h-8 w-8 mx-auto mb-2" />
                  <p>No billable usage yet</p>
                  <p className="text-sm">Within free tier limits</p>
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Activity</CardTitle>
          <CardDescription>AI messages and API calls over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.dailyUsage || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="aiMessages" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={false}
                    name="AI Messages"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="edgeFunctionCalls" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={false}
                    name="API Calls"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Infrastructure Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-muted-foreground">
                        ~{data?.currentMonth.database.sizeMB.toFixed(1)} MB used
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(data?.currentMonth.database.cost || 0)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {(data?.currentMonth.database.sizeMB || 0) < 500 ? "Free tier" : "Pro"}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Storage</p>
                      <p className="text-sm text-muted-foreground">
                        ~{data?.currentMonth.storage.sizeMB.toFixed(1)} MB used
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(data?.currentMonth.storage.cost || 0)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {(data?.currentMonth.storage.sizeMB || 0) < 1024 ? "Free tier" : "Billed"}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Pricing Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Messages</span>
                <span>~${PRICING.AI_COST_PER_MESSAGE}/message</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edge Functions</span>
                <span>500K free, then ${PRICING.EDGE_FUNCTION_COST_PER_MILLION}/million</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database</span>
                <span>500MB free, then ${PRICING.DATABASE_COST_PER_GB}/GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage</span>
                <span>1GB free, then ${PRICING.STORAGE_COST_PER_GB}/GB</span>
              </div>
              <hr className="my-2" />
              <p className="text-xs text-muted-foreground">
                * Estimates based on typical usage. Actual costs may vary.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scaling Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Scaling Projections</CardTitle>
          <CardDescription>Estimated costs at different user scales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { users: 100, aiMultiplier: 25, label: "100 Users" },
              { users: 500, aiMultiplier: 125, label: "500 Users" },
              { users: 1000, aiMultiplier: 250, label: "1,000 Users" },
              { users: 5000, aiMultiplier: 1250, label: "5,000 Users" },
            ].map((tier) => {
              const monthlyAIMessages = tier.aiMultiplier * 30; // ~30 messages per user per month average
              const estimatedCost = calculateAICost(monthlyAIMessages) + 
                (tier.users > 500 ? 25 : 0) + // Pro tier for 500+ users
                (tier.users > 1000 ? 25 : 0); // Additional compute for 1000+
              
              return (
                <div key={tier.label} className="p-4 border rounded-lg text-center">
                  <p className="font-medium">{tier.label}</p>
                  <p className="text-2xl font-bold my-2">~${estimatedCost.toFixed(0)}/mo</p>
                  <p className="text-xs text-muted-foreground">
                    ~{monthlyAIMessages.toLocaleString()} AI msgs/mo
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function exported for use elsewhere
function calculateAICost(messageCount: number): number {
  return messageCount * PRICING.AI_COST_PER_MESSAGE;
}
