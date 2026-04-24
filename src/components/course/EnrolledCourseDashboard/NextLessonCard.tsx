import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Clock, Play, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Lesson } from "./helpers";

interface Props {
  courseId: string;
  nextLesson: Lesson | null;
  nextLessonIndex: number | null;
  totalLessons: number;
}

export const NextLessonCard = ({ courseId, nextLesson, nextLessonIndex, totalLessons }: Props) => {
  const navigate = useNavigate();

  if (nextLesson) {
    return (
      <Card className="p-5 border-primary/20 bg-primary/[0.03]">
        <div className="flex items-center gap-2 text-xs text-primary font-medium mb-3">
          <Zap className="w-3.5 h-3.5" />
          UP NEXT — Chapter {nextLessonIndex}
        </div>
        <h4 className="font-semibold text-foreground mb-1 leading-snug">{nextLesson.title}</h4>
        {nextLesson.duration_minutes && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
            <Clock className="w-3 h-3" /> {nextLesson.duration_minutes} min
          </p>
        )}
        <Button
          className="w-full gap-2"
          onClick={() => navigate(`/courses/${courseId}/lesson/${nextLesson.id}`)}
        >
          <Play className="w-4 h-4" /> Start Lesson
        </Button>
      </Card>
    );
  }

  if (totalLessons > 0) {
    return (
      <Card className="p-5 border-accent/20 bg-accent/[0.03]">
        <div className="flex items-center gap-2 text-accent mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">All lessons completed!</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Review any lesson or take practice quizzes to solidify your knowledge.
        </p>
      </Card>
    );
  }

  return null;
};
