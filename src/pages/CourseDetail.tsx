import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments, useEnrollInCourse, useLessons, useLessonProgress, useQuizAttempts } from "@/hooks/useStudentProgress";
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
  BarChart2,
  ArrowLeft,
  ShoppingCart,
  Lock,
  MessageSquare,
  GraduationCap,
  Timer,
  ClipboardList,
  TrendingUp,
  Brain,
} from "lucide-react";
import CourseReviews from "@/components/CourseReviews";
import { useCourseRating } from "@/hooks/useReviews";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
} from "recharts";

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

  // Fetch lessons for this course
  const { data: lessons } = useLessons(course?.id);
  const { data: lessonProgress } = useLessonProgress(course?.id);
  const { data: quizzes } = useQuizzes(course?.id);
  const { data: ratingData } = useCourseRating(course?.id || "");
  const { data: quizAttempts } = useQuizAttempts();

  // Filter quiz attempts for this course
  const courseQuizAttempts = quizAttempts?.filter(a => a.course_id === course?.id) || [];
  
  // Calculate course-specific analytics
  const totalAttempts = courseQuizAttempts.length;
  const averageScore = totalAttempts > 0
    ? Math.round(courseQuizAttempts.reduce((acc, q) => acc + (q.score / q.max_score) * 100, 0) / totalAttempts)
    : 0;

  // Generate score progress data from actual attempts (last 8)
  const scoreProgressData = courseQuizAttempts
    .slice(0, 8)
    .reverse()
    .map((attempt, index) => ({
      attempt: `#${index + 1}`,
      score: Math.round((attempt.score / attempt.max_score) * 100),
    }));

  // Check enrollment status
  const isEnrolled = enrollments?.some((e) => e.course_id === course?.id);

  // Auto-enroll admins in courses
  useEffect(() => {
    const autoEnrollAdmin = async () => {
      if (isAdmin && user && course && !isEnrolled && !autoEnrolled) {
        try {
          await enrollMutation.mutateAsync(course.id);
          setAutoEnrolled(true);
          refetchEnrollments();
        } catch (error: any) {
          // Ignore duplicate enrollment errors
          if (!error.message?.includes("duplicate")) {
            console.error("Auto-enroll failed:", error);
          }
        }
      }
    };
    autoEnrollAdmin();
  }, [isAdmin, user, course, isEnrolled, autoEnrolled]);

  // Syllabus areas for all courses
  const getSyllabusAreas = (slug: string) => {
    if (slug === "ba1-business-economics") {
      return [
        { subject: "A: Macroeconomic", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Microeconomic", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "C: Informational", score: averageScore > 0 ? Math.min(100, averageScore + 10) : 0, fullMark: 100 },
        { subject: "D: Financial", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
      ];
    }
    if (slug === "ba2-management-accounting") {
      return [
        { subject: "A: Nature of MA", score: averageScore > 0 ? Math.min(100, averageScore + 8) : 0, fullMark: 100 },
        { subject: "B: Cost Accounting", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "C: Budgeting", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Performance", score: averageScore > 0 ? Math.max(0, averageScore - 10) : 0, fullMark: 100 },
      ];
    }
    if (slug === "ba3-financial-accounting") {
      return [
        { subject: "A: Principles", score: averageScore > 0 ? Math.min(100, averageScore + 8) : 0, fullMark: 100 },
        { subject: "B: Recording", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
        { subject: "C: Preparation", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Analysis", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
      ];
    }
    if (slug === "ba4-ethics-governance-law") {
      return [
        { subject: "A: Business Ethics", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Corporate Governance", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "C: Legal Framework", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "D: Contract Law", score: averageScore > 0 ? Math.min(100, averageScore + 3) : 0, fullMark: 100 },
        { subject: "E: Employment Law", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
      ];
    }
    if (slug === "e1-managing-finance") {
      return [
        { subject: "A: Role of Finance", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Technology", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "C: Data & Info", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "D: Structure", score: averageScore > 0 ? Math.min(100, averageScore + 8) : 0, fullMark: 100 },
        { subject: "E: Interacting", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
      ];
    }
    if (slug === "e2-managing-performance") {
      return [
        { subject: "A: Business Models", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Managing People", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "C: Managing Projects", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
      ];
    }
    if (slug === "e3-strategic-management") {
      return [
        { subject: "A: Strategy Process", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Digital Strategy", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "C: Finance & Org", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "D: Strategic Control", score: averageScore > 0 ? Math.min(100, averageScore + 3) : 0, fullMark: 100 },
        { subject: "E: Strategic Options", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
        { subject: "F: Ecosystem", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
      ];
    }
    if (slug === "p1-management-accounting") {
      return [
        { subject: "A: Cost Accounting", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Budgeting", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
        { subject: "C: Short-Term Decisions", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Risk & Uncertainty", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
      ];
    }
    if (slug === "p2-advanced-management-accounting") {
      return [
        { subject: "A: Managing Costs", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Capital Investment", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
        { subject: "C: Business Units", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Risk & Control", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
      ];
    }
    if (slug === "p3-risk-management") {
      return [
        { subject: "A: Enterprise Risk", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Strategic Risk", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
        { subject: "C: Internal Controls", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Cyber Risks", score: averageScore > 0 ? Math.max(0, averageScore - 8) : 0, fullMark: 100 },
      ];
    }
    if (slug === "f1-financial-reporting") {
      return [
        { subject: "A: Regulatory", score: averageScore > 0 ? Math.min(100, averageScore + 8) : 0, fullMark: 100 },
        { subject: "B: Financial Statements", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
        { subject: "C: Taxation", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Working Capital", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
      ];
    }
    if (slug === "f2-advanced-financial-reporting") {
      return [
        { subject: "A: Long-Term Finance", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Reporting Standards", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
        { subject: "C: Group Accounts", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Integrated Reporting", score: averageScore > 0 ? Math.min(100, averageScore + 8) : 0, fullMark: 100 },
        { subject: "E: Analysis", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
      ];
    }
    if (slug === "f3-financial-strategy") {
      return [
        { subject: "A: Financial Policy", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
        { subject: "B: Long-Term Finance", score: averageScore > 0 ? Math.max(0, averageScore - 3) : 0, fullMark: 100 },
        { subject: "C: Financial Risks", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
        { subject: "D: Business Valuation", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
      ];
    }
    // Default fallback for other courses
    return [
      { subject: "Topic A", score: averageScore > 0 ? Math.min(100, averageScore + 10) : 0, fullMark: 100 },
      { subject: "Topic B", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
      { subject: "Topic C", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
      { subject: "Topic D", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
    ];
  };

  const competencyData = getSyllabusAreas(course?.slug || "");

  // Question history based on attempts
  const correctTotal = courseQuizAttempts.reduce((acc, a) => acc + a.score, 0);
  const incorrectTotal = courseQuizAttempts.reduce((acc, a) => acc + (a.max_score - a.score), 0);

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
                        {course.slug === "ba1-business-economics" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> The BA1 syllabus is divided into <strong className="text-primary-foreground">four key syllabus areas</strong>, each with specific weightings and topics. These areas reflect the economic and operating context of business and the numerical techniques to support decision-making.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: The Macroeconomic Environment (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>National income and economic growth</li>
                                  <li>Inflation, unemployment, and economic policies (fiscal and monetary)</li>
                                  <li>Institutional factors (e.g., government, central banks, international organizations)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Microeconomic and Organisational Context of Business (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Goals and governance of organizations</li>
                                  <li>Supply and demand (including elasticity)</li>
                                  <li>Costs, revenue, and profit maximization</li>
                                  <li>Market structures (perfect competition, monopoly, oligopoly, etc.)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Informational Context of Business (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Data collection and analysis</li>
                                  <li>Forecasting and its role in decision-making</li>
                                  <li>Big data and its implications for business</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Financial Context of Business (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Financial markets and institutions</li>
                                  <li>Foreign exchange and international trade</li>
                                  <li>Interest rates and their impact on business</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "ba2-management-accounting" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> BA2 introduces the principles and techniques of management accounting, focusing on providing information for internal decision-making, planning, control, and performance evaluation. It equips learners with skills to support managers in optimizing business operations and achieving strategic goals.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: The Nature, Source, and Purpose of Management Accounting (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Definition and role of management accounting</li>
                                  <li>Comparison with financial accounting</li>
                                  <li>Types of data and information for planning, decision-making, and control</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Cost Accounting Techniques (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Cost classification (e.g., fixed, variable, direct, indirect)</li>
                                  <li>Costing methods: absorption costing, marginal costing</li>
                                  <li>Accounting for materials, labor, and overheads</li>
                                  <li>Cost-volume-profit (CVP) analysis</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Budgeting and Standard Costing (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Budget preparation (functional, cash, master budgets)</li>
                                  <li>Forecasting techniques and budget coordination</li>
                                  <li>Standard costing and variance analysis (material, labor, overhead)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Performance Measurement and Short-Term Decision-Making (35%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Short-term decisions (e.g., make-or-buy, pricing, limiting factors)</li>
                                  <li>Relevant costs and benefits analysis</li>
                                  <li>Performance measurement (financial and non-financial indicators)</li>
                                  <li>Responsibility accounting and divisional performance</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "ba3-financial-accounting" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> BA3 provides the foundational knowledge and skills to prepare, record, and interpret financial accounts for external reporting. It introduces learners to the double-entry system, financial statement preparation, and basic analysis, preparing them for compliance with accounting standards.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Accounting Principles, Concepts, and Regulations (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Purpose and scope of financial accounting</li>
                                  <li>Fundamental accounting principles (e.g., accruals, going concern)</li>
                                  <li>Overview of regulatory frameworks (e.g., IFRS, IASB)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Recording Accounting Transactions (50%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Double-entry bookkeeping and ledger accounts</li>
                                  <li>Books of prime entry (e.g., sales, purchases, cash)</li>
                                  <li>Adjustments: accruals, prepayments, depreciation, bad debts</li>
                                  <li>Inventory valuation and cost of sales</li>
                                  <li>Non-current assets (acquisition, depreciation, disposal)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Preparation of Accounts for Single Entities (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Trial balance and correction of errors</li>
                                  <li>Preparation of income statements and balance sheets for sole traders</li>
                                  <li>Basic adjustments in financial statements</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Analysis of Financial Statements (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Introduction to ratio analysis (e.g., profitability, liquidity)</li>
                                  <li>Interpretation of financial statements</li>
                                  <li>Limitations of financial analysis</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "ba4-ethics-governance-law" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> BA4 integrates ethical considerations, corporate governance principles, and foundational business law to ensure learners understand the ethical and legal context of business operations. It prepares students to navigate moral dilemmas, governance structures, and legal obligations in a professional setting.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Business Ethics (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Definition and importance of ethics in business</li>
                                  <li>Ethical theories and decision-making frameworks</li>
                                  <li>Professional ethics (e.g., CIMA Code of Ethics)</li>
                                  <li>Ethical issues (e.g., conflicts of interest, whistleblowing)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Corporate Governance (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Principles and objectives of corporate governance</li>
                                  <li>Roles of boards, directors, and stakeholders</li>
                                  <li>Governance mechanisms (e.g., audits, internal controls)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: The Legal Framework (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Sources of law (e.g., statute, common law)</li>
                                  <li>Legal systems and their impact on business</li>
                                  <li>Dispute resolution (courts, arbitration)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Contract Law (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Formation of contracts (offer, acceptance, consideration)</li>
                                  <li>Terms of contracts (express, implied)</li>
                                  <li>Breach of contract and remedies (e.g., damages)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• E: Employment Law and Other Legal Areas (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Employment contracts and employee rights</li>
                                  <li>Discrimination, health, and safety regulations</li>
                                  <li>Tort law (e.g., negligence)</li>
                                  <li>Business structures and data protection (e.g., GDPR)</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "e1-managing-finance" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> Understand how finance supports organizational success in a digital environment. Learners should be able to explain the role of the finance function, assess technology impact, understand data importance, analyze finance team structures, and demonstrate cross-functional collaboration.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Role of the Finance Function (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Purpose of finance: value creation, stewardship, decision support</li>
                                  <li>Activities: planning, budgeting, performance monitoring, risk management</li>
                                  <li>Governance principles and ethical frameworks</li>
                                  <li>Stakeholder mapping and influence (Mendelow's matrix)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Technology in a Digital World (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Emerging technologies: AI, blockchain, IoT, cloud computing, RPA</li>
                                  <li>Big Data characteristics (volume, velocity, variety, veracity)</li>
                                  <li>Digital transformation and its impact on finance processes</li>
                                  <li>Cybersecurity and compliance (GDPR, data protection)</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Data and Information in a Digital World (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Data vs information; turning raw data into insights</li>
                                  <li>Data collection methods: internal vs external sources</li>
                                  <li>Data analytics tools: BI, dashboards, predictive analytics</li>
                                  <li>Data governance and quality assurance</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Shape and Structure of the Finance Function (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Organizational structures: centralized, decentralized, shared services</li>
                                  <li>Outsourcing and offshoring trends</li>
                                  <li>Modern finance roles: business partnering, digital centers of excellence</li>
                                  <li>Impact of automation on finance roles</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• E: Finance Interacting with the Organisation (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Finance's role in operations, marketing, HR, and supply chain</li>
                                  <li>Value chain analysis and process improvement</li>
                                  <li>Cross-functional collaboration for strategic objectives</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "e2-managing-performance" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> This section focuses on implementing strategy through business models, people management, and project leadership. Learners will explain how business models create value, assess leadership and team dynamics, apply performance management techniques, understand project management principles, and evaluate how projects contribute to strategic success.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Business Models and Value Creation (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Purpose and components of business models (value proposition, customer segments, revenue streams)</li>
                                  <li>Types of business models: traditional, digital, and platform-based</li>
                                  <li>Creating, delivering, and capturing value through strategic alignment</li>
                                  <li>Innovation and technology influence on business model design</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Managing People Performance (40%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Leadership theories (transformational, transactional, situational)</li>
                                  <li>Motivation theories: Maslow's hierarchy, Herzberg's two-factor model</li>
                                  <li>Team development stages, communication, and conflict resolution</li>
                                  <li>Setting objectives, KPIs, and performance measures</li>
                                  <li>Change management principles and managing resistance</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Managing Projects (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Project life cycle: initiation, planning, execution, monitoring, closure</li>
                                  <li>Project planning tools: Gantt charts, PERT diagrams, critical path analysis</li>
                                  <li>Risk management techniques for project delivery</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "e3-strategic-management" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> This section focuses on formulating and implementing strategy, managing change, and leveraging digital transformation. Learners will explain the strategic management process, analyze environments using frameworks, evaluate strategic options, understand digital strategy impact, and apply strategic control systems.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Strategy Process (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Stages of strategic management: analysis, choice, implementation, evaluation</li>
                                  <li>Vision, mission, and objectives guiding strategic direction</li>
                                  <li>PESTEL for macro factors, Porter's Five Forces for industry analysis</li>
                                  <li>SWOT and resource-based view for internal capabilities</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Digital Strategy (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Digital transformation reshaping business models and customer engagement</li>
                                  <li>Emerging technologies (AI, blockchain, cloud) for competitive advantage</li>
                                  <li>Governance principles for digital initiatives and data ethics</li>
                                  <li>Cybersecurity risks and compliance requirements</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Finance and the Organisation (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Role of finance in strategic decision-making and resource allocation</li>
                                  <li>Financial analysis supporting investment in strategic projects</li>
                                  <li>Finance contributing to value creation and sustainability</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Strategic Control (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Balanced Scorecard and KPIs for monitoring strategic objectives</li>
                                  <li>Risk management frameworks for strategic uncertainty</li>
                                  <li>Governance structures for accountability and compliance</li>
                                  <li>Feedback loops for continuous improvement</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• E: Generating Strategic Options (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Growth strategies: market penetration, product development, diversification</li>
                                  <li>Ansoff Matrix and BCG Growth-Share Matrix</li>
                                  <li>Mergers, acquisitions, and alliances as strategic options</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• F: Analysing the Ecosystem (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Porter's Five Forces and scenario planning for market analysis</li>
                                  <li>VRIO analysis for sustainable competitive advantage</li>
                                  <li>Global trends, regulatory changes, and stakeholder expectations</li>
                                  <li>Ecosystem partnerships and network effects</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "p1-management-accounting" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> Develop skills to apply costing, budgeting, and decision-making techniques for short-term planning and control.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Cost Accounting for Decision and Control (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Cost classification: fixed, variable, semi-variable</li>
                                  <li>Absorption vs marginal costing</li>
                                  <li>Activity-Based Costing (ABC) and Activity-Based Management (ABM)</li>
                                  <li>Modern costing approaches: throughput accounting, target costing</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Budgeting and Budgetary Control (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Types of budgets: fixed, flexible, rolling, zero-based</li>
                                  <li>Behavioral aspects of budgeting</li>
                                  <li>Variance analysis: sales, cost, mix, yield, efficiency</li>
                                  <li>Forecasting techniques</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Short-Term Commercial Decision-Making (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Cost-volume-profit (CVP) analysis and break-even</li>
                                  <li>Limiting factor analysis and optimal product mix</li>
                                  <li>Make-or-buy decisions</li>
                                  <li>Pricing strategies and contribution analysis</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Risk and Uncertainty in Short-Term Decisions (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Expected values and probability analysis</li>
                                  <li>Decision trees and sensitivity analysis</li>
                                  <li>Risk mitigation techniques</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "p2-advanced-management-accounting" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> This section develops the ability to manage costs strategically, appraise long-term investments, evaluate divisional performance, and address risk and control. Learners will apply advanced costing techniques, evaluate capital investments, assess divisional performance, understand transfer pricing, and manage risk.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Managing Costs for Value Creation (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Advanced costing: ABC, ABM, and throughput accounting</li>
                                  <li>Strategic cost management: target costing, life-cycle costing, Kaizen</li>
                                  <li>JIT, TQM, and lean principles for waste reduction</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Capital Investment Decision-Making (35%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>NPV, IRR, Modified IRR, and payback period</li>
                                  <li>Impact of inflation, taxation, and risk on investment decisions</li>
                                  <li>Capital rationing and project prioritization</li>
                                  <li>Real options analysis for strategic investments</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Managing Performance of Business Units (30%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Responsibility centers: cost, profit, and investment centers</li>
                                  <li>ROI, Residual Income (RI), and Economic Value Added (EVA)</li>
                                  <li>Non-financial performance measures and balanced scorecard</li>
                                  <li>Transfer pricing methods and implications</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Risk and Control (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Risks in medium-term decisions: operational, financial, strategic</li>
                                  <li>Sensitivity analysis, scenario planning, probability-based approaches</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "p3-risk-management" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> This section develops the ability to identify, assess, and manage risks at an enterprise and strategic level. Learners will explain risk management frameworks, assess strategic and operational risks, design internal control systems, understand governance requirements, and address cyber risks.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Enterprise Risk (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Enterprise Risk Management (ERM) and strategic planning</li>
                                  <li>ERM frameworks: COSO and ISO 31000</li>
                                  <li>Risk categories: financial, operational, strategic, compliance, reputational</li>
                                  <li>Risk registers, heat maps, and scenario analysis</li>
                                  <li>Risk appetite and tolerance in decision-making</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Strategic Risk (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Risks from strategic decisions: mergers, acquisitions, market entry</li>
                                  <li>Reputational risk impact on stakeholder trust</li>
                                  <li>Sensitivity analysis and stress testing</li>
                                  <li>Strategic risk and corporate governance relationship</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Internal Controls (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Internal control systems to prevent fraud and error</li>
                                  <li>Segregation of duties, authorization, and reconciliation</li>
                                  <li>Internal audit role in monitoring control effectiveness</li>
                                  <li>Governance frameworks for accountability and compliance</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Cyber Risks (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Cyber threats: data breaches, ransomware, phishing attacks</li>
                                  <li>Impact of cyber risk on financial and operational performance</li>
                                  <li>Mitigation strategies: encryption, firewalls, multi-factor authentication</li>
                                  <li>GDPR and cybersecurity compliance requirements</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "f1-financial-reporting" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> Prepare and interpret financial statements, understand regulation, and manage working capital.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Regulatory Environment (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Role of IFRS and standard-setting bodies</li>
                                  <li>Conceptual framework principles</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Financial Statements (45%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Preparation of income statement, balance sheet, cash flow</li>
                                  <li>Adjustments: accruals, prepayments, depreciation, provisions</li>
                                  <li>Group accounts basics: consolidation principles</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Principles of Taxation (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Types of taxes: corporate, income, indirect</li>
                                  <li>Basic tax computations and implications for business</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Managing Cash and Working Capital (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Cash flow forecasting and liquidity management</li>
                                  <li>Working capital cycle and financing options</li>
                                  <li>Short-term funding sources</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "f2-advanced-financial-reporting" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> This section builds on financial reporting knowledge to include complex standards, group accounts, integrated reporting, and performance analysis. Learners will explain long-term finance sources, apply advanced IFRS, prepare consolidated financial statements, understand integrated reporting, and analyze financial performance.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Sources of Long-Term Finance (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Sources of long-term finance: equity, debt, hybrid instruments</li>
                                  <li>Cost of capital and WACC calculation</li>
                                  <li>Gearing and leverage impact on financial risk</li>
                                  <li>Capital structure and dividend policy implications</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Financial Reporting Standards (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Advanced IFRS: IFRS 16 (Leases), IFRS 9, IFRS 15</li>
                                  <li>Provisions, contingencies, and events after reporting period</li>
                                  <li>Fair value measurement application</li>
                                  <li>Disclosure requirements: related parties, segments, EPS</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Group Accounts (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Consolidated financial statements with subsidiaries</li>
                                  <li>Associates using equity method, non-controlling interests</li>
                                  <li>Foreign currency translation for overseas subsidiaries</li>
                                  <li>Goodwill calculation and impairment testing</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Integrated Reporting (10%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Purpose and principles of integrated reporting</li>
                                  <li>Six capitals: financial, manufactured, intellectual, human, social, natural</li>
                                  <li>Stakeholder communication and long-term sustainability</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• E: Analysis of Financial Statements (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Ratio analysis: profitability, liquidity, efficiency, solvency</li>
                                  <li>Trend analysis and performance changes over time</li>
                                  <li>Benchmarking against industry standards</li>
                                  <li>Limitations of ratio analysis and non-financial indicators</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {course.slug === "f3-financial-strategy" && (
                          <>
                            <p className="mb-5 text-sm leading-relaxed">
                              <strong className="text-primary-foreground">Objective:</strong> This section focuses on developing long-term financial strategies that support organizational goals and create shareholder value. Learners will formulate financial policies, evaluate long-term finance sources, assess and manage financial risks, apply valuation methods, and understand M&A implications.
                            </p>
                            
                            <ul className="space-y-4 list-none pl-0 text-sm">
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• A: Financial Policy Decisions (15%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Financial strategy supporting corporate objectives</li>
                                  <li>Policies on capital structure, dividends, and gearing</li>
                                  <li>Risk and return trade-off in decision-making</li>
                                  <li>Impact on shareholder wealth and market perception</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• B: Sources of Long-Term Finance (25%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Equity, debt, and hybrid instruments evaluation</li>
                                  <li>Cost of capital implications and WACC calculation</li>
                                  <li>Gearing and leverage impact on profitability</li>
                                  <li>Retained earnings, leasing, and venture capital options</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• C: Financial Risks (20%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Interest rate risk, foreign exchange risk, credit risk</li>
                                  <li>Hedging, forward contracts, futures, options, and swaps</li>
                                  <li>Derivatives for mitigating market volatility</li>
                                  <li>Treasury management for financial risk control</li>
                                </ul>
                              </li>
                              
                              <li>
                                <h4 className="font-semibold text-primary-foreground mb-1.5">• D: Business Valuation (40%)</h4>
                                <ul className="list-disc list-inside space-y-0.5 pl-4 text-primary-foreground/80">
                                  <li>Valuation methods: DCF, Net Asset Value, earnings multiples</li>
                                  <li>Free cash flow valuation and terminal value estimation</li>
                                  <li>Adjustments for risk, inflation, and uncertainty</li>
                                  <li>Valuation in M&A context including synergy analysis</li>
                                </ul>
                              </li>
                            </ul>
                          </>
                        )}

                        {!["ba1-business-economics", "ba2-management-accounting", "ba3-financial-accounting", "ba4-ethics-governance-law", "e1-managing-finance", "e2-managing-performance", "e3-strategic-management", "p1-management-accounting", "p2-advanced-management-accounting", "p3-risk-management", "f1-financial-reporting", "f2-advanced-financial-reporting", "f3-financial-strategy"].includes(course.slug) && (
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

            {/* Pricing Card */}
            <div className="lg:justify-self-end w-full max-w-md">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {Number(course.price ?? 0) === 0 ? "Free" : `£${Number(course.price).toFixed(0)}`}
                  </span>
                </div>

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

      {/* Course Analytics Section */}
      {isEnrolled && totalAttempts > 0 && (
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Your Performance
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Score Progress Chart */}
              {scoreProgressData.length > 1 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Score Progress
                    </h4>
                    <span className="text-xs text-muted-foreground">Last {scoreProgressData.length} attempts</span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreProgressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="attempt"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`${value}%`, "Score"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Competency Radar */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent" />
                    Competency Analysis
                  </h4>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={competencyData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={9}
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

              {/* Question History Summary */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Practice Summary
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{averageScore}%</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
                      <p className="text-xs text-muted-foreground">Quiz Attempts</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{correctTotal}</p>
                      <p className="text-xs text-muted-foreground">Correct Answers</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs justify-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-accent" />
                      <span className="text-muted-foreground">Correct ({correctTotal})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-destructive" />
                      <span className="text-muted-foreground">Incorrect ({incorrectTotal})</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
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

              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <BarChart2 className="w-6 h-6 text-primary" />
                  Smart Analytics Preview
                </h2>
                <div className="bg-secondary/50 rounded-xl p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" 
                    alt="Analytics Dashboard Preview"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-center text-muted-foreground mt-4">
                    Track your progress across competencies, identify weak areas, and get personalized study recommendations.
                  </p>
                </div>
              </div>

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
