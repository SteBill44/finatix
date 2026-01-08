import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Clock, User, Calendar, Shield, Crown, UserMinus } from "lucide-react";
import { AppRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  cima_id: string | null;
  cima_start_date: string | null;
  cima_end_date: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    slug: string;
    level: string;
    duration_hours: number | null;
  };
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  lessons: {
    id: string;
    course_id: string;
    title: string;
  };
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

interface UserDetailSheetProps {
  userId: string | null;
  userRole: AppRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailSheet = ({ userId, userRole, open, onOpenChange }: UserDetailSheetProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [unenrolling, setUnenrolling] = useState<string | null>(null);

  useEffect(() => {
    if (userId && open) {
      fetchUserDetails();
    }
  }, [userId, open]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setLoading(true);

    // Fetch profile using audited function (logs admin access)
    const { data: profileData, error: profileError } = await supabase
      .rpc("get_user_profile_with_audit", { p_user_id: userId });

    if (profileData && profileData.length > 0) {
      setProfile(profileData[0]);
    } else if (profileError) {
      console.error("Failed to fetch profile:", profileError);
    }

    // Fetch enrollments with course details
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        id,
        course_id,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          slug,
          level,
          duration_hours
        )
      `)
      .eq("user_id", userId);

    if (enrollmentData) {
      setEnrollments(enrollmentData as Enrollment[]);
      
      // Fetch lessons for all enrolled courses
      const courseIds = enrollmentData.map(e => e.course_id);
      if (courseIds.length > 0) {
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("id, course_id, title, order_index")
          .in("course_id", courseIds)
          .order("order_index", { ascending: true });

        if (lessonsData) {
          const lessonsByCourse: Record<string, Lesson[]> = {};
          lessonsData.forEach(lesson => {
            if (!lessonsByCourse[lesson.course_id]) {
              lessonsByCourse[lesson.course_id] = [];
            }
            lessonsByCourse[lesson.course_id].push(lesson);
          });
          setCourseLessons(lessonsByCourse);
        }
      }
    }

    // Fetch lesson progress - admin needs to query without RLS for other users
    // Since RLS restricts to own user, we'll use service role or adjust RLS
    // For now, we'll show what we can fetch
    const { data: progressData } = await supabase
      .from("lesson_progress")
      .select(`
        lesson_id,
        completed,
        completed_at,
        lessons (
          id,
          course_id,
          title
        )
      `)
      .eq("user_id", userId);

    if (progressData) {
      setLessonProgress(progressData as LessonProgress[]);
    }

    setLoading(false);
  };

  const toggleCourseExpanded = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const getCourseProgress = (courseId: string) => {
    const lessons = courseLessons[courseId] || [];
    if (lessons.length === 0) return 0;
    
    const completedLessons = lessonProgress.filter(
      lp => lp.lessons?.course_id === courseId && lp.completed
    ).length;
    
    return Math.round((completedLessons / lessons.length) * 100);
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case "certificate":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "operational":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "management":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "strategic":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleUnenroll = async (enrollmentId: string, courseTitle: string) => {
    setUnenrolling(enrollmentId);
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      toast.success(`Successfully unenrolled user from ${courseTitle}`);
    } catch (error) {
      console.error("Failed to unenroll:", error);
      toast.error("Failed to unenroll user from course");
    } finally {
      setUnenrolling(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle>User Profile</SheetTitle>
          <SheetDescription>View user details, enrolled courses, and progress</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading user details...</div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{profile.full_name || "Unknown User"}</h3>
                  {userRole && (
                    <Badge 
                      variant={userRole === "master_admin" ? "default" : userRole === "admin" ? "default" : "secondary"} 
                      className={`flex items-center gap-1 ${userRole === "master_admin" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    >
                      {userRole === "master_admin" && <Crown className="h-3 w-3" />}
                      {userRole === "admin" && <Shield className="h-3 w-3" />}
                      {userRole}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
                {profile.cima_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    CIMA ID: {profile.cima_id}
                  </div>
                )}
              </div>
            </div>

            {/* Courses Section */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Enrolled Courses ({enrollments.length})
              </h4>
              
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No courses enrolled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => {
                    const progress = getCourseProgress(enrollment.course_id);
                    const isExpanded = expandedCourses.has(enrollment.course_id);
                    const lessons = courseLessons[enrollment.course_id] || [];
                    const isCompleted = enrollment.completed_at !== null;

                    return (
                      <Collapsible
                        key={enrollment.id}
                        open={isExpanded}
                        onOpenChange={() => toggleCourseExpanded(enrollment.course_id)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{enrollment.courses.title}</span>
                                <Badge variant="outline" className={getLevelBadgeStyle(enrollment.courses.level)}>
                                  {enrollment.courses.level}
                                </Badge>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                                      disabled={unenrolling === enrollment.id}
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Unenroll from course?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to unenroll {profile?.full_name || "this user"} from "{enrollment.courses.title}"? 
                                        This will remove all their progress for this course.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleUnenroll(enrollment.id, enrollment.courses.title)}
                                      >
                                        Unenroll
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {enrollment.courses.duration_hours || 0}h
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <Progress value={progress} className="h-2 flex-1" />
                                <span className="text-sm font-medium w-12 text-right">
                                  {isCompleted ? (
                                    <span className="flex items-center gap-1 text-emerald-600">
                                      <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                  ) : (
                                    `${progress}%`
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t bg-muted/30 p-4">
                              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Lesson Progress
                              </h5>
                              {lessons.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No lessons available</p>
                              ) : (
                                <div className="space-y-2">
                                  {lessons.map((lesson) => {
                                    const progress = lessonProgress.find(
                                      lp => lp.lesson_id === lesson.id
                                    );
                                    const isLessonCompleted = progress?.completed || false;

                                    return (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 text-sm"
                                      >
                                        {isLessonCompleted ? (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                                        )}
                                        <span className={isLessonCompleted ? "text-foreground" : "text-muted-foreground"}>
                                          {lesson.order_index + 1}. {lesson.title}
                                        </span>
                                        {progress?.completed_at && (
                                          <span className="text-xs text-muted-foreground ml-auto">
                                            {new Date(progress.completed_at).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>User profile not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UserDetailSheet;
