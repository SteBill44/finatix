import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useSyllabusMastery, 
  getMasteryLevel, 
  useQuestionAttemptStats 
} from "@/hooks/useSyllabusMastery";
import { Target, TrendingUp, Brain, BarChart3 } from "lucide-react";

interface SyllabusMasteryCardProps {
  courseId: string;
  syllabusAreas?: Array<{ title: string; weight: number }>;
}

const SyllabusMasteryCard = ({ courseId, syllabusAreas = [] }: SyllabusMasteryCardProps) => {
  const { data: mastery, isLoading: masteryLoading } = useSyllabusMastery(courseId);
  const { data: stats, isLoading: statsLoading } = useQuestionAttemptStats(courseId);

  const isLoading = masteryLoading || statsLoading;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  // Calculate overall mastery
  const overallMastery = mastery && mastery.length > 0
    ? Math.round(mastery.reduce((sum, m) => sum + Number(m.mastery_score), 0) / mastery.length)
    : 0;

  const overallLevel = getMasteryLevel(overallMastery);

  // Map mastery data to syllabus areas
  const areasWithMastery = syllabusAreas.map((area, index) => {
    const areaData = mastery?.find((m) => m.syllabus_area_index === index);
    return {
      ...area,
      index,
      mastery: areaData?.mastery_score || 0,
      attempted: areaData?.questions_attempted || 0,
      correct: areaData?.questions_correct || 0,
    };
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Knowledge Mastery</h3>
          <p className="text-xs text-muted-foreground">
            Track your understanding across syllabus areas
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Target className="w-3 h-3" />
            Overall Mastery
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${overallLevel.color}`}>
              {overallMastery}%
            </span>
            <Badge variant="outline" className="text-xs">
              {overallLevel.label}
            </Badge>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3 h-3" />
            Recent Accuracy
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stats?.recentAccuracy || 0}%
            </span>
            <span className="text-xs text-muted-foreground">
              (last 50)
            </span>
          </div>
        </div>
      </div>

      {/* Questions Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <BarChart3 className="w-4 h-4" />
        <span>
          {stats?.totalCorrect || 0} / {stats?.totalAttempted || 0} questions correct
        </span>
      </div>

      {/* Per-Area Mastery */}
      {areasWithMastery.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">By Syllabus Area</h4>
          {areasWithMastery.map((area) => {
            const level = getMasteryLevel(Number(area.mastery));
            return (
              <div key={area.index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate max-w-[60%]">
                    {area.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${level.color}`}>
                      {Math.round(Number(area.mastery))}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({area.attempted} Qs)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Number(area.mastery)} 
                  className="h-2" 
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <p>No syllabus areas defined yet.</p>
          <p className="text-xs mt-1">Complete quizzes to track your mastery.</p>
        </div>
      )}

      {/* Weak Areas Alert */}
      {areasWithMastery.some((a) => a.attempted > 0 && Number(a.mastery) < 50) && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm font-medium text-destructive">Focus Areas</p>
          <p className="text-xs text-muted-foreground mt-1">
            {areasWithMastery
              .filter((a) => a.attempted > 0 && Number(a.mastery) < 50)
              .map((a) => a.title)
              .join(", ")}
          </p>
        </div>
      )}
    </Card>
  );
};

export default SyllabusMasteryCard;
