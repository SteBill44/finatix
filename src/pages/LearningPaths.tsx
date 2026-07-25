import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, BookOpen, Clock, ChevronRight, CheckCircle, Play } from "lucide-react";
import { useLearningPaths, useMyLearningPaths, useEnrollInLearningPath } from "@/hooks/useLearningPaths";
import { useEnrollments } from "@/hooks/useStudentProgress";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function LearningPaths() {
  const { data: paths = [], isLoading: pathsLoading } = useLearningPaths();
  const { data: myPaths = [], isLoading: myLoading } = useMyLearningPaths();
  const { data: enrollments = [] } = useEnrollments();
  const enroll = useEnrollInLearningPath();

  const enrolledPathIds = new Set(myPaths.map((p) => p.learning_path_id));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const handleEnroll = async (pathId: string) => {
    try {
      await enroll.mutateAsync(pathId);
      toast.success("Enrolled in learning path!");
    } catch {
      toast.error("Failed to enroll. Please try again.");
    }
  };

  return (
    <Layout>
      <SEOHead title="Learning Paths" description="Structured CIMA study pathways to guide your learning journey" />
      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2 uppercase">
              <Map className="w-7 h-7 text-primary" />
              Learning <span className="text-gradient-brand">Paths</span>
            </h1>
            <p className="text-muted-foreground">
              Structured study pathways designed to guide you through your CIMA journey
            </p>
          </div>

          <Tabs defaultValue="browse">
            <TabsList className="mb-6">
              <TabsTrigger value="browse">Browse Paths</TabsTrigger>
              <TabsTrigger value="my-paths">
                My Paths
                {myPaths.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs">{myPaths.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse">
              {pathsLoading ? (
                <PathGrid count={3} loading />
              ) : paths.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Map className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No learning paths published yet</p>
                  <p className="text-sm mt-1 opacity-70">Check back soon - paths are being added regularly</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {paths.map((path) => {
                    const isEnrolled = enrolledPathIds.has(path.id);
                    const courseCount = path.courses?.length || 0;
                    return (
                      <Card key={path.id} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-lg leading-tight mb-1">{path.title}</CardTitle>
                              {path.description && (
                                <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                              )}
                            </div>
                            {isEnrolled && (
                              <Badge variant="default" className="flex-shrink-0 text-xs">Enrolled</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {path.difficulty_level && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[path.difficulty_level] || "bg-secondary text-secondary-foreground"}`}>
                                {path.difficulty_level}
                              </span>
                            )}
                            {path.estimated_hours && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {path.estimated_hours}h
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {courseCount} {courseCount === 1 ? "course" : "courses"}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end gap-4">
                          {/* Course list */}
                          {path.courses && path.courses.length > 0 && (
                            <div className="space-y-1.5">
                              {path.courses.slice(0, 3).map((pc, i) => (
                                <div key={pc.id} className="flex items-center gap-2 text-sm">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                    enrolledCourseIds.has(pc.course_id)
                                      ? "bg-green-500 text-white"
                                      : "bg-secondary text-secondary-foreground"
                                  }`}>
                                    {enrolledCourseIds.has(pc.course_id) ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      i + 1
                                    )}
                                  </div>
                                  <span className="truncate text-muted-foreground">{pc.course.title}</span>
                                  {!pc.is_required && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge>
                                  )}
                                </div>
                              ))}
                              {path.courses.length > 3 && (
                                <p className="text-xs text-muted-foreground ml-7">+{path.courses.length - 3} more courses</p>
                              )}
                            </div>
                          )}

                          <Button
                            className="w-full"
                            variant={isEnrolled ? "outline" : "default"}
                            onClick={() => !isEnrolled && handleEnroll(path.id)}
                            disabled={enroll.isPending}
                          >
                            {isEnrolled ? (
                              <>
                                <Play className="w-4 h-4 mr-1.5" />
                                Continue Path
                              </>
                            ) : (
                              <>
                                Start Learning Path
                                <ChevronRight className="w-4 h-4 ml-1.5" />
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-paths">
              {myLoading ? (
                <PathGrid count={2} loading />
              ) : myPaths.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Map className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>You haven't enrolled in any learning paths yet</p>
                  <p className="text-sm mt-1 opacity-70">Browse available paths to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myPaths.map((up) => {
                    const path = up.learning_path;
                    if (!path) return null;
                    const courseCount = path.courses?.length || 0;
                    const completedCount = path.courses?.filter((pc) =>
                      enrolledCourseIds.has(pc.course_id)
                    ).length || 0;
                    const progressPct = courseCount > 0 ? (completedCount / courseCount) * 100 : 0;

                    return (
                      <Card key={up.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{path.title}</CardTitle>
                          {path.description && (
                            <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                              <span>{completedCount}/{courseCount} courses enrolled</span>
                              <span>{Math.round(progressPct)}%</span>
                            </div>
                            <Progress value={progressPct} className="h-2" />
                          </div>
                          {path.courses && path.courses.length > 0 && (
                            <div className="space-y-1.5">
                              {path.courses.map((pc, i) => {
                                const enrolled = enrolledCourseIds.has(pc.course_id);
                                return (
                                  <div key={pc.id} className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                                      enrolled ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
                                    }`}>
                                      {enrolled ? <CheckCircle className="w-3 h-3" /> : i + 1}
                                    </div>
                                    <Link
                                      to={`/courses/${pc.course.slug}`}
                                      className="text-sm truncate hover:text-primary transition-colors"
                                    >
                                      {pc.course.title}
                                    </Link>
                                    {!enrolled && (
                                      <Link to={`/courses/${pc.course.slug}`}>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                                          Enroll
                                        </Badge>
                                      </Link>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function PathGrid({ count, loading }: { count: number; loading?: boolean }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}
