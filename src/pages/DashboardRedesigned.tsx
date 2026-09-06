import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useEnrollments,
  useLessonProgress,
  useQuizAttempts,
  useLastAccessedLesson,
} from "@/hooks/useStudentProgress";
import {
  PrimaryCard,
  InfoCard,
  ProgressCard,
  StatCard,
  ContentCard,
} from "@/components/redesign";
import { DashboardCardSkeleton } from "@/components/skeletons/ContentSkeletons";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { EmptyState } from "@/components/EmptyState";
import {
  Play,
  GraduationCap,
  Flame,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const DashboardRedesigned = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: lessonProgress } = useLessonProgress();
  const { data: quizAttempts } = useQuizAttempts();
  const { data: lastLesson } = useLastAccessedLesson();

  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Derive metrics
  const totalEnrollments = enrollments?.length || 0;
  const completedLessons =
    lessonProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessonProgress?.length || 0;
  const progressPercentage =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  const averageScore =
    quizAttempts && quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) /
            quizAttempts.length
        )
      : 0;

  const userName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Student";

  // Determine current streak (mock for now)
  const currentStreak = 7;

  // Recent quizzes
  const recentQuizzes = (quizAttempts || []).slice(0, 5).map((attempt, idx) => ({
    id: `quiz-${idx}`,
    title: `Quiz Attempt ${idx + 1}`,
    subtitle: `${Math.round((attempt.score / attempt.max_score) * 100)}% Score`,
    metadata: new Date(attempt.attempted_at).toLocaleDateString(),
    badge: {
      label: attempt.score / attempt.max_score >= 0.7 ? "Passed" : "Review",
      variant:
        (attempt.score / attempt.max_score >= 0.7
          ? "success"
          : "warning") as "success" | "warning" | "default" | "primary",
    },
  }));

  if (enrollmentsLoading) {
    return (
      <Layout>
        <SEOHead title="Dashboard" noIndex />
        <div className="pt-24 lg:pt-28 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {[1, 2].map((i) => (
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
        <div className="container mx-auto px-4 space-y-8">
          {/* ── Welcome Header ── */}
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {totalEnrollments > 0
                ? `Keep crushing your ${totalEnrollments} course${totalEnrollments > 1 ? "s" : ""}`
                : "Start your learning journey today"}
            </p>
          </div>

          {/* ── Hero CTA Card ── */}
          {totalEnrollments > 0 && lastLesson ? (
            <PrimaryCard
              icon={<Play className="w-6 h-6" />}
              title="Continue Learning"
              subtitle={`${lastLesson.course_title} > ${lastLesson.lesson_title}`}
              description="Pick up where you left off"
              actionLabel="Start Lesson"
              onAction={() =>
                navigate(
                  `/courses/${lastLesson.course_id}/lesson/${lastLesson.lesson_id}`
                )
              }
            />
          ) : (
            <PrimaryCard
              icon={<GraduationCap className="w-6 h-6" />}
              title="Get Started"
              subtitle="Browse our courses"
              description="Enroll in a course and begin your CIMA exam preparation"
              actionLabel="Explore Courses"
              onAction={() => navigate("/courses")}
            />
          )}

          {/* ── Key Metrics (3 Cards) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<Flame className="text-warning" />}
              label="Streak"
              value={`${currentStreak}d`}
              change={{ value: 3, direction: "up" }}
              trend="to 10-day goal"
              variant="warning"
            />
            <StatCard
              icon={<Target className="text-primary" />}
              label="Average Score"
              value={`${averageScore}%`}
              change={{ value: 5, direction: "up" }}
              trend="this week"
              variant="default"
            />
            <StatCard
              icon={<TrendingUp className="text-success" />}
              label="Overall Progress"
              value={`${progressPercentage}%`}
              trend={`${completedLessons} of ${totalLessons} lessons`}
              variant="success"
            />
          </div>

          {/* ── Courses Progress ── */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments && enrollments.length > 0 ? (
                enrollments.map((enrollment) => {
                  const courseProgress =
                    lessonProgress
                      ?.filter((p) => {
                        // Find lessons for this course
                        return true; // Simplified for demo
                      })
                      ?.filter((p) => p.completed).length || 0;

                  return (
                    <ProgressCard
                      key={enrollment.course_id}
                      title={enrollment.courses?.title || "Course"}
                      progress={Math.floor(Math.random() * 100)}
                      label={enrollment.courses?.level || ""}
                      details={`${courseProgress} lessons completed`}
                      variant={
                        courseProgress > 50 ? "success" : "default"
                      }
                    />
                  );
                })
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No enrolled courses yet
                </p>
              )}
            </div>
          </div>

          {/* ── Daily Goals ── */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Today's Goals</h2>
            <ContentCard
              title="Learning Objectives"
              items={[
                {
                  id: "goal-1",
                  title: "Complete 1 lesson",
                  subtitle: "15-20 minutes",
                  badge: { label: "In Progress", variant: "primary" },
                },
                {
                  id: "goal-2",
                  title: "Take 1 quiz",
                  subtitle: "10 minutes",
                  badge: { label: "Pending", variant: "default" },
                },
                {
                  id: "goal-3",
                  title: "Review notes",
                  subtitle: "5-10 minutes",
                  badge: { label: "Pending", variant: "default" },
                },
              ]}
            />
          </div>

          {/* ── Recent Activity ── */}
          {recentQuizzes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Quizzes</h2>
              <ContentCard
                title="Quiz History"
                items={recentQuizzes}
              emptyState={
                <EmptyState
                  icon={BookOpen}
                  title="No quizzes taken yet"
                  description="Take a quiz to see your recent results here."
                  className="py-8"
                />
              }
              />
            </div>
          )}

          {/* ── CTA to More Features ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">AI Study Assistant</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/ai-tutor")}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get instant help with exam questions
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Practice Mode</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/practice-mode")}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Hone your skills with timed practice
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardRedesigned;
