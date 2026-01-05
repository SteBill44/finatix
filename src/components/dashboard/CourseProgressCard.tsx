import { useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, ArrowRight, UserMinus } from "lucide-react";
import { useLessons, useLessonProgress, useUnenrollFromCourse } from "@/hooks/useStudentProgress";
import { toast } from "sonner";
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

interface CourseProgressCardProps {
  enrollment: {
    id: string;
    course_id: string;
    completed_at: string | null;
    courses: {
      id: string;
      title: string;
      slug: string;
      level: string;
      duration_hours: number;
    };
  };
}

const getLevelBadgeStyle = (level: string) => {
  switch (level.toLowerCase()) {
    case "certificate":
      return "bg-orange/10 text-orange";
    case "operational":
      return "bg-primary/10 text-primary";
    case "management":
      return "bg-purple/10 text-purple";
    case "strategic":
      return "bg-red/10 text-red";
    default:
      return "bg-primary/10 text-primary";
  }
};

const CourseProgressCard = ({ enrollment }: CourseProgressCardProps) => {
  const { data: lessons } = useLessons(enrollment.course_id);
  const { data: progress } = useLessonProgress(enrollment.course_id);
  const unenrollMutation = useUnenrollFromCourse();
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  
  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.filter((p) => p.completed).length || 0;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = enrollment.completed_at !== null;

  const handleUnenroll = async () => {
    try {
      await unenrollMutation.mutateAsync(enrollment.course_id);
      toast.success(`Unenrolled from ${enrollment.courses.title}`);
      setShowUnenrollDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to unenroll");
    }
  };

  return (
    <div className="p-4 bg-secondary/50 rounded-xl hover:bg-secondary/70 transition-all border border-transparent hover:border-primary/20 group w-full overflow-hidden">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm line-clamp-1">
            {enrollment.courses.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className={`capitalize px-2 py-0.5 rounded-full ${getLevelBadgeStyle(enrollment.courses.level)}`}>
              {enrollment.courses.level}
            </span>
            <span>•</span>
            <span>{enrollment.courses.duration_hours}h</span>
          </div>
        </div>
        {isCompleted && (
          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
        )}
      </div>
      
      <div className="mt-3">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-xs text-accent font-medium">
            <span>Completed</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{completedLessons} of {totalLessons} lessons</span>
              <span className="font-medium text-foreground">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </>
        )}
      </div>
      
      <div className="mt-4 flex gap-2">
        <Link to={`/courses/${enrollment.courses.slug}`} className="flex-1">
          <Button 
            variant={isCompleted ? "outline" : "default"} 
            size="sm" 
            className={`w-full gap-2 font-semibold ${
              !isCompleted 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]" 
                : ""
            }`}
          >
            <Play className={`w-4 h-4 ${!isCompleted ? "animate-pulse" : ""}`} />
            {isCompleted ? "Review" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
        
        <AlertDialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Unenroll from course"
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unenroll from course?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unenroll from <strong>{enrollment.courses.title}</strong>? 
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
      </div>
    </div>
  );
};

export default CourseProgressCard;