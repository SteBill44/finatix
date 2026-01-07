import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  BookOpen,
  FileQuestion,
  GraduationCap,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeakArea } from "@/hooks/useReadinessScore";

interface StudyRecommendationsProps {
  courseSlug: string;
  weakAreas: WeakArea[];
  overallScore: number;
}

const getIcon = (type: WeakArea["type"]) => {
  switch (type) {
    case "lesson":
      return BookOpen;
    case "quiz":
      return FileQuestion;
    case "mock":
      return GraduationCap;
  }
};

const getPriorityConfig = (priority: WeakArea["priority"]) => {
  switch (priority) {
    case "high":
      return {
        variant: "destructive" as const,
        label: "High Priority",
        bgColor: "bg-destructive/10 border-destructive/20",
      };
    case "medium":
      return {
        variant: "secondary" as const,
        label: "Recommended",
        bgColor: "bg-primary/10 border-primary/20",
      };
    case "low":
      return {
        variant: "outline" as const,
        label: "Optional",
        bgColor: "bg-muted border-muted-foreground/20",
      };
  }
};

const StudyRecommendations = ({
  courseSlug,
  weakAreas,
  overallScore,
}: StudyRecommendationsProps) => {
  const navigate = useNavigate();

  const handleAction = (area: WeakArea) => {
    if (area.type === "lesson" && area.lessonId) {
      navigate(`/lesson/${area.lessonId}`);
    } else if (area.type === "quiz" && area.quizId) {
      navigate(`/quiz/${area.quizId}`);
    } else if (area.type === "mock") {
      navigate(`/courses/${courseSlug}#mock-exams`);
    }
  };

  if (weakAreas.length === 0 && overallScore >= 75) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">You're on Track!</h3>
            <p className="text-xs text-muted-foreground">
              Keep up the great work
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your readiness score is strong. Continue reviewing materials and
          taking practice exams to maintain your knowledge.
        </p>
      </Card>
    );
  }

  if (weakAreas.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Study Recommendations</h3>
          <p className="text-xs text-muted-foreground">
            Personalized tips to improve your score
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {weakAreas.map((area, index) => {
          const Icon = getIcon(area.type);
          const priorityConfig = getPriorityConfig(area.priority);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${priorityConfig.bgColor} transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0 mt-0.5">
                  {area.priority === "high" ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {area.title}
                    </span>
                    <Badge variant={priorityConfig.variant} className="text-xs">
                      {priorityConfig.label}
                    </Badge>
                    {area.score > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Current: {area.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {area.recommendation}
                  </p>
                  {(area.lessonId || area.quizId || area.type === "mock") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleAction(area)}
                    >
                      {area.type === "lesson" && "Go to Lesson"}
                      {area.type === "quiz" && "Take Quiz"}
                      {area.type === "mock" && "View Mock Exams"}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StudyRecommendations;
