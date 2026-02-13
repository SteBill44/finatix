import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMonitoring";
import { useActiveUsers } from "@/hooks/useActiveUsers";
import { useVisitorTrends, useRecordVisitorSnapshot } from "@/hooks/useVisitorTrends";
import { Activity, AlertTriangle, Clock, TrendingUp, Users, Radio } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, LineChart, Line, Legend } from "recharts";

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--primary))",
  },
  errors: {
    label: "Errors",
    color: "hsl(var(--destructive))",
  },
  visitors: {
    label: "All Visitors",
    color: "hsl(var(--primary))",
  },
  users: {
    label: "Logged In",
    color: "hsl(142 76% 36%)", // green
  },
};

export const PerformanceMonitoring = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h");
  const { data: metrics, isLoading, error } = usePerformanceMetrics(timeRange);
  const { activeUserCount, activeVisitorCount, isConnected } = useActiveUsers();
  const { data: visitorTrends, isLoading: trendsLoading } = useVisitorTrends(timeRange);

  // Record snapshots when admin views the page
  useRecordVisitorSnapshot(activeVisitorCount, activeUserCount, isConnected);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Failed to load performance metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["1h", "24h", "7d"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === "1h" ? "Last Hour" : range === "24h" ? "Last 24h" : "Last 7 Days"}
          </Button>
        ))}
      </div>

      {/* Real-Time Presence Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* All Visitors */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Radio className="h-6 w-6 text-primary" />
                  </div>
                  {isConnected && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Site Now</p>
                  <p className="text-3xl font-bold">{activeVisitorCount}</p>
                </div>
              </div>

              <div className="h-12 w-px bg-border" />

              {/* Authenticated Users */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Logged In Users</p>
                  <p className="text-3xl font-bold">{activeUserCount}</p>
                </div>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
              {isConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </>
              ) : (
                "Connecting..."
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.enrollmentCount} enrollments · {metrics?.quizAttemptCount} quizzes · {metrics?.lessonCompletionCount} lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalRegisteredUsers} total registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.newUsers}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.errorCount} errors logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visitor Trends
          </CardTitle>
          <CardDescription>Historical visitor and user counts over time</CardDescription>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : visitorTrends && visitorTrends.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={visitorTrends}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  name="All Visitors"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Logged In"
                  stroke="hsl(142 76% 36%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No visitor data yet. Snapshots are recorded every 5 minutes.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Volume</CardTitle>
            <CardDescription>Requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={metrics?.chartData || []}>
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Slowest Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Slowest Endpoints</CardTitle>
            <CardDescription>Average response time by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.slowestEndpoints.slice(0, 5).map((endpoint, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{endpoint.path}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{endpoint.count} calls</Badge>
                    <Badge 
                      variant={endpoint.avgTime < 200 ? "default" : endpoint.avgTime < 500 ? "secondary" : "destructive"}
                    >
                      {endpoint.avgTime}ms
                    </Badge>
                  </div>
                </div>
              ))}
              {(!metrics?.slowestEndpoints || metrics.slowestEndpoints.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`p-2 rounded-full ${(metrics?.errorRate ?? 0) < 1 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Error Rate</p>
                <p className="text-xs text-muted-foreground">
                  {(metrics?.errorRate ?? 0) < 1 
                    ? "Error rate is healthy" 
                    : "Monitor error logs for issues"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">User Activity</p>
                <p className="text-xs text-muted-foreground">
                  {metrics?.uniqueUsers} active users · {metrics?.totalRegisteredUsers} total registered
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Engagement</p>
                <p className="text-xs text-muted-foreground">
                  {metrics?.quizAttemptCount} quiz attempts · {metrics?.lessonCompletionCount} lessons completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
