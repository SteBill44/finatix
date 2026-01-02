import { useState } from "react";
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
  useQuizAttempts,
} from "@/hooks/useStudentProgress";
import { useLessonResources, useIncrementDownloadCount } from "@/hooks/useResources";
import { useQuizzes } from "@/hooks/useQuizzes";
import VideoPlayer from "@/components/lesson/VideoPlayer";
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
  Timer,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Brain,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  BarChart,
  Bar,
} from "recharts";

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
  const { data: resources } = useLessonResources(lessonId || "");
  const { data: quizzes } = useQuizzes(courseId);
  const { data: quizAttempts } = useQuizAttempts();
  const incrementDownload = useIncrementDownloadCount();

  // Filter quiz attempts for this course
  const courseQuizAttempts = quizAttempts?.filter(a => a.course_id === courseId) || [];
  
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

  // Course-specific competency data (based on quiz performance topics)
  const competencyData = [
    { subject: "Understanding", score: averageScore > 0 ? Math.min(100, averageScore + 10) : 0, fullMark: 100 },
    { subject: "Application", score: averageScore > 0 ? Math.max(0, averageScore - 5) : 0, fullMark: 100 },
    { subject: "Analysis", score: averageScore > 0 ? Math.min(100, averageScore + 5) : 0, fullMark: 100 },
    { subject: "Recall", score: averageScore > 0 ? Math.max(0, averageScore - 10) : 0, fullMark: 100 },
    { subject: "Calculation", score: averageScore > 0 ? averageScore : 0, fullMark: 100 },
  ];

  // Question history based on attempts
  const correctTotal = courseQuizAttempts.reduce((acc, a) => acc + a.score, 0);
  const incorrectTotal = courseQuizAttempts.reduce((acc, a) => acc + (a.max_score - a.score), 0);
  const questionHistoryData = [
    { category: "This Course", correct: correctTotal, incorrect: incorrectTotal },
  ];

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
          {/* Course Analytics Section - Displayed First */}
          {totalAttempts > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Your Performance in This Course
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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

                {/* Question History */}
                <Card className="p-5 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-teal" />
                      Practice Question History
                    </h4>
                    <div className="flex gap-4 text-xs">
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
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">{averageScore}%</p>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">{totalAttempts}</p>
                      <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-accent">{correctTotal}</p>
                      <p className="text-sm text-muted-foreground">Correct Answers</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Separator className="my-8" />
            </div>
          )}

          {/* Video Player */}
          <div className="mb-8">
            <VideoPlayer
              videoUrl={null}
              title={currentLesson.title}
              duration={currentLesson.duration_minutes || 0}
            />
          </div>

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
          {quizzes && quizzes.length > 0 && (
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
                  {quizzes.map((quiz) => (
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
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                          >
                            <Play className="w-4 h-4" />
                            Practice
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => navigate(`/exam/${quiz.id}`)}
                          >
                            <Timer className="w-4 h-4" />
                            Exam Mode
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Mock Exams Section */}
          {quizzes && quizzes.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Mock Exams
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Simulate real CIMA exam conditions with timed assessments, focus monitoring, and a non-programmable calculator.
                </p>
                <div className="grid gap-3">
                  {quizzes.map((quiz) => (
                    <Card key={quiz.id} className="p-4 border-accent/30 bg-accent/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{quiz.title} - Mock Exam</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                                Objective: 90 min
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                                Case Study: 3 hrs
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-accent/20 rounded-full text-accent">
                                Focus Tracking
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-2 bg-accent hover:bg-accent/90 flex-shrink-0"
                          onClick={() => navigate(`/mock-exam/${quiz.id}`)}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Start Mock Exam
                        </Button>
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