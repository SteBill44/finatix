import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments, useEnrollInCourse, useUnenrollFromCourse, useLessons, useLessonProgress } from "@/hooks/useStudentProgress";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useHasCIMAProfile } from "@/hooks/useCIMAProfile";
import { useIsAdmin } from "@/hooks/useUserRole";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import CourseReviews from "@/components/CourseReviews";
import InterestRegistrationForm from "@/components/InterestRegistrationForm";
import MockExamHistory from "@/components/course/MockExamHistory";
import CourseSideNav from "@/components/course/CourseSideNav";
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
  const { data: enrollments, refetch: refetchEnrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();
  const { hasCompleteProfile, isLoading: isLoadingProfile } = useHasCIMAProfile();
  const { isAdmin } = useIsAdmin();
  const [showCIMAModal, setShowCIMAModal] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState(false);
  const [autoEnrolled, setAutoEnrolled] = useState(false);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);

  // Fetch course from database
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      // Try to find by slug first, then by id
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

  // Fetch syllabus from database
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

  // Fetch lessons for this course
  const { data: lessons } = useLessons(course?.id);
  const { data: lessonProgress } = useLessonProgress(course?.id);
  const { data: quizzes } = useQuizzes(course?.id);
  const { data: ratingData } = useCourseRating(course?.id || "");
  const { data: readinessScore } = useReadinessScore(course?.id || "");

  // Fetch quiz attempts for analytics
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

  // Fetch quiz questions with syllabus area mapping for competency analysis
  const { data: quizQuestionsWithAreas } = useQuery({
    queryKey: ["quiz-questions-areas", course?.id],
    queryFn: async () => {
      // Get all quizzes for this course
      const { data: courseQuizzes, error: quizzesError } = await supabase
        .from("quizzes")
        .select("id")
        .eq("course_id", course!.id);
      
      if (quizzesError) throw quizzesError;
      if (!courseQuizzes?.length) return [];

      const quizIds = courseQuizzes.map(q => q.id);
      
      // Get questions with syllabus_area_index
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("id, quiz_id, syllabus_area_index")
        .in("quiz_id", quizIds);
      
      if (questionsError) throw questionsError;
      return questions || [];
    },
    enabled: !!course?.id,
  });

  // Calculate competency data per syllabus area
  const competencyData = React.useMemo(() => {
    if (!syllabusData?.syllabus_areas || !quizAttempts?.length) {
      return null;
    }

    const syllabusAreas = syllabusData.syllabus_areas as Array<{ title: string; weight: string; topics: string[] }>;
    
    // For now, distribute quiz performance across syllabus areas
    // In a full implementation, this would use question-level tracking
    const totalScore = quizAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalMax = quizAttempts.reduce((sum, a) => sum + a.max_score, 0);
    const avgPerformance = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    // Create data points for each syllabus area with simulated variance
    return syllabusAreas.map((area, index) => {
      // Add some variance based on area index to show differentiation
      const variance = ((index * 7) % 20) - 10; // Range: -10 to +10
      const value = Math.max(0, Math.min(100, avgPerformance + variance));
      
      // Extract clean title - remove existing "A:", "B:" prefix if present
      let cleanTitle = area.title.replace(/^[A-Z]:\s*/, '').trim();
      
      // Create meaningful short label - filter out common words and take key terms
      const stopWords = ['the', 'of', 'and', 'in', 'to', 'for', 'a', 'an', 'context'];
      const words = cleanTitle.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()));
      
      // Take the most meaningful word(s)
      let shortTitle: string;
      if (words.length >= 1) {
        // Take first significant word, capitalize properly
        const mainWord = words[0];
        shortTitle = mainWord.length > 12 ? mainWord.substring(0, 10) + "." : mainWord;
      } else {
        shortTitle = `Area ${String.fromCharCode(65 + index)}`;
      }
      
      return {
        subject: shortTitle,
        fullTitle: cleanTitle,
        value,
        weight: area.weight,
      };
    });
  }, [syllabusData, quizAttempts]);

  // Check enrollment status
  const isEnrolled = enrollments?.some((e) => e.course_id === course?.id);

  const completedLessons = lessonProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress?.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please sign in to enroll");
      navigate("/auth");
      return;
    }

    if (!course) return;

    // Check if user has complete CIMA profile
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
    if (pendingEnrollment) {
      performEnrollment();
    }
  };

  const handleStartLearning = () => {
    if (lessons && lessons.length > 0) {
      // Find first incomplete lesson or start from beginning
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute bottom-20 -right-20 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10 overflow-hidden">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground">
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-foreground/50" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/courses" className="text-primary-foreground/70 hover:text-primary-foreground">
                    Courses
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-foreground/50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary-foreground font-medium">
                  {course.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4 capitalize">
                {course.level} Level
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-6">
                {course.description || "Comprehensive course designed to help you master the exam content and pass with confidence."}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration_hours || 40} hours</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <BookOpen className="w-5 h-5" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>
                    {ratingData?.averageRating.toFixed(1) || "0.0"} ({ratingData?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Course Objectives Dropdown */}
              <div className="mb-8">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="objectives" className="border border-primary-foreground/20 rounded-xl bg-primary-foreground/5 backdrop-blur-sm px-5 overflow-hidden">
                    <AccordionTrigger className="text-base font-semibold text-primary-foreground hover:no-underline py-4 [&[data-state=open]>div>svg]:rotate-0">
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
                          <p className="text-sm text-primary-foreground/80">
                            Course objectives and syllabus information coming soon.
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Progress and Readiness for enrolled users */}
              {isEnrolled && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary-foreground">Your Progress</span>
                      <span className="text-sm text-primary-foreground">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                      <div 
                        className={`${levelBgColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-primary-foreground/70 mt-2">
                      {completedLessons} of {totalLessons} lessons completed
                    </p>
                  </div>
                  <ReadinessScoreCard courseId={course.id} compact />
                </div>
              )}
            </div>

            {/* Pricing Card */}
            <div className="lg:justify-self-end w-full max-w-md">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
                {/* Coming Soon Badge */}
                <div className="flex items-center justify-center mb-6">
                  <span className="px-4 py-2 rounded-full bg-accent/20 text-accent font-semibold text-lg">
                    Coming Soon
                  </span>
                </div>

                {isEnrolled ? (
                  <>
                    <Button size="lg" className="w-full mb-3 gap-2" onClick={handleStartLearning}>
                      <Play className="w-5 h-5" />
                      {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                    <p className="text-center text-sm text-accent font-medium mb-3">
                      ✓ You're enrolled in this course
                    </p>
                    
                    <AlertDialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <UserMinus className="w-4 h-4" />
                          Unenroll from Course
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Unenroll from course?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unenroll from <strong>{course.title}</strong>? 
                            Your progress will be lost and you'll need to re-enroll to access the course again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleUnenroll}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={unenrollMutation.isPending}
                          >
                            {unenrollMutation.isPending ? "Unenrolling..." : "Unenroll"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
                      Be the first to know
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center">
                      Register your interest and we'll notify you when this course launches.
                    </p>
                    <InterestRegistrationForm 
                      courseId={course.id} 
                      courseName={course.title} 
                    />
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-4">This course includes:</h4>
                  <ul className="space-y-3">
                    {features.slice(0, 5).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle className={`w-5 h-5 ${levelColor} flex-shrink-0`} />
                        {feature}
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


      {/* Course Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">

              {/* Lessons - Hidden for now */}

              {/* Lesson Quizzes - Hidden for now */}

              {/* Mock Exams - Hidden for now */}

              {/* Mock Exam Results History - Only show if enrolled with mock exam attempts */}
              {/* Mock Exam Results - Hidden for now */}

              {/* Performance Analytics - Hidden for now */}


              {/* Student Reviews - Hidden for now */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Readiness Score - Only for enrolled users */}
              {isEnrolled && (
                <>
                  <ReadinessScoreCard courseId={course.id} />
                  {readinessScore?.weakAreas && readinessScore.weakAreas.length > 0 && (
                    <StudyRecommendations
                      courseSlug={course.slug}
                      weakAreas={readinessScore.weakAreas}
                      overallScore={readinessScore.overall}
                    />
                  )}
                </>
              )}

              {/* Course Content Navigation - Hidden for now */}

              {/* All Features */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className={`w-5 h-5 ${levelColor}`} />
                  All Course Features
                </h3>
                <ul className="space-y-3">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className={`w-4 h-4 ${levelColor} flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Courses */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {["BA2", "BA3", "BA4"].map((code) => (
                    <Link
                      key={code}
                      to={`/courses/${code.toLowerCase()}`}
                      className="block p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="font-medium text-foreground">{code}</span>
                      <p className="text-sm text-muted-foreground">Operational Level</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
};

export default CourseDetail;
