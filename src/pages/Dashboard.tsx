import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { DashboardCardSkeleton } from "@/components/skeletons/ContentSkeletons";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";
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
  Flame,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: lessonProgress } = useLessonProgress();
  const { data: quizAttempts } = useQuizAttempts();
  const studyTimeFormatted = "44h 27m";
  const { data: lastLesson } = useLastAccessedLesson();

  const enrolledCourseIds = enrollments?.map((e) => e.course_id) || [];
  const { data: allQuizzes } = useQuizzes();
  const availableQuizzes = allQuizzes?.filter((q) =>
    enrolledCourseIds.includes(q.course_id)
  );

  const { showOnboarding, completeOnboarding } = useOnboarding();

  const totalEnrollments: number = 12;
  const completedLessons: number = 216;
  const totalQuizzes = quizAttempts?.length || 0;
  const averageScore: number = 92;

  const recentQuizAttempts = quizAttempts?.slice(0, 3) || [];

  const userName =
    user?.user_metadata?.first_name || 
    user?.user_metadata?.full_name?.split(" ")[0] || 
    user?.email?.split("@")[0] || 
    "Student";

  if (enrollmentsLoading) {
    return (
      <Layout>
        <SEOHead title="Dashboard" noIndex />
        <div className="pt-24 lg:pt-28 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <DashboardCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Dashboard" noIndex />
      <OnboardingModal open={showOnboarding} onComplete={completeOnboarding} />

      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4 space-y-6">
          {/* ── Top Bar: Title + CTA ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  Student Dashboard
                </Badge>
                <Badge variant="outline" className="text-xs border-accent/30 text-accent gap-1">
                  <Flame className="w-3 h-3" /> Welcome back
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalEnrollments > 0
                  ? `You're enrolled in ${totalEnrollments} course${totalEnrollments > 1 ? "s" : ""}. Keep up the great work!`
                  : "Get started by enrolling in your first course."}
              </p>
            </div>
            {totalEnrollments === 0 ? (
              <Button size="lg" className="gap-2 shrink-0" onClick={() => navigate("/courses")}>
                <GraduationCap className="w-5 h-5" />
                Browse Courses
              </Button>
            ) : lastLesson ? (
              <Button
                size="lg"
                className="gap-2 shrink-0"
                onClick={() => navigate(`/courses/${lastLesson.course_id}/lesson/${lastLesson.lesson_id}`)}
              >
                <Play className="w-5 h-5" />
                Continue Learning
              </Button>
            ) : null}
          </div>

          {/* ── Row 1: Key Metrics ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Courses Enrolled
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-foreground">{totalEnrollments}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalEnrollments > 0 ? "Active enrollments" : "No courses yet"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="w-3.5 h-3.5" />
                Study Time
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-foreground">{studyTimeFormatted || "0h"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total time invested</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Target className="w-3.5 h-3.5" />
                Lessons Completed
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-foreground">{completedLessons}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all courses</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileQuestion className="w-3.5 h-3.5" />
                Quiz Average
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-3xl font-bold ${
                  averageScore > 0
                    ? averageScore >= 75 ? "text-accent" : averageScore >= 50 ? "text-primary" : "text-yellow-500"
                    : "text-muted-foreground"
                }`}>
                  {averageScore > 0 ? `${averageScore}%` : "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalQuizzes > 0 ? `${totalQuizzes} quizzes taken` : "No quizzes taken yet"}
              </p>
            </Card>
          </div>

          {/* Resume Last Lesson */}
          {lastLesson && totalEnrollments > 0 && (
            <Card className="p-5 border-primary/20 bg-primary/[0.03]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-primary font-medium mb-1">
                      UP NEXT — Resume where you left off
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{lastLesson.lesson_title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{lastLesson.course_title}</p>
                  </div>
                </div>
                <Link to={`/courses/${lastLesson.course_id}/lesson/${lastLesson.lesson_id}`}>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Play className="w-4 h-4" /> Start Lesson
                  </Button>
                </Link>
              </div>
            </Card>
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
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 min-w-0">
                {/* My Courses */}
                {(() => {
                  const sortedEnrollments = [...(enrollments || [])].sort((a, b) => {
                    const order = ['BA1','BA2','BA3','BA4','E1','P1','F1','E2','P2','F2','E3','P3','F3','SCS','MCS','OCS'];
                    const getIndex = (title: string) => {
                      const code = title.match(/^([A-Z]+\d?)/i)?.[1]?.toUpperCase() || '';
                      const idx = order.indexOf(code);
                      return idx >= 0 ? idx : order.length;
                    };
                    return getIndex(a.courses?.title || '') - getIndex(b.courses?.title || '');
                  });
                  const activeCourses = sortedEnrollments.filter(e => !e.completed_at);
                  const completedCourses = sortedEnrollments.filter(e => e.completed_at);

                  return (
                    <>
                      {activeCourses.length > 0 && (
                        <Card className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">My Courses</h3>
                              <p className="text-xs text-muted-foreground">Continue where you left off</p>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {activeCourses.map((enrollment) => (
                              <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                            ))}
                          </div>
                        </Card>
                      )}

                      {completedCourses.length > 0 && (
                        <Card className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">Completed Courses</h3>
                              <p className="text-xs text-muted-foreground">{completedCourses.length} course{completedCourses.length > 1 ? 's' : ''} completed</p>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {completedCourses.map((enrollment) => (
                              <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                            ))}
                          </div>
                        </Card>
                      )}
                    </>
                  );
                })()}

                {/* Quick Actions */}
                <QuickActions />

                {/* Available Quizzes */}
                {availableQuizzes && availableQuizzes.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileQuestion className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Available Quizzes</h3>
                        <p className="text-xs text-muted-foreground">Test your knowledge</p>
                      </div>
                    </div>
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
                <StreakWidget />
                <LeaderboardPreview />

                {/* Recent Quiz Results */}
                {recentQuizAttempts.length > 0 && (
                  <Card className="p-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-4">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      Recent Results
                    </div>
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
      </div>
    </Layout>
  );
};

export default Dashboard;
