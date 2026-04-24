import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import type { Lesson } from "./helpers";

interface Props {
  courseId: string;
  lessons: Lesson[];
  isLessonCompleted: (id: string) => boolean | undefined;
  nextLessonId: string | null;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  levelBgColor: string;
}

export const LessonsList = ({
  courseId,
  lessons,
  isLessonCompleted,
  nextLessonId,
  completedLessons,
  totalLessons,
  progressPercentage,
  levelBgColor,
}: Props) => {
  const navigate = useNavigate();
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card className="p-6">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Course Lessons</h3>
                <p className="text-xs text-muted-foreground">{completedLessons} of {totalLessons} completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{progressPercentage}%</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-0" />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2">
            {sortedLessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              const isNext = nextLessonId === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isNext
                      ? "bg-primary/10 border border-primary/20"
                      : completed
                      ? "bg-accent/5 hover:bg-accent/10"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => navigate(`/courses/${courseId}/lesson/${lesson.id}`)}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                    completed
                      ? "bg-accent text-accent-foreground"
                      : isNext
                      ? `${levelBgColor} text-primary-foreground`
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {completed ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${completed ? "text-muted-foreground" : "text-foreground"}`}>
                      {lesson.title}
                    </p>
                  </div>
                  {isNext && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary shrink-0">
                      Next
                    </Badge>
                  )}
                  {lesson.duration_minutes && (
                    <span className="text-xs text-muted-foreground shrink-0">{lesson.duration_minutes}m</span>
                  )}
                  {!completed && !isNext && (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
