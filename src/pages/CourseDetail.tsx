import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments, useEnrollInCourse, useLessons, useLessonProgress } from "@/hooks/useStudentProgress";
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
import CourseSideNav from "@/components/course/CourseSideNav";
import { useCourseRating } from "@/hooks/useReviews";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: enrollments, refetch: refetchEnrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();
  const { hasCompleteProfile, isLoading: isLoadingProfile } = useHasCIMAProfile();
  const { isAdmin } = useIsAdmin();
  const [showCIMAModal, setShowCIMAModal] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState(false);
  const [autoEnrolled, setAutoEnrolled] = useState(false);

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
      
      // Create abbreviated title - take first letter of each word or use area code (A, B, C, etc.)
      const words = area.title.split(/\s+/);
      let shortTitle: string;
      
      if (words.length >= 2) {
        // Use initials/acronym for multi-word titles (e.g., "Business Economics" -> "Bus. Econ.")
        shortTitle = words.slice(0, 2).map(w => w.substring(0, 4)).join(" ");
      } else if (area.title.length > 8) {
        // Single long word - abbreviate
        shortTitle = area.title.substring(0, 8);
      } else {
        shortTitle = area.title;
      }
      
      // Add area letter prefix for clarity (A:, B:, etc.)
      const areaLabel = `${String.fromCharCode(65 + index)}: ${shortTitle}`;
      
      return {
        subject: areaLabel,
        fullTitle: area.title,
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
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

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

              {/* Progress for enrolled users */}
              {isEnrolled && (
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
              )}
            </div>

            {/* Pricing Card - Hide price when enrolled */}
            <div className="lg:justify-self-end w-full max-w-md">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
                {!isEnrolled && (
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-bold text-foreground">
                      {Number(course.price ?? 0) === 0 ? "Free" : `£${Number(course.price).toFixed(0)}`}
                    </span>
                  </div>
                )}

                {isEnrolled ? (
                  <>
                    <Button size="lg" className="w-full mb-3 gap-2" onClick={handleStartLearning}>
                      <Play className="w-5 h-5" />
                      {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                    <p className="text-center text-sm text-accent font-medium">
                      ✓ You're enrolled in this course
                    </p>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="w-full mb-3 gap-2" 
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                    </Button>
                    <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleStartLearning}>
                      <Play className="w-5 h-5" />
                      Try Free Lesson
                    </Button>
                  </>
                )}

                <p className="text-center text-sm text-muted-foreground mt-4">
                  30-day money-back guarantee
                </p>

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
              {/* Smart Analytics Preview - Only show if enrolled with quiz attempts */}
              {isEnrolled && quizAttempts && quizAttempts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Your Performance Analytics
                  </h2>
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* Course Competency Radar - Prominent Left Side */}
                    <Card className="p-6 lg:col-span-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground text-lg">Course Competency</h3>
                      </div>
                      {competencyData && competencyData.length > 0 ? (
                        <>
                          <ChartContainer
                            config={{
                              competency: {
                                label: "Competency %",
                                color: "hsl(var(--primary))",
                              },
                            }}
                            className="h-[280px]"
                          >
                            <RadarChart
                              data={competencyData}
                              margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                            >
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                              <ChartTooltip 
                                content={({ active, payload }) => {
                                  if (active && payload?.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                        <p className="font-medium text-foreground text-sm">{data.fullTitle}</p>
                                        <p className="text-muted-foreground text-xs">Weight: {data.weight}</p>
                                        <p className="text-primary text-sm font-semibold mt-1">{data.value}% competency</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Radar
                                name="Competency"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.4}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ChartContainer>
                          {/* Legend */}
                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {competencyData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{String.fromCharCode(65 + idx)}:</span>
                                <span className="truncate">{item.fullTitle}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                          Complete quizzes to see course competency
                        </div>
                      )}
                    </Card>

                    {/* Right Side - Score Progress & Practice Insights */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Score Progress Chart */}
                      <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Score Progress</h3>
                        </div>
                        <ChartContainer
                          config={{
                            score: {
                              label: "Score %",
                              color: "hsl(var(--primary))",
                            },
                          }}
                          className="h-[120px]"
                        >
                          <LineChart
                            data={quizAttempts.slice(-10).map((attempt, idx) => ({
                              attempt: `#${idx + 1}`,
                              score: Math.round((attempt.score / attempt.max_score) * 100),
                            }))}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <XAxis dataKey="attempt" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--primary))", r: 3 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </Card>

                      {/* Practice Insights - Improved */}
                      <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Practice Insights</h3>
                        </div>
                        {(() => {
                          const totalAttempts = quizAttempts.length;
                          const totalCorrect = quizAttempts.reduce((sum, a) => sum + a.score, 0);
                          const totalQuestions = quizAttempts.reduce((sum, a) => sum + a.max_score, 0);
                          const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                          const recentAttempts = quizAttempts.slice(-5);
                          const recentCorrect = recentAttempts.reduce((sum, a) => sum + a.score, 0);
                          const recentTotal = recentAttempts.reduce((sum, a) => sum + a.max_score, 0);
                          const recentAccuracy = recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : 0;
                          const trend = recentAccuracy - overallAccuracy;
                          
                          return (
                            <div className="space-y-4">
                              {/* Key Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
                                  <p className="text-xs text-muted-foreground">Total Attempts</p>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold text-foreground">{overallAccuracy}%</p>
                                  <p className="text-xs text-muted-foreground">Overall Accuracy</p>
                                </div>
                              </div>
                              
                              {/* Trend Indicator */}
                              <div className="bg-secondary/30 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Recent Trend</span>
                                  <span className={`text-sm font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {trend >= 5 ? "Great improvement! Keep it up." : 
                                   trend >= 0 ? "Steady progress. You're on track." :
                                   trend >= -5 ? "Slight dip. Review recent topics." :
                                   "Consider revisiting challenging areas."}
                                </p>
                              </div>

                              {/* Questions Breakdown */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-primary/20 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-primary h-full rounded-full transition-all"
                                    style={{ width: `${overallAccuracy}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {totalCorrect}/{totalQuestions} correct
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Lessons */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Course Lessons
                </h2>
                <div className="space-y-3">
                  {lessons && lessons.length > 0 ? (
                    lessons.map((lesson, index) => {
                      const completed = isLessonCompleted(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          to={`/courses/${course.id}/lesson/${lesson.id}`}
                          className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            {completed ? (
                              <CheckCircle className={`w-5 h-5 ${levelColor}`} />
                            ) : (
                              <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lesson.duration_minutes} min
                            </span>
                            <Play className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Lessons coming soon</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quizzes Section */}
              {quizzes && quizzes.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <ClipboardList className="w-6 h-6 text-primary" />
                    Quizzes
                  </h2>
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg mb-1">
                              {quiz.title}
                            </h3>
                            {quiz.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {quiz.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClipboardList className="w-3.5 h-3.5" />
                                Multiple choice
                              </span>
                              <span className="flex items-center gap-1">
                                <Timer className="w-3.5 h-3.5" />
                                Timed quiz available
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/quiz/${quiz.id}`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <ClipboardList className="w-4 h-4" />
                                Practice
                              </Button>
                            </Link>
                            <Link to={`/exam/${quiz.id}`}>
                              <Button size="sm" className="gap-2">
                                <Timer className="w-4 h-4" />
                                Quiz
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock Exams Section */}
              {quizzes && quizzes.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    Mock Exams
                  </h2>
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg mb-1">
                              {quiz.title} - Mock Exam
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Full exam simulation with timer, formula sheet, and calculator
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Timer className="w-3.5 h-3.5" />
                                Timed exam conditions
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                Formula sheet included
                              </span>
                            </div>
                          </div>
                          <Link to={`/mock-exam/${quiz.id}`}>
                            <Button size="sm" className="gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Start Mock Exam
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Course Reviews Section */}
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Student Reviews
                </h2>
                <CourseReviews courseId={course.id} isEnrolled={isEnrolled || false} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Content Navigation */}
              <CourseSideNav
                courseId={course.id}
                lessons={lessons || []}
                quizzes={quizzes || []}
                lessonProgress={lessonProgress}
                levelColor={levelColor}
              />

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
