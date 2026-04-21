import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useEnrollments,
  useLessonProgress,
  useQuizAttempts,
  useLastAccessedLesson,
} from "@/hooks/useStudentProgress";
import CourseProgressCard from "@/components/dashboard/CourseProgressCard";
import StreakWidget from "@/components/dashboard/StreakWidget";
import { DashboardCardSkeleton } from "@/components/skeletons/ContentSkeletons";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  BookOpen,
  GraduationCap,
  FileQuestion,
  Play,
  Layers,
  
  Map,
  Trophy,
  MessageSquare,
  ChevronRight,
  Target,
  Calendar,
} from "lucide-react";

const STUDY_TOOLS = [
  { label: "Flashcards", icon: Layers, to: "/flashcards", color: "text-purple-500" },
  { label: "Learning Paths", icon: Map, to: "/learning-paths", color: "text-green-500" },
  { label: "Achievements", icon: Trophy, to: "/achievements", color: "text-yellow-500" },
  { label: "Discussions", icon: MessageSquare, to: "/discussions", color: "text-blue-500" },
];

const CIMA_ORDER = ["BA1","BA2","BA3","BA4","E1","P1","F1","E2","P2","F2","E3","P3","F3","SCS","MCS","OCS"];

const getCimaIndex = (title: string) => {
  const code = title.match(/^([A-Z]+\d?)/i)?.[1]?.toUpperCase() || "";
  const idx = CIMA_ORDER.indexOf(code);
  return idx >= 0 ? idx : CIMA_ORDER.length;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: lessonProgress } = useLessonProgress();
  const { data: quizAttempts } = useQuizAttempts();
  const { data: lastLesson } = useLastAccessedLesson();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const enrolledCount = enrollments?.length || 0;
  const completedLessonsCount = (lessonProgress as any[])?.filter((p) => p.completed).length || 0;
  const totalQuizzes = quizAttempts?.length || 0;
  const averageScore =
    totalQuizzes > 0
      ? Math.round(
          quizAttempts!.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) / totalQuizzes
        )
      : 0;

  const userName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Student";

  const sorted = [...(enrollments || [])].sort(
    (a, b) => getCimaIndex(a.courses?.title || "") - getCimaIndex(b.courses?.title || "")
  );
  const activeCourses = sorted.filter((e) => !e.completed_at);
  const completedCourses = sorted.filter((e) => e.completed_at);
  const recentQuizAttempts = quizAttempts?.slice(0, 3) || [];

  if (enrollmentsLoading) {
    return (
      <Layout>
        <SEOHead title="Dashboard" noIndex />
        <div className="pt-24 lg:pt-28 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => <DashboardCardSkeleton key={i} />)}
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

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {userName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {enrolledCount > 0
                  ? `Enrolled in ${enrolledCount} course${enrolledCount !== 1 ? "s" : ""} — keep it up.`
                  : "Get started by enrolling in your first course."}
              </p>
            </div>
            {enrolledCount === 0 ? (
              <Button size="lg" className="shrink-0" onClick={() => navigate("/courses")}>
                <GraduationCap className="w-5 h-5 mr-2" />
                Browse Courses
              </Button>
            ) : lastLesson ? (
              <Button
                size="lg"
                className="shrink-0 gap-2"
                onClick={() =>
                  navigate(`/courses/${lastLesson.course_id}/lesson/${lastLesson.lesson_id}`)
                }
              >
                <Play className="w-4 h-4" />
                Continue Learning
              </Button>
            ) : null}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Enrolled
              </div>
              <p className="text-3xl font-bold text-foreground">{enrolledCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {enrolledCount > 0 ? "active courses" : "no courses yet"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Target className="w-3.5 h-3.5" />
                Completed
              </div>
              <p className="text-3xl font-bold text-foreground">{completedLessonsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">lessons finished</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileQuestion className="w-3.5 h-3.5" />
                Quiz Avg
              </div>
              <p className={`text-3xl font-bold ${
                averageScore >= 75
                  ? "text-accent"
                  : averageScore >= 50
                  ? "text-primary"
                  : averageScore > 0
                  ? "text-yellow-500"
                  : "text-foreground"
              }`}>
                {averageScore > 0 ? `${averageScore}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalQuizzes > 0 ? `${totalQuizzes} quizzes taken` : "no quizzes yet"}
              </p>
            </Card>
          </div>

          {/* Empty state */}
          {enrolledCount === 0 ? (
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

              {/* Main column */}
              <div className="lg:col-span-2 space-y-6 min-w-0">
                {activeCourses.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      My Courses
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {activeCourses.map((e) => (
                        <CourseProgressCard key={e.id} enrollment={e} />
                      ))}
                    </div>
                  </div>
                )}

                {completedCourses.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Completed — {completedCourses.length}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {completedCourses.map((e) => (
                        <CourseProgressCard key={e.id} enrollment={e} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4 min-w-0">
                <StreakWidget />

                {/* Study Tools */}
                <Card className="p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Study Tools
                  </h3>
                  <div className="space-y-0.5">
                    {STUDY_TOOLS.map(({ label, icon: Icon, to, color }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors group"
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                        <span className="text-sm text-foreground flex-1">{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </Card>

                {/* Recent Quiz Results */}
                {recentQuizAttempts.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      Recent Results
                    </div>
                    <div className="space-y-2">
                      {recentQuizAttempts.map((attempt) => {
                        const pct = Math.round((attempt.score / attempt.max_score) * 100);
                        return (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg"
                          >
                            <div>
                              <p className="text-xs font-medium text-foreground">
                                {attempt.score}/{attempt.max_score} correct
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(attempt.attempted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`text-sm font-bold ${
                                pct >= 80
                                  ? "text-accent"
                                  : pct >= 60
                                  ? "text-yellow-500"
                                  : "text-destructive"
                              }`}
                            >
                              {pct}%
                            </span>
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
