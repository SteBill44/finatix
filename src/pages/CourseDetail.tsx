import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments, useEnrollInCourse, useLessons, useLessonProgress } from "@/hooks/useStudentProgress";
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
  Lock
} from "lucide-react";
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
  const { data: enrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();

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

          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                  <span>4.8 (312 reviews)</span>
                </div>
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
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
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
                  <span className="text-4xl font-bold text-foreground">£{Number(course.price).toFixed(0)}</span>
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
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
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
                              <CheckCircle className="w-5 h-5 text-accent" />
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

              {/* Analytics Preview */}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* All Features */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  All Course Features
                </h3>
                <ul className="space-y-3">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
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
    </Layout>
  );
};

export default CourseDetail;
