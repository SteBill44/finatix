import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, FileText, BookOpen, CheckCircle2, XCircle, AlertTriangle, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Lesson {
  id: string;
  title: string;
  order_index: number;
  video_url: string | null;
  content: string | null;
  course_id: string;
}

interface Resource {
  id: string;
  lesson_id: string;
  file_type: string;
  resource_type: string | null;
}

interface ContentStatus {
  lessonId: string;
  lessonTitle: string;
  orderIndex: number;
  courseId: string;
  courseTitle: string;
  hasVideo: boolean;
  hasScript: boolean;
  hasStudyText: boolean;
}

export default function ContentStatusDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug")
        .order("title");
      if (error) throw error;
      return data as Course[];
    },
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lessons-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, order_index, video_url, content, course_id")
        .order("order_index");
      if (error) throw error;
      return data as Lesson[];
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["admin-lesson-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_resources")
        .select("id, lesson_id, file_type, resource_type");
      if (error) throw error;
      return data as Resource[];
    },
  });

  // Build content status for each lesson
  const contentStatus: ContentStatus[] = lessons.map((lesson) => {
    const lessonResources = resources.filter((r) => r.lesson_id === lesson.id);
    const course = courses.find((c) => c.id === lesson.course_id);
    
    const hasScript = lessonResources.some(
      (r) => r.resource_type === "script" || r.file_type === "pdf"
    );
    const hasStudyText = !!lesson.content && lesson.content.trim().length > 0;
    
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      orderIndex: lesson.order_index,
      courseId: lesson.course_id,
      courseTitle: course?.title || "Unknown",
      hasVideo: !!lesson.video_url,
      hasScript,
      hasStudyText,
    };
  });

  // Filter by course
  const filteredByCourse = selectedCourse === "all"
    ? contentStatus
    : contentStatus.filter((s) => s.courseId === selectedCourse);

  // Filter by status
  const filteredStatus = filterStatus === "all"
    ? filteredByCourse
    : filterStatus === "complete"
    ? filteredByCourse.filter((s) => s.hasVideo && s.hasScript && s.hasStudyText)
    : filterStatus === "missing-video"
    ? filteredByCourse.filter((s) => !s.hasVideo)
    : filterStatus === "missing-script"
    ? filteredByCourse.filter((s) => !s.hasScript)
    : filterStatus === "missing-study"
    ? filteredByCourse.filter((s) => !s.hasStudyText)
    : filteredByCourse;

  // Calculate statistics
  const totalLessons = filteredByCourse.length;
  const withVideo = filteredByCourse.filter((s) => s.hasVideo).length;
  const withScript = filteredByCourse.filter((s) => s.hasScript).length;
  const withStudyText = filteredByCourse.filter((s) => s.hasStudyText).length;
  const complete = filteredByCourse.filter(
    (s) => s.hasVideo && s.hasScript && s.hasStudyText
  ).length;

  const videoPercent = totalLessons > 0 ? Math.round((withVideo / totalLessons) * 100) : 0;
  const scriptPercent = totalLessons > 0 ? Math.round((withScript / totalLessons) * 100) : 0;
  const studyPercent = totalLessons > 0 ? Math.round((withStudyText / totalLessons) * 100) : 0;
  const completePercent = totalLessons > 0 ? Math.round((complete / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withVideo}/{totalLessons}</div>
            <Progress value={videoPercent} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{videoPercent}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              Scripts/PDFs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withScript}/{totalLessons}</div>
            <Progress value={scriptPercent} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{scriptPercent}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              Study Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withStudyText}/{totalLessons}</div>
            <Progress value={studyPercent} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{studyPercent}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Fully Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complete}/{totalLessons}</div>
            <Progress value={completePercent} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{completePercent}% complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Content Status by Lesson
          </CardTitle>
          <CardDescription>
            View and filter lessons by content completion status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Status Filter</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lessons</SelectItem>
                  <SelectItem value="complete">Fully Complete</SelectItem>
                  <SelectItem value="missing-video">Missing Video</SelectItem>
                  <SelectItem value="missing-script">Missing Script</SelectItem>
                  <SelectItem value="missing-study">Missing Study Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Video</TableHead>
                  <TableHead className="text-center">Script</TableHead>
                  <TableHead className="text-center">Study Text</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No lessons found matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStatus.map((status) => {
                    const isComplete = status.hasVideo && status.hasScript && status.hasStudyText;
                    const missingCount = [status.hasVideo, status.hasScript, status.hasStudyText].filter(x => !x).length;
                    
                    return (
                      <TableRow key={status.lessonId}>
                        <TableCell className="font-mono text-muted-foreground">
                          {status.orderIndex + 1}
                        </TableCell>
                        <TableCell className="font-medium">{status.lessonTitle}</TableCell>
                        <TableCell className="text-muted-foreground">{status.courseTitle}</TableCell>
                        <TableCell className="text-center">
                          {status.hasVideo ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {status.hasScript ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {status.hasStudyText ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isComplete ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                              Complete
                            </Badge>
                          ) : missingCount === 3 ? (
                            <Badge variant="destructive">
                              Empty
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {missingCount} Missing
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
