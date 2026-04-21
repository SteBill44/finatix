import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, ArrowRight } from "lucide-react";
import { useLessons, useLessonProgress } from "@/hooks/useStudentProgress";

interface CourseProgressRowProps {
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

const CourseProgressRow = ({ enrollment }: CourseProgressRowProps) => {
  const { data: lessons } = useLessons(enrollment.course_id);
  const { data: progress } = useLessonProgress(enrollment.course_id);

  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.filter((p) => p.completed).length || 0;
  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = enrollment.completed_at !== null;

  return (
    <Link
      to={`/courses/${enrollment.courses.slug}`}
      className="group flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-secondary/60 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h4 className="text-sm font-medium text-foreground truncate">
            {enrollment.courses.title}
          </h4>
          {isCompleted && (
            <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          )}
        </div>
        {!isCompleted ? (
          <div className="flex items-center gap-3">
            <Progress value={percentage} className="h-1.5 flex-1 max-w-[200px]" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {completedLessons}/{totalLessons} · {percentage}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-accent font-medium">Completed</span>
        )}
      </div>
      <Button
        size="sm"
        variant={isCompleted ? "outline" : "default"}
        className="gap-1.5 flex-shrink-0"
      >
        <Play className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isCompleted ? "Review" : "Continue"}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </Link>
  );
};

export default CourseProgressRow;
