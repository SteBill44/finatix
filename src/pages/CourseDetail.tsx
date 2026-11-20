import { trackEvent } from "@/lib/analytics";
import React, { useState, useEffect, useRef, useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import EnrolledCourseDashboard from "@/components/course/EnrolledCourseDashboard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments, useEnrollInCourse, useUnenrollFromCourse } from "@/hooks/useStudentProgress";
import { useHasCIMAProfile } from "@/hooks/useCIMAProfile";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAdminView } from "@/contexts/AdminViewContext";
import { useCourseDetailOptimized } from "@/hooks/useCourseDetailOptimized";
import { paperBySlugCode } from "@/lib/papers";
import { useIsMobile } from "@/hooks/use-mobile";
import { funnel } from "@/lib/analytics";
import CIMAProfileModal from "@/components/CIMAProfileModal";
import { toast } from "sonner";
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  BookOpen, 
  FileText,
  Award,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Lock,
  MessageSquare,
  GraduationCap,
  Timer,
  ClipboardList,
  TrendingUp,
  Target,
  BarChart3,
  UserMinus,
  History,
  Sparkles,
} from "lucide-react";
import CourseReviews from "@/components/CourseReviews";
import StripeEmbeddedCheckout from "@/components/StripeEmbeddedCheckout";
import PaymentTestModeBanner from "@/components/PaymentTestModeBanner";
import { getCoursePriceId } from "@/lib/coursePricing";
import { POLICY } from "@/lib/catalogue";
import { deriveCourseFacts } from "@/lib/courseFacts";
import CoursePreview from "@/components/course/CoursePreview";
import { ContentStatusNotice } from "@/components/course/ContentStatusNotice";
import { useCourseContentStatus, canPurchase } from "@/hooks/useCourseContentStatus";
import InterestRegistrationForm from "@/components/InterestRegistrationForm";
import { isPaymentsConfigured } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import MockExamHistory from "@/components/course/MockExamHistory";
import ReadinessScoreCard from "@/components/course/ReadinessScoreCard";
import StudyRecommendations from "@/components/course/StudyRecommendations";
import { useReadinessScore } from "@/hooks/useReadinessScore";
import { useCourseRating } from "@/hooks/useReviews";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: enrollments, refetch: refetchEnrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();
  const { hasCompleteProfile, isLoading: isLoadingProfile } = useHasCIMAProfile();
  const { isAdmin } = useIsAdmin();
  const { isStudentView } = useAdminView();
  const [showCIMAModal, setShowCIMAModal] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState(false);
  const [autoEnrolled, setAutoEnrolled] = useState(false);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");


  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isEffectiveAdmin = isAdmin && !isStudentView;

  // Short paper codes (/courses/e1) are legacy/shareable URLs: send them to
  // the canonical course slug so there is one indexable URL per course.
  const shortCodePaper = courseId && !courseId.includes("-") ? paperBySlugCode(courseId.toLowerCase()) : undefined;

  // First, fetch course to get its ID (needed for optimized hook)
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseId!)
        .maybeSingle();

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId ?? "");
      if (!data && isUuid) {
        const result = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId!)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !shortCodePaper,
  });

  // Fetch course details with optimized hook (lessons, progress, quizzes in one call)
  const { data: courseDetail, isLoading: detailLoading } = useCourseDetailOptimized(course?.id || "");

  // Fire analytics: course viewed
  useEffect(() => {
    if (course?.id) {
      funnel.courseViewed({
        course_id: course.id,
        course_title: (course as { title?: string }).title,
        level: (course as { level?: string }).level,
      });
    }
  }, [course?.id]);


  // Extract data from optimized response
  const lessons = courseDetail?.lessons || [];
  const lessonProgress = courseDetail?.progress || [];
  const quizzes = courseDetail?.quizzes || [];

  const { data: syllabusData } = useQuery({
    queryKey: ["course-syllabus", course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_syllabuses")
        .select("*")
        .eq("course_id", course!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!course?.id,
  });

  const isLoading = courseLoading || detailLoading;
  const { data: ratingData } = useCourseRating(course?.id || "");
  const { data: readinessScore } = useReadinessScore(course?.id || "");

  const { data: quizAttempts } = useQuery({
    queryKey: ["quiz-attempts", course?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("course_id", course!.id)
        .eq("user_id", user!.id)
        .order("attempted_at", { ascending: true });
      if (error) throw error;
      return (data || [])
        .filter((attempt) => attempt.quiz_id !== null)
        .map((attempt) => ({ ...attempt, quiz_id: attempt.quiz_id as string }));
    },
    enabled: !!course?.id && !!user?.id,
  });

  const isEnrolled = useMemo(
    () => enrollments?.some((e) => e.course_id === course?.id) ?? false,
    [enrollments, course?.id]
  );

  const coursePriceId = getCoursePriceId(course?.slug);
  const coursePrice = Number(course?.price ?? 0);
  const isPaidCourse = coursePrice > 0 && !!coursePriceId;
  const paymentsReady = isPaymentsConfigured();
  // An active all-access membership unlocks every paid course
  const { isActive: hasMembership } = useSubscription();
  const requiresPayment = isPaidCourse && !hasMembership;
  const { data: contentStatusMap } = useCourseContentStatus();
  const contentStatus = course ? contentStatusMap?.get(course.id) : undefined;
  // Paid courses stay closed until editorially approved and complete. Existing
  // buyers are unaffected - their access is checked separately.
  const notOnSale = requiresPayment && !canPurchase(contentStatus);
  const [showInterest, setShowInterest] = useState(false);



  const { completedLessons, totalLessons, progressPercentage } = useMemo(() => {
    const total = lessons?.length ?? 0;
    const completed = lessonProgress?.filter((p) => p.completed).length ?? 0;
    return {
      completedLessons: completed,
      totalLessons: total,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [lessons, lessonProgress]);

  const completedLessonIds = useMemo(
    () => new Set(lessonProgress?.filter((p) => p.completed).map((p) => p.lesson_id) ?? []),
    [lessonProgress]
  );

  const isLessonCompleted = (lessonId: string) => completedLessonIds.has(lessonId);

  // Scroll spy for desktop sticky nav
  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      const sections = Object.entries(sectionRefs.current);
      for (const [key, el] of sections.reverse()) {
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(key);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Homepage "Start practising free" lands on #curriculum; the SPA renders
  // after the browser's own hash jump, so scroll once the course is loaded.
  const curriculumScrolled = useRef(false);
  useEffect(() => {
    if (curriculumScrolled.current || !course || isLoading || window.location.hash !== "#curriculum") return;
    curriculumScrolled.current = true;
    trackEvent("course_curriculum_view", { course: course.slug });
    setTimeout(() => document.getElementById("curriculum")?.scrollIntoView({ block: "start" }), 50);
  }, [course, isLoading]);

  const scrollToSection = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEnroll = async () => {
    if (!course) return;

    // Paying is never gated: anyone can buy and sort out their account after
    if (notOnSale) {
      setShowInterest(true);
      return;
    }
    if (requiresPayment) {
      if (!paymentsReady) {
        toast.error("Payments aren't available right now. Please try again later.");
        return;
      }
      const q = new URLSearchParams({
        priceId: coursePriceId ?? "",
        title: `Buy ${course.title}`,
        price: String(coursePrice),
        courseId: course.id,
        slug: course.slug ?? "",
      });
      navigate(`/checkout/pay?${q.toString()}`);
      return;
    }

    if (!user) {
      toast.error("Please sign in to start this course");
      navigate("/auth");
      return;
    }

    if (!hasCompleteProfile && !isLoadingProfile) {
      setPendingEnrollment(true);
      setShowCIMAModal(true);
      return;
    }
    await performEnrollment();
  };


  const performEnrollment = async () => {
    if (!course) return;
    setPendingEnrollment(false);

    try {
      await enrollMutation.mutateAsync(course.id);
      toast.success(`Successfully enrolled in ${course.title}!`);
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.info("You're already enrolled in this course");
      } else {
        toast.error(error.message || "Failed to enroll");
      }
    }
  };


  const handleCIMAModalSuccess = () => {
    if (pendingEnrollment) {
      performEnrollment();
      return;
    }
    goToFirstLesson();
  };

  const goToFirstLesson = () => {
    if (lessons && lessons.length > 0) {
      const firstIncomplete = lessons.find((l) => !isLessonCompleted(l.id));
      const targetLesson = firstIncomplete || lessons[0];
      navigate(`/courses/${course?.id}/lesson/${targetLesson.id}`);
    }
  };

  const handleStartLearning = () => {
    // Collect CIMA details once, at the point of actually starting to study
    if (user && !hasCompleteProfile && !isLoadingProfile) {
      setPendingEnrollment(false);
      setShowCIMAModal(true);
      return;
    }
    goToFirstLesson();
  };


  const handleUnenroll = async () => {
    if (!course) return;
    try {
      await unenrollMutation.mutateAsync(course.id);
      toast.success(`Unenrolled from ${course.title}`);
      setShowUnenrollDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to unenroll");
    }
  };

  if (shortCodePaper) {
    return <Navigate to={`/courses/${shortCodePaper.courseSlug}`} replace />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Course not found</h2>
            <p className="text-muted-foreground mb-4">This course doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const levelColor = "text-primary";
  const levelBgColor = "bg-primary";

  // Figures come from the content that actually exists in this course.
  const courseFacts = deriveCourseFacts({
    durationHours: course.duration_hours,
    lessons: lessons as Array<{ duration_minutes?: number | null; has_video?: boolean | null }>,
    quizzes: quizzes as Array<{ quiz_type?: string | null }>,
  });
  const isCaseStudyCourse = /case-study/.test(course.slug || "");

  // Only list what genuinely exists: outlines aren't lessons, empty quizzes and mocks aren't counted.
  const outlineOnly = !contentStatus || contentStatus.taught_lessons < contentStatus.lesson_records;
  const hasQuestions = (contentStatus?.questions ?? 0) > 0;
  const features = [
    (contentStatus?.taught_lessons ?? 0) > 0 ? `${contentStatus?.taught_lessons} taught lessons` : null,
    !notOnSale && courseFacts.estimatedStudyHours
      ? `About ${courseFacts.estimatedStudyHours} hours of study time`
      : null,
    hasQuestions && courseFacts.practiceQuizCount > 0 ? `${courseFacts.practiceQuizCount} practice quizzes` : null,
    (contentStatus?.usable_mocks ?? 0) > 0 ? `${contentStatus!.usable_mocks} timed mock exams` : null,
    hasQuestions ? "Progress saved to your account" : null,
    notOnSale ? null : "Certificate of completion",
    notOnSale ? null : POLICY.refundText,
  ].filter(Boolean) as string[];

  // Build navigation sections
  const navSections = [
    { key: "overview", label: "Overview", icon: FileText, show: true },
    { key: "lessons", label: "Lessons", icon: BookOpen, show: isEnrolled && totalLessons > 0 },
    { key: "quizzes", label: "Quizzes", icon: ClipboardList, show: isEffectiveAdmin && quizzes && quizzes.filter(q => q.quiz_type !== 'mock_exam' && q.quiz_type !== 'final_exam').length > 0 },
    { key: "mock-exams", label: "Mock Exams", icon: GraduationCap, show: isEffectiveAdmin && quizzes && quizzes.filter(q => q.quiz_type === 'mock_exam').length > 0 },
    { key: "history", label: "Exam History", icon: History, show: isEffectiveAdmin && isEnrolled && !!quizAttempts?.length },
    { key: "final-exam", label: "Final Exam", icon: Award, show: isEnrolled && quizzes && quizzes.filter(q => q.quiz_type === 'final_exam').length > 0 },
    { key: "reviews", label: "Reviews", icon: Star, show: isEffectiveAdmin && (ratingData?.totalReviews ?? 0) > 0 },
  ].filter(s => s.show);

  // ── Shared content blocks ──
  const OverviewContent = (
    <div ref={el => { sectionRefs.current["overview"] = el; }}>
      {isEnrolled && !(isAdmin && isStudentView) && readinessScore?.weakAreas && readinessScore.weakAreas.length > 0 && (
        <div className="mb-8">
          <StudyRecommendations courseSlug={course.slug} weakAreas={readinessScore.weakAreas} overallScore={readinessScore.overall} />
        </div>
      )}
    </div>
  );

  const LessonsContent = (
    <div ref={el => { sectionRefs.current["lessons"] = el; }}>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <BookOpen className={`w-6 h-6 ${levelColor}`} />
        Course Lessons
      </h2>
      <div className="space-y-3">
        {lessons?.map((lesson, index) => {
          const completed = isLessonCompleted(lesson.id);
          const isLocked = !isEnrolled;
          return (
            <Card
              key={lesson.id}
              role={isLocked ? undefined : "button"}
              tabIndex={isLocked ? undefined : 0}
              aria-disabled={isLocked || undefined}
              aria-label={isLocked ? `${lesson.title} (locked)` : `Open lesson: ${lesson.title}`}
              className={`p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isLocked ? "opacity-60" : "hover:shadow-md cursor-pointer"}`}
              onClick={() => !isLocked && navigate(`/courses/${course.id}/lesson/${lesson.id}`)}
              onKeyDown={(e) => {
                if (isLocked) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/courses/${course.id}/lesson/${lesson.id}`);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? levelBgColor : "bg-secondary"}`}>
                  {completed ? <CheckCircle className="w-5 h-5 text-primary-foreground" /> : isLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Play className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground">{lesson.duration_minutes} min</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const QuizzesContent = (
    <div ref={el => { sectionRefs.current["quizzes"] = el; }}>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <ClipboardList className={`w-6 h-6 ${levelColor}`} />
        Practice Quizzes
        <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full">Admin View</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {quizzes?.filter(q => q.quiz_type !== 'mock_exam' && q.quiz_type !== 'final_exam').map((quiz) => (
          <Card key={quiz.id} className="p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${levelBgColor} flex items-center justify-center flex-shrink-0`}>
                <ClipboardList className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{quiz.description || "Test your knowledge"}</p>
                <Button size="sm" variant="outline" onClick={() => navigate(`/quiz/${quiz.id}`)}>Start Quiz</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const MockExamsContent = (
    <div ref={el => { sectionRefs.current["mock-exams"] = el; }}>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <GraduationCap className={`w-6 h-6 ${levelColor}`} />
        Mock Exams
        <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full">Admin View</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {quizzes?.filter(q => q.quiz_type === 'mock_exam').map((quiz) => (
          <Card key={quiz.id} className="p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${levelBgColor} flex items-center justify-center flex-shrink-0`}>
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">Full exam simulation</p>
                <Button size="sm" variant="outline" onClick={() => navigate(`/mock-exam/${quiz.id}`)}>Start Exam</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const HistoryContent = (
    <div ref={el => { sectionRefs.current["history"] = el; }}>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <History className={`w-5 h-5 ${levelColor}`} />
        Mock Exam History
        <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full">Admin View</span>
      </h2>
      {quizAttempts && quizzes && <MockExamHistory attempts={quizAttempts} quizzes={quizzes} />}
    </div>
  );

  const FinalExamContent = (
    <div ref={el => { sectionRefs.current["final-exam"] = el; }}>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <Award className={`w-6 h-6 ${levelColor}`} />
        Final Exam
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {quizzes?.filter(q => q.quiz_type === 'final_exam').map((quiz) => (
          <Card key={quiz.id} className="p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${levelBgColor} flex items-center justify-center flex-shrink-0`}>
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">End-of-course assessment</p>
                <Button size="sm" variant="outline" onClick={() => navigate(`/mock-exam/${quiz.id}`)}>Start Final Exam</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const ReviewsContent = (
    <div ref={el => { sectionRefs.current["reviews"] = el; }}>
      <CourseReviews courseId={course.id} isEnrolled={isEnrolled || false} />
    </div>
  );

  const sectionContentMap: Record<string, React.ReactNode> = {
    overview: OverviewContent,
    lessons: LessonsContent,
    quizzes: QuizzesContent,
    "mock-exams": MockExamsContent,
    history: HistoryContent,
    "final-exam": FinalExamContent,
    reviews: ReviewsContent,
  };

  // Parse syllabus areas for the dashboard
  const parsedSyllabusAreas = syllabusData?.syllabus_areas
    ? (syllabusData.syllabus_areas as Array<{ title: string; weight: string; topics?: string[] }>)
    : [];

  // ── Enrolled admins (not in student view) see the dashboard ──
  if (isEnrolled && isEffectiveAdmin) {
    return (
      <Layout>
        <section className="pt-[4rem] pb-6 lg:pt-[4.5rem] lg:pb-9">
          <div className="container mx-auto px-4">
            <EnrolledCourseDashboard
              course={course}
              lessons={lessons || []}
              lessonProgress={lessonProgress || null}
              readinessScore={readinessScore}
              syllabusAreas={parsedSyllabusAreas}
              quizAttempts={quizAttempts || null}
              quizzes={quizzes || null}
              levelColor={levelColor}
              levelBgColor={levelBgColor}
              onUnenroll={handleUnenroll}
              unenrollPending={unenrollMutation.isPending}
            />
          </div>
        </section>

        <CIMAProfileModal
          open={showCIMAModal}
          onClose={() => {
            setShowCIMAModal(false);
            setPendingEnrollment(false);
          }}
          onSuccess={handleCIMAModalSuccess}
        />
      </Layout>
    );
  }

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description || `CIMA ${course.title}: explore the syllabus, resources and access options.`,
    url: `https://finatix.io/courses/${course.slug}`,
    provider: { "@type": "Organization", name: "Finatix", url: "https://finatix.io" },
    educationalCredentialAwarded: "CIMA Certificate",
    courseCode: course.slug?.toUpperCase(),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.duration_hours ? `PT${course.duration_hours}H` : undefined,
    },
    ...(ratingData?.averageRating && ratingData.totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingData.averageRating.toFixed(1),
        reviewCount: ratingData.totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <Layout>
      <SEOHead
        title={course.title}
        description={course.description || `${course.title} on Finatix: explore the syllabus, resources and access options.`}
        keywords={`CIMA ${course.slug?.toUpperCase()}, ${course.title}, CIMA exam prep, management accounting`}
        canonicalUrl={`https://finatix.io/courses/${course.slug}`}
      />
      <JsonLd schema={courseSchema} id={`course-schema-${course.slug}`} />
      <section className="public-hero course-shell"><div className="container px-5 md:px-8">
        <Breadcrumb className="mb-8"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/courses">CIMA exams</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to={`/courses?level=${course.level}`} className="capitalize">{course.level}</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{course.slug?.split("-")[0].toUpperCase()}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20"><div><p className="eyebrow capitalize">{course.level} level / {course.slug?.split("-")[0].toUpperCase()}</p><h1 className="public-title">{course.title}</h1><p className="mt-5 max-w-xl text-lg text-muted-foreground">{course.description || "CIMA study resources, organised around your exam."}</p>
          <div className="mt-7 flex flex-wrap gap-6 border-y border-border py-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{totalLessons} lessons</span>{Number(course.duration_hours) > 0 && <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />About {course.duration_hours} study hours</span>}{(ratingData?.totalReviews ?? 0) > 0 && <span>{ratingData?.averageRating.toFixed(1)} / 5 · {ratingData?.totalReviews} reviews</span>}</div>
          {syllabusData && <Accordion type="single" collapsible className="mt-6 border-b border-border"><AccordionItem value="syllabus"><AccordionTrigger className="text-left">Exam objectives & syllabus</AccordionTrigger><AccordionContent><p className="mb-4 text-sm text-muted-foreground">{syllabusData.objective}</p><ul className="space-y-2">{parsedSyllabusAreas.map((area) => <li key={area.title} className="text-sm"><span className="font-medium">{area.title}</span>{area.weight && <span className="ml-2 text-muted-foreground">{area.weight}</span>}</li>)}</ul></AccordionContent></AccordionItem></Accordion>}
        </div>
        <aside className="border-t-2 border-primary bg-card p-6 lg:p-8"><p className="eyebrow">Your access</p>
          <div className="mb-6"><p className="font-display text-4xl font-medium">{requiresPayment ? `£${coursePrice.toFixed(0)}` : isPaidCourse && hasMembership ? "Included" : "Free"}</p><p className="mt-2 text-sm text-muted-foreground">{notOnSale ? "Indicative price. Purchasing is currently unavailable." : requiresPayment ? "One-time purchase · lifetime course access" : isPaidCourse && hasMembership ? "Covered by your membership" : "With a Finatix account. No payment needed."}</p></div>
          <Button trace size="lg" className="w-full" onClick={isEnrolled ? handleStartLearning : handleEnroll} disabled={enrollMutation.isPending}>{enrollMutation.isPending ? "Please wait…" : isEnrolled ? "Continue learning" : notOnSale ? "Register interest" : requiresPayment ? "Buy this course" : "Start this course"}<ArrowRight className="h-4 w-4" /></Button>
          {notOnSale && <p className="mt-3 text-xs text-muted-foreground">No payment is taken when you register interest. Existing purchases keep their access.</p>}
          {requiresPayment && !notOnSale && <p className="mt-3 text-xs text-muted-foreground">VAT included. CIMA exam fees are separate.{!user && " You can create an account after payment."}</p>}
          {hasMembership && !isEnrolled && <p className="mt-3 text-xs text-muted-foreground">Your membership covers this exam. Enrol to begin studying.</p>}
          <ul className="mt-6 space-y-3 border-t border-border pt-5">{features.slice(0, 5).map((feature) => <li key={feature} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 shrink-0 text-primary" />{feature}</li>)}</ul>
          <Link to="/pricing" className="mt-6 inline-flex text-sm font-semibold text-primary underline underline-offset-4">Compare access options</Link>
        </aside></div>
      </div></section>

      {/* Everything a visitor needs to judge the teaching before paying */}
      {!isEnrolled && (
        <section className="py-8 lg:py-14">
          <div className="container mx-auto max-w-4xl px-4">
            <CoursePreview
              courseSlug={course.slug}
              courseId={course.id}
              courseTitle={course.title}
              isCaseStudy={isCaseStudyCourse}
              facts={courseFacts}
              syllabusObjective={syllabusData?.objective}
              syllabusAreas={parsedSyllabusAreas}
              lessons={lessons as Array<{ id: string; title: string; description?: string | null; duration_minutes?: number | null }>}
              price={isPaidCourse ? coursePrice : null}
              isFree={!isPaidCourse}
              purchaseAvailable={!notOnSale}
              coveredByMembership={isPaidCourse && hasMembership}
              isAdmin={isEffectiveAdmin}
              onBuy={handleEnroll}
            />
          </div>
        </section>
      )}



      <div id="curriculum" className="scroll-mt-24" aria-hidden="true" />
      {/* Course Content - Mobile: Tabs, Desktop: Side nav + scroll */}
      {navSections.length > 1 && (
        <section className="py-8 lg:py-16">
          <div className="container mx-auto px-4">

            {/* ── Mobile: Tabs ── */}
            {isMobile ? (
              <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                <TabsList className="w-full overflow-x-auto flex justify-start gap-1 bg-muted/50 p-1 rounded-xl mb-6">
                  {navSections.map(s => (
                    <TabsTrigger key={s.key} value={s.key} className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2">
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {navSections.map(s => (
                  <TabsContent key={s.key} value={s.key}>
                    {sectionContentMap[s.key]}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              /* ── Desktop: Sticky side nav + scrollable content ── */
              <div className="grid items-start md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-6 lg:gap-8">
                <div className="hidden md:block sticky top-24 self-start h-fit z-10 space-y-3 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                  <nav className="space-y-1 bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-3 shadow-lg">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">On this page</p>
                    {navSections.map(s => (
                      <button
                        key={s.key}
                        onClick={() => scrollToSection(s.key)}
                        className={`w-full flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-colors text-left ${
                          activeSection === s.key
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {s.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="space-y-16 min-w-0">
                  {navSections.map(s => (
                    <div key={s.key}>{sectionContentMap[s.key]}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* If only overview (not enrolled, not admin), show it directly */}
      {navSections.length <= 1 && (
        <section className="py-8 lg:py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            {OverviewContent}
          </div>
        </section>
      )}

      <CIMAProfileModal
        open={showCIMAModal}
        onClose={() => {
          setShowCIMAModal(false);
          setPendingEnrollment(false);
        }}
        onSuccess={handleCIMAModalSuccess}
      />

      {/* Sticky mobile CTA bar - keeps the buy button in reach on phones/tablets */}
      {!isEnrolled && requiresPayment && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card/95 backdrop-blur-md p-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="container mx-auto px-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-foreground leading-none">£{coursePrice.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground truncate">{notOnSale ? "Price when it opens" : "One-time purchase - lifetime access"}</p>
            </div>
            <Button
              size="lg"
              className="gap-2 flex-shrink-0"
              onClick={handleEnroll}
              disabled={enrollMutation.isPending}
            >
              <ShoppingCart className="w-4 h-4" />
              {notOnSale ? "Register interest" : "Buy this course"}
            </Button>
          </div>
        </div>
      )}

    <Dialog open={showInterest} onOpenChange={setShowInterest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get told when {course.title} opens</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Purchasing for this course is currently unavailable.
            Nothing is charged, and registering interest doesn't commit you to buying.
          </p>
          <InterestRegistrationForm courseId={course.id} courseName={course.title} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CourseDetail;
