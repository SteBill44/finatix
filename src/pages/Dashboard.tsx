import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
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
import StreakWidget from "@/components/dashboard/StreakWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import LeaderboardPreview from "@/components/dashboard/LeaderboardPreview";
import ExamReadinessWidget from "@/components/dashboard/ExamReadinessWidget";
import StudyPlanWidget from "@/components/dashboard/StudyPlanWidget";
import { DashboardSkeleton } from "@/components/skeletons/ContentSkeletons";
import { FadeIn } from "@/components/PageTransition";
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
} from "lucide-react";

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
  const recentQuizAttempts = quizAttempts?.slice(0, 3) || [];

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  if (enrollmentsLoading) {
    return (
      <Layout>
        {/* Header skeleton */}
        <section className="relative py-12 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-95" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="h-6 w-32 bg-primary-foreground/20 rounded-full animate-pulse" />
                <div className="h-10 w-64 bg-primary-foreground/20 rounded-lg animate-pulse" />
                <div className="h-5 w-48 bg-primary-foreground/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 40" fill="none" className="w-full">
              <path d="M0 40L1440 40L1440 0C1200 30 720 40 0 15L0 40Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>
        
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <DashboardSkeleton />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute top-10 right-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl translate-x-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm font-medium mb-3">
                Student Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
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
        <div className="container mx-auto px-4 overflow-hidden">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Courses",
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
                label: "Lessons",
                value: completedLessons.toString(),
                icon: Target,
                color: "text-accent",
              },
              {
                label: "Quiz Avg",
                value: averageScore > 0 ? `${averageScore}%` : "N/A",
                icon: Zap,
                color: "text-yellow-500",
              },
            ].map((stat) => (
              <Card key={stat.label} className="p-3 sm:p-6 hover-lift">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center ${stat.color} flex-shrink-0`}
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Resume Last Lesson Quick Action */}
          {lastLesson && totalEnrollments > 0 && (
            <Link 
              to={`/courses/${lastLesson.course_id}/lesson/${lastLesson.lesson_id}`}
              className="block mb-8"
            >
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Resume where you left off</p>
                      <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{lastLesson.lesson_title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{lastLesson.course_title}</p>
                    </div>
                  </div>
                  <Button size="default" className="gap-2 shadow-md group-hover:shadow-lg transition-all w-full sm:w-auto">
                    Continue
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
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
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 min-w-0">
                {/* My Courses Grid */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">My Courses</h3>
                      <p className="text-xs text-muted-foreground">Continue where you left off</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {enrollments?.map((enrollment) => (
                      <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <QuickActions />

                {/* Available Quizzes */}
                {availableQuizzes && availableQuizzes.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileQuestion className="w-5 h-5 text-accent" />
                      Available Quizzes
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {availableQuizzes.slice(0, 4).map((quiz) => (
                        <Link
                          key={quiz.id}
                          to={`/quiz/${quiz.id}`}
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {quiz.title}
                            </p>
                            {quiz.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {quiz.description}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6 min-w-0">
                {/* Study Plan Widget */}
                <StudyPlanWidget />

                {/* Exam Readiness Widget */}
                <ExamReadinessWidget />

                {/* Streak Widget */}
                <StreakWidget />

                {/* Leaderboard Preview */}
                <LeaderboardPreview />

                {/* Recent Quiz Results */}
                {recentQuizAttempts.length > 0 && (
                  <Card className="p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Recent Results
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
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
