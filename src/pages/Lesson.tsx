import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  useLessons,
  useLessonProgress,
  useMarkLessonComplete,
} from "@/hooks/useStudentProgress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Play,
  Clock,
  BookOpen,
  FileText,
  Menu,
  X,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const markComplete = useMarkLessonComplete();

  // Fetch course details
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch lessons for this course
  const { data: lessons, isLoading: lessonsLoading } = useLessons(courseId);
  const { data: progress } = useLessonProgress(courseId);

  // Current lesson
  const currentLesson = lessons?.find((l) => l.id === lessonId);
  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? lessons?.[currentIndex - 1] : null;
  const nextLesson = lessons && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Check if lesson is completed
  const isLessonCompleted = (id: string) => {
    return progress?.some((p) => p.lesson_id === id && p.completed);
  };

  const currentLessonCompleted = lessonId ? isLessonCompleted(lessonId) : false;

  // Calculate overall progress
  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.filter((p) => p.completed).length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleMarkComplete = async () => {
    if (!user) {
      toast.error("Please sign in to track your progress");
      navigate("/auth");
      return;
    }

    if (!lessonId) return;

    try {
      await markComplete.mutateAsync({ lessonId, courseId: courseId! });
      toast.success("Lesson marked as complete!");
      
      // Auto-navigate to next lesson after a short delay
      if (nextLesson) {
        setTimeout(() => {
          navigate(`/courses/${courseId}/lesson/${nextLesson.id}`);
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark lesson complete");
    }
  };

  if (lessonsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!currentLesson) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Lesson not found</h2>
            <p className="text-muted-foreground mb-4">This lesson doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(`/courses/${courseId}`)}>
              Back to Course
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Link
                to={`/courses/${course?.slug || courseId}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <h2 className="font-semibold text-foreground line-clamp-2">{course?.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{completedLessons} of {totalLessons} lessons</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {lessons?.map((lesson, index) => {
                const isCompleted = isLessonCompleted(lesson.id);
                const isCurrent = lesson.id === lessonId;

                return (
                  <Link
                    key={lesson.id}
                    to={`/courses/${courseId}/lesson/${lesson.id}`}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-colors",
                      isCurrent
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-accent" />
                      ) : isCurrent ? (
                        <Play className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium line-clamp-2",
                          isCurrent ? "text-primary" : "text-foreground"
                        )}
                      >
                        {index + 1}. {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration_minutes} min</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 z-40 lg:hidden shadow-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">
                  Lesson {currentIndex + 1} of {totalLessons}
                </p>
                <h1 className="font-semibold text-foreground line-clamp-1">
                  {currentLesson.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentLessonCompleted ? (
                <span className="flex items-center gap-1.5 text-sm text-accent font-medium px-3 py-1.5 bg-accent/10 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={markComplete.isPending}
                >
                  {markComplete.isPending ? "Saving..." : "Mark Complete"}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Lesson Content */}
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Video Placeholder */}
          <Card className="aspect-video bg-charcoal rounded-xl overflow-hidden mb-8 flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-medium">Video Content</p>
              <p className="text-sm text-primary-foreground/60 mt-1">
                {currentLesson.duration_minutes} minutes
              </p>
            </div>
          </Card>

          {/* Lesson Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {currentLesson.title}
            </h2>
            {currentLesson.description && (
              <p className="text-muted-foreground">{currentLesson.description}</p>
            )}
          </div>

          <Separator className="my-8" />

          {/* Lesson Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {currentLesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            ) : (
              <Card className="p-8 text-center bg-secondary/30">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Lesson Content Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  The full lesson content including notes, resources, and exercises will be available here.
                </p>
              </Card>
            )}
          </div>

          <Separator className="my-8" />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevLesson ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(`/courses/${courseId}/lesson/${prevLesson.id}`)}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous:</span>
                <span className="max-w-[150px] truncate">{prevLesson.title}</span>
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button
                className="gap-2"
                onClick={() => navigate(`/courses/${courseId}/lesson/${nextLesson.id}`)}
              >
                <span className="hidden sm:inline">Next:</span>
                <span className="max-w-[150px] truncate">{nextLesson.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="gap-2"
                onClick={() => navigate("/dashboard")}
              >
                Complete Course
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;