import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useEnrollments,
  useLessonProgress,
  useQuizAttempts,
  useTotalStudyTime,
  useLastAccessedLesson,
} from "@/hooks/useStudentProgress";
import { useQuizzes } from "@/hooks/useQuizzes";
import CourseProgressCard from "@/components/dashboard/CourseProgressCard";
import {
  BookOpen,
  Clock,
  Target,
  Play,
  Zap,
  GraduationCap,
  FileQuestion,
  ChevronRight,
  ArrowRight,
  Calendar,
  Award,
  TrendingUp,
  Brain,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: lessonProgress } = useLessonProgress();
  const { data: quizAttempts } = useQuizAttempts();
  const { formatted: studyTimeFormatted } = useTotalStudyTime();
  const { data: lastLesson } = useLastAccessedLesson();

  // Get quizzes for enrolled courses
  const enrolledCourseIds = enrollments?.map((e) => e.course_id) || [];
  const { data: allQuizzes } = useQuizzes();
  const availableQuizzes = allQuizzes?.filter((q) =>
    enrolledCourseIds.includes(q.course_id)
  );

  // Calculate stats from real data
  const totalEnrollments = enrollments?.length || 0;
  const completedLessons = lessonProgress?.filter((p) => p.completed).length || 0;
  const totalQuizzes = quizAttempts?.length || 0;
  const averageScore =
    totalQuizzes > 0
      ? Math.round(
          quizAttempts!.reduce((acc, q) => acc + (q.score / q.max_score) * 100, 0) /
            totalQuizzes
        )
      : 0;

  // Recent quiz attempts for display
  const recentQuizAttempts = quizAttempts?.slice(0, 5) || [];


  // Chart data for analytics
  const progressData = [
    { week: "W1", score: 45 },
    { week: "W2", score: 52 },
    { week: "W3", score: 48 },
    { week: "W4", score: 61 },
    { week: "W5", score: 68 },
    { week: "W6", score: 74 },
    { week: "W7", score: 72 },
    { week: "W8", score: averageScore || 81 },
  ];

  const competencyData = [
    { subject: "Economics", score: 85, fullMark: 100 },
    { subject: "Costing", score: 72, fullMark: 100 },
    { subject: "Financial Reporting", score: 68, fullMark: 100 },
    { subject: "Governance", score: 91, fullMark: 100 },
    { subject: "Analysis", score: 78, fullMark: 100 },
    { subject: "Decision Making", score: 64, fullMark: 100 },
  ];

  const questionHistory = [
    { topic: "Microeconomics", correct: 42, incorrect: 8 },
    { topic: "Macroeconomics", correct: 35, incorrect: 15 },
    { topic: "Cost Analysis", correct: 28, incorrect: 22 },
    { topic: "Governance", correct: 48, incorrect: 2 },
    { topic: "Ethics", correct: 38, incorrect: 12 },
  ];

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  if (enrollmentsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute top-10 right-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm font-medium mb-3">
                Student Dashboard
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-primary-foreground/70">
                {totalEnrollments > 0
                  ? `You're enrolled in ${totalEnrollments} course${
                      totalEnrollments > 1 ? "s" : ""
                    }. Keep up the great work!`
                  : "Get started by enrolling in your first course."}
              </p>
            </div>
            {totalEnrollments === 0 && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => navigate("/courses")}
              >
                <GraduationCap className="w-5 h-5" />
                Browse Courses
              </Button>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full">
            <path
              d="M0 40L1440 40L1440 0C1200 30 720 40 0 15L0 40Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Courses Enrolled",
                value: totalEnrollments.toString(),
                icon: BookOpen,
                color: "text-primary",
              },
              {
                label: "Study Time",
                value: studyTimeFormatted || "0h",
                icon: Clock,
                color: "text-teal",
              },
              {
                label: "Lessons Completed",
                value: completedLessons.toString(),
                icon: Target,
                color: "text-accent",
              },
              {
                label: "Quiz Avg Score",
                value: averageScore > 0 ? `${averageScore}%` : "N/A",
                icon: Zap,
                color: "text-yellow-500",
              },
            ].map((stat) => (
              <Card key={stat.label} className="p-6 hover-lift">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Resume Last Lesson Quick Action */}
          {lastLesson && totalEnrollments > 0 && (
            <Link 
              to={`/courses/${lastLesson.course_slug}/lesson/${lastLesson.lesson_id}`}
              className="block mb-8"
            >
              <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Resume where you left off</p>
                      <h3 className="text-lg font-bold text-foreground">{lastLesson.lesson_title}</h3>
                      <p className="text-sm text-muted-foreground">{lastLesson.course_title}</p>
                    </div>
                  </div>
                  <Button size="lg" className="gap-2 shadow-md group-hover:shadow-lg transition-all">
                    Continue Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </Link>
          )}

          {totalEnrollments === 0 ? (
            <Card className="p-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No Courses Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your learning journey by enrolling in a course.
              </p>
              <Button size="lg" onClick={() => navigate("/courses")}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Score Progress Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Score Progress
                    </h2>
                    <span className="text-sm text-muted-foreground">Last 8 weeks</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="week"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Competency Radar Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Brain className="w-5 h-5 text-accent" />
                      Competency Analysis
                    </h2>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={competencyData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="subject"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Question History Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-teal" />
                      Practice Question History
                    </h2>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={questionHistory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          dataKey="topic"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="correct"
                          fill="hsl(var(--accent))"
                          stackId="a"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar
                          dataKey="incorrect"
                          fill="hsl(var(--destructive))"
                          stackId="a"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-accent" />
                      <span className="text-sm text-muted-foreground">Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-destructive" />
                      <span className="text-sm text-muted-foreground">Incorrect</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Enrolled Courses */}
                <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">Your Courses</h3>
                      <p className="text-xs text-muted-foreground">Continue where you left off</p>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {enrollments?.map((enrollment) => (
                      <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                </Card>

                {/* Available Quizzes */}
                {availableQuizzes && availableQuizzes.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileQuestion className="w-5 h-5 text-accent" />
                      Available Quizzes
                    </h3>
                    <div className="space-y-3">
                      {availableQuizzes.map((quiz) => (
                        <Link
                          key={quiz.id}
                          to={`/quiz/${quiz.id}`}
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {quiz.title}
                            </p>
                            {quiz.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {quiz.description}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recent Quiz Attempts */}
                {recentQuizAttempts.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Recent Quiz Results
                    </h3>
                    <div className="space-y-3">
                      {recentQuizAttempts.map((attempt) => {
                        const percentage = Math.round(
                          (attempt.score / attempt.max_score) * 100
                        );
                        return (
                          <div
                            key={attempt.id}
                            className="p-3 bg-secondary/50 rounded-lg"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-foreground">
                                {attempt.score}/{attempt.max_score} correct
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  percentage >= 80
                                    ? "text-accent"
                                    : percentage >= 60
                                    ? "text-yellow-500"
                                    : "text-destructive"
                                }`}
                              >
                                {percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(attempt.attempted_at).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Achievement */}
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Award className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Keep Learning!</p>
                      <p className="text-sm text-muted-foreground">
                        {totalQuizzes > 0
                          ? `${totalQuizzes} quiz${totalQuizzes > 1 ? "zes" : ""} completed`
                          : "Take a quiz to earn achievements"}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
