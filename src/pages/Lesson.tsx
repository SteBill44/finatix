import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { useLessonResources, useIncrementDownloadCount } from "@/hooks/useResources";
import { useQuizzes, useLessonQuizAttempts } from "@/hooks/useQuizzes";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import VideoPlayer from "@/components/lesson/VideoPlayer";
import PdfViewer from "@/components/lesson/PdfViewer";
import LessonNotes from "@/components/lesson/LessonNotes";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Play,
  Clock,
  FileText,
  Menu,
  X,
  Download,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSanitizedMarkup } from "@/lib/sanitize";


const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const markComplete = useMarkLessonComplete();
  
  // Video progress tracking
  const { progress: videoProgress, saveProgress } = useVideoProgress(lessonId);

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
  const { data: resources } = useLessonResources(lessonId || "");
  const { data: lessonQuizzes } = useQuizzes(courseId, lessonId);
  const { data: courseQuizzes } = useQuizzes(courseId);
  const { data: lessonQuizAttempts } = useLessonQuizAttempts(lessonId);
  const incrementDownload = useIncrementDownloadCount();
  // Use lesson-specific quizzes if available, otherwise fall back to course quizzes
  const quizzesToShow = lessonQuizzes && lessonQuizzes.length > 0 ? lessonQuizzes : courseQuizzes;

  // Check if user has passed the lesson quiz (score >= 50%)
  const hasPassedLessonQuiz = lessonQuizAttempts?.some(
    (a: any) => a.score > 0 && a.max_score > 0 && (a.score / a.max_score) >= 0.5
  ) ?? false;

  // Handle resource download with tracking
  const handleDownload = (resource: { id: string; file_url: string }) => {
    incrementDownload.mutate(resource.id);
    window.open(resource.file_url, "_blank");
  };

  // Helper to get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) return FileSpreadsheet;
    if (fileType.includes("image")) return FileImage;
    if (fileType.includes("video")) return FileVideo;
    if (fileType.includes("audio")) return FileAudio;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
          {/* Breadcrumb Navigation */}
          <div className="px-4 pt-3 pb-2 border-b border-border/50">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <Home className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Home</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/courses" className="text-muted-foreground hover:text-foreground">
                      Courses
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/courses/${course?.slug || courseId}`} className="text-muted-foreground hover:text-foreground max-w-[120px] sm:max-w-[200px] truncate">
                      {course?.title || "Course"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium max-w-[100px] sm:max-w-[180px] truncate">
                    {currentLesson.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
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
        <div className="p-6 lg:p-8">
          {/* Video Player and Notes - Side by Side on larger screens */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2">
              <VideoPlayer
                videoUrl={currentLesson.video_url}
                title={currentLesson.title}
                duration={currentLesson.duration_minutes || 0}
                initialTime={videoProgress?.progress_seconds ? Number(videoProgress.progress_seconds) : 0}
                onTimeUpdate={(currentTime, duration) => {
                  saveProgress(currentTime, duration);
                }}
              />
            </div>
            <div className="xl:col-span-1">
              <LessonNotes lessonId={lessonId!} lessonTitle={currentLesson.title} />
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">

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
              (() => {
                const pdfMatch = currentLesson.content.match(/^\{\{PDF:(.+)\}\}$/);
                const pdfUrl = pdfMatch?.[1]?.trim();

                return pdfUrl ? (
                  <PdfViewer sourceUrl={pdfUrl} title={currentLesson.title} />
                ) : (
                  <div dangerouslySetInnerHTML={createSanitizedMarkup(currentLesson.content)} />
                );
              })()
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

          {/* Downloadable Resources */}
          {resources && resources.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Downloadable Resources
                  </h3>
                </div>
                <div className="grid gap-3">
                  {resources.map((resource) => {
                    const IconComponent = getFileIcon(resource.file_type);
                    return (
                      <Card
                        key={resource.id}
                        className="p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {resource.title}
                            </h4>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="uppercase">{resource.file_type}</span>
                              <span>•</span>
                              <span>{formatFileSize(resource.file_size)}</span>
                              <span>•</span>
                              <span>{resource.download_count} downloads</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-shrink-0"
                            onClick={() => handleDownload(resource)}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}


          {/* Practice Quizzes Section */}
          {quizzesToShow && quizzesToShow.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Practice Quizzes
                  </h3>
                </div>
                <div className="grid gap-3">
                  {quizzesToShow.map((quiz) => (
                    <Card key={quiz.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ClipboardList className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{quiz.title}</h4>
                            {quiz.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {quiz.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                          >
                            <ClipboardList className="w-4 h-4" />
                            Take Quiz
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

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
            ) : hasPassedLessonQuiz ? (
              <Button
                className="gap-2"
                onClick={() => navigate("/dashboard")}
              >
                Complete Course
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="gap-2"
                variant="outline"
                disabled
                title="Pass the lesson quiz to complete the course"
              >
                <ClipboardList className="w-4 h-4" />
                Pass Quiz to Complete
              </Button>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;