import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
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
import { useEnrollments, useEnrollInCourse, useUnenrollFromCourse, useLessons, useLessonProgress } from "@/hooks/useStudentProgress";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useHasCIMAProfile } from "@/hooks/useCIMAProfile";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAdminView } from "@/contexts/AdminViewContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
} from "lucide-react";
import CourseReviews from "@/components/CourseReviews";
import InterestRegistrationForm from "@/components/InterestRegistrationForm";
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

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseId)
        .maybeSingle();

      if (!data) {
        const result = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

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

  const { data: lessons } = useLessons(course?.id);
  const { data: lessonProgress } = useLessonProgress(course?.id);
  const { data: quizzes } = useQuizzes(course?.id);
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
      return data;
    },
    enabled: !!course?.id && !!user?.id,
  });

  const isEnrolled = enrollments?.some((e) => e.course_id === course?.id);
  const completedLessons = lessonProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress?.some((p) => p.lesson_id === lessonId && p.completed);
  };

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

  const scrollToSection = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please sign in to enroll");
      navigate("/auth");
      return;
    }
    if (!course) return;
    if (!hasCompleteProfile && !isLoadingProfile) {
      setPendingEnrollment(true);
      setShowCIMAModal(true);
      return;
    }
    await performEnrollment();
  };

  const performEnrollment = async () => {
    if (!course) return;
    try {
      await enrollMutation.mutateAsync(course.id);
      toast.success(`Successfully enrolled in ${course.title}!`);
      setPendingEnrollment(false);
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.info("You're already enrolled in this course");
      } else {
        toast.error(error.message || "Failed to enroll");
      }
    }
  };

  const handleCIMAModalSuccess = () => {
    if (pendingEnrollment) performEnrollment();
  };

  const handleStartLearning = () => {
    if (lessons && lessons.length > 0) {
      const firstIncomplete = lessons.find((l) => !isLessonCompleted(l.id));
      const targetLesson = firstIncomplete || lessons[0];
      navigate(`/courses/${course?.id}/lesson/${targetLesson.id}`);
    }
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

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "certificate": return "text-orange";
      case "operational": return "text-primary";
      case "management": return "text-purple";
      case "strategic": return "text-red";
      default: return "text-primary";
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "certificate": return "bg-orange";
      case "operational": return "bg-primary";
      case "management": return "bg-purple";
      case "strategic": return "bg-red";
      default: return "bg-primary";
    }
  };

  const levelColor = getLevelColor(course?.level || "");
  const levelBgColor = getLevelBgColor(course?.level || "");

  const features = [
    `${course.duration_hours || 40}+ hours of video content`,
    "500+ practice questions",
    "5 full mock exams",
    "Competency-based progress tracking",
    "Weak area identification",
    "Mobile app access",
    "24/7 community support",
    "Certificate of completion"
  ];

  // Build navigation sections
  const navSections = [
    { key: "overview", label: "Overview", icon: FileText, show: true },
    { key: "lessons", label: "Lessons", icon: BookOpen, show: isEnrolled && totalLessons > 0 },
    { key: "quizzes", label: "Quizzes", icon: ClipboardList, show: isEffectiveAdmin && quizzes && quizzes.length > 0 },
    { key: "mock-exams", label: "Mock Exams", icon: GraduationCap, show: isEffectiveAdmin && quizzes && quizzes.length > 0 },
    { key: "history", label: "Exam History", icon: History, show: isEffectiveAdmin && isEnrolled && !!quizAttempts?.length },
    { key: "reviews", label: "Reviews", icon: Star, show: isEffectiveAdmin },
  ].filter(s => s.show);

  // ── Shared content blocks ──
  const OverviewContent = (
    <div ref={el => { sectionRefs.current["overview"] = el; }}>
      {/* Progress & Readiness for enrolled */}
      {isEnrolled && !(isAdmin && isStudentView) && (
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-secondary rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Your Progress</span>
              <span className="text-sm text-foreground">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`${levelBgColor} h-2 rounded-full transition-all duration-300`} style={{ width: `${progressPercentage}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{completedLessons} of {totalLessons} lessons completed</p>
          </div>
          <ReadinessScoreCard courseId={course.id} compact />
          {readinessScore?.weakAreas && readinessScore.weakAreas.length > 0 && (
            <StudyRecommendations courseSlug={course.slug} weakAreas={readinessScore.weakAreas} overallScore={readinessScore.overall} />
          )}
        </div>
      )}

      {/* Course features */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">This course includes</h3>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className={`w-4 h-4 ${levelColor} flex-shrink-0`} />
              {feature}
            </li>
          ))}
        </ul>
      </Card>
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
          const isLocked = !isEnrolled && index > 0;
          return (
            <Card
              key={lesson.id}
              className={`p-4 transition-all duration-200 ${isLocked ? "opacity-60" : "hover:shadow-md cursor-pointer"}`}
              onClick={() => !isLocked && navigate(`/courses/${course.id}/lesson/${lesson.id}`)}
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
        {quizzes?.map((quiz) => (
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
        {quizzes?.map((quiz) => (
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
    reviews: ReviewsContent,
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute bottom-20 -right-20 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10 overflow-hidden">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground">
                    <Home className="w-4 h-4" />Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-foreground/50" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/courses" className="text-primary-foreground/70 hover:text-primary-foreground">Courses</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-foreground/50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary-foreground font-medium">{course.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4 capitalize">
                {course.level} Level
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">{course.title}</h1>
              <p className="text-lg text-primary-foreground/80 mb-6">
                {course.description || "Comprehensive course designed to help you master the exam content and pass with confidence."}
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Clock className="w-5 h-5" /><span>{course.duration_hours || 40} hours</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <BookOpen className="w-5 h-5" /><span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>{ratingData?.averageRating.toFixed(1) || "0.0"} ({ratingData?.totalReviews || 0} reviews)</span>
                </div>
              </div>

              {/* Syllabus Accordion */}
              <Accordion type="single" collapsible defaultValue="objectives" className="w-full">
                <AccordionItem value="objectives" className="border border-primary-foreground/20 rounded-xl bg-primary-foreground/5 backdrop-blur-sm px-5 overflow-hidden">
                  <AccordionTrigger className="text-base font-semibold text-primary-foreground hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                      Course Objectives & Syllabus
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="text-primary-foreground/90">
                      {syllabusData ? (
                        <>
                          {syllabusData.objective && (
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> {syllabusData.objective}
                            </p>
                          )}
                          {Array.isArray(syllabusData.syllabus_areas) && syllabusData.syllabus_areas.length > 0 && (
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              {(syllabusData.syllabus_areas as Array<{ title: string; weight: string; topics: string[] }>).map((area, index) => (
                                <li key={index}>
                                  <h4 className="font-semibold text-primary-foreground mb-1.5">
                                    • {area.title} {area.weight && `(${area.weight})`}
                                  </h4>
                                  {area.topics && area.topics.length > 0 && (
                                    <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                      {area.topics.map((topic, topicIndex) => (
                                        <li key={topicIndex}>{topic}</li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-primary-foreground/80">Course objectives and syllabus information coming soon.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Pricing Card */}
            <div className="lg:justify-self-end w-full max-w-md">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <span className="px-4 py-2 rounded-full bg-accent/20 text-accent font-semibold text-lg">Coming Soon</span>
                </div>

                {isEnrolled ? (
                  <>
                    <Button size="lg" className="w-full mb-3 gap-2" onClick={handleStartLearning}>
                      <Play className="w-5 h-5" />
                      {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                    <p className="text-center text-sm text-accent font-medium mb-3">✓ You're enrolled in this course</p>
                    
                    <AlertDialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <UserMinus className="w-4 h-4" />Unenroll from Course
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Unenroll from course?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unenroll from <strong>{course.title}</strong>? Your progress will be lost and you'll need to re-enroll to access the course again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleUnenroll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={unenrollMutation.isPending}>
                            {unenrollMutation.isPending ? "Unenrolling..." : "Unenroll"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-foreground mb-2 text-center">Be the first to know</h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center">Register your interest and we'll notify you when this course launches.</p>
                    <InterestRegistrationForm courseId={course.id} courseName={course.title} />
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-4">This course includes:</h4>
                  <ul className="space-y-3">
                    {features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle className={`w-5 h-5 ${levelColor} flex-shrink-0`} />{feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Course Content — Mobile: Tabs, Desktop: Side nav + scroll */}
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
              <div className="grid md:grid-cols-[minmax(0,1fr)_200px] lg:grid-cols-[minmax(0,1fr)_240px] gap-6 lg:gap-8">
                <div className="space-y-16 min-w-0">
                  {navSections.map(s => (
                    <div key={s.key}>{sectionContentMap[s.key]}</div>
                  ))}
                </div>

                <div className="hidden md:block relative z-10">
                  <nav className="sticky top-20 lg:top-24 space-y-1 bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-4 shadow-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</p>
                    {navSections.map(s => (
                      <button
                        key={s.key}
                        onClick={() => scrollToSection(s.key)}
                        className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors text-left ${
                          activeSection === s.key
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <s.icon className="w-4 h-4 flex-shrink-0" />
                        {s.label}
                      </button>
                    ))}
                  </nav>
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
    </Layout>
  );
};

export default CourseDetail;
