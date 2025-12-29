import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle } from "lucide-react";
import { useLessons, useLessonProgress } from "@/hooks/useStudentProgress";

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
  
  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.filter((p) => p.completed).length || 0;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = enrollment.completed_at !== null;

  return (
    <div className="p-4 bg-secondary/50 rounded-xl hover:bg-secondary/70 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
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
      
      <div className="mt-3 flex gap-2">
        <Link to={`/courses/${enrollment.courses.slug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
            <Play className="w-3.5 h-3.5" />
            {isCompleted ? "Review" : "Continue"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CourseProgressCard;