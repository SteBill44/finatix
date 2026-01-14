import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Award, 
  TrendingUp,
  Star,
  FileText,
  Activity,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? "text-accent" : "text-destructive"}`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />
            <span>{trend >= 0 ? "+" : ""}{trend}% from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboard();

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load dashboard statistics. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              description={`${stats?.newUsersThisWeek ?? 0} new this week`}
              icon={<Users className="h-4 w-4 text-primary" />}
            />
            <StatCard
              title="Total Enrollments"
              value={stats?.totalEnrollments ?? 0}
              description={`${stats?.totalCompletions ?? 0} completions`}
              icon={<GraduationCap className="h-4 w-4 text-primary" />}
            />
            <StatCard
              title="Courses"
              value={stats?.totalCourses ?? 0}
              description={`${stats?.totalLessons ?? 0} lessons total`}
              icon={<BookOpen className="h-4 w-4 text-primary" />}
            />
            <StatCard
              title="Certificates Issued"
              value={stats?.totalCertificates ?? 0}
              description={`${stats?.totalReviews ?? 0} reviews`}
              icon={<Award className="h-4 w-4 text-primary" />}
            />
          </>
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Active Students Today"
              value={stats?.activeStudentsToday ?? 0}
              icon={<Activity className="h-4 w-4 text-primary" />}
            />
            <StatCard
              title="Total Quizzes"
              value={stats?.totalQuizzes ?? 0}
              icon={<FileText className="h-4 w-4 text-primary" />}
            />
            <StatCard
              title="Completion Rate"
              value={
                stats?.totalEnrollments
                  ? `${Math.round(((stats?.totalCompletions ?? 0) / stats.totalEnrollments) * 100)}%`
                  : "0%"
              }
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Trend</CardTitle>
            <CardDescription>Daily enrollments over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : stats?.enrollmentsTrend && stats.enrollmentsTrend.length > 0 ? (
              <ChartContainer
                config={{
                  count: {
                    label: "Enrollments",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.enrollmentsTrend}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-count)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No enrollment data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Courses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Courses</CardTitle>
            <CardDescription>Courses by enrollment count</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : stats?.topCourses && stats.topCourses.length > 0 ? (
              <ChartContainer
                config={{
                  enrollments: {
                    label: "Enrollments",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topCourses}
                    layout="vertical"
                    margin={{ left: 10, right: 10 }}
                  >
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      dataKey="title"
                      type="category"
                      width={150}
                      fontSize={11}
                      tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="enrollments"
                      fill="var(--color-enrollments)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No course data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Courses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Course Performance
          </CardTitle>
          <CardDescription>Detailed view of course statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.topCourses && stats.topCourses.length > 0 ? (
            <div className="space-y-3">
              {stats.topCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-semibold">{course.enrollments}</p>
                      <p className="text-xs text-muted-foreground">enrollments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating > 0 ? course.rating.toFixed(1) : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No courses found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
