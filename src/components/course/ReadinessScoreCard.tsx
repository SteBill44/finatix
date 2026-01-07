import { useReadinessScore } from "@/hooks/useReadinessScore";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Target,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Info,
  TrendingUp,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertTriangle,
} from "lucide-react";

interface ReadinessScoreCardProps {
  courseId: string;
  compact?: boolean;
}

const getLevelConfig = (level: string) => {
  switch (level) {
    case "not-started":
      return {
        label: "Not Started",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        description: "Begin your learning journey",
      };
    case "beginning":
      return {
        label: "Beginning",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        description: "You're just getting started",
      };
    case "developing":
      return {
        label: "Developing",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        description: "Making good progress",
      };
    case "proficient":
      return {
        label: "Proficient",
        color: "text-primary",
        bgColor: "bg-primary/10",
        description: "Almost exam ready",
      };
    case "ready":
      return {
        label: "Exam Ready",
        color: "text-accent",
        bgColor: "bg-accent/10",
        description: "You're well prepared!",
      };
    default:
      return {
        label: "Unknown",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        description: "",
      };
  }
};

const getConfidenceConfig = (level: string) => {
  switch (level) {
    case "high":
      return {
        label: "High Confidence",
        color: "text-accent",
        bgColor: "bg-accent/10",
        Icon: ShieldCheck,
        description: "Based on recent, comprehensive study activity",
      };
    case "medium":
      return {
        label: "Medium Confidence",
        color: "text-primary",
        bgColor: "bg-primary/10",
        Icon: Shield,
        description: "Some gaps in data or recent activity",
      };
    case "low":
      return {
        label: "Low Confidence",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        Icon: ShieldAlert,
        description: "Limited data or extended study gap",
      };
    case "very-low":
      return {
        label: "Very Low Confidence",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        Icon: ShieldQuestion,
        description: "Insufficient data to assess readiness",
      };
    default:
      return {
        label: "Unknown",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        Icon: ShieldQuestion,
        description: "",
      };
  }
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-accent";
  if (score >= 50) return "text-primary";
  if (score >= 25) return "text-yellow-500";
  return "text-muted-foreground";
};

const ReadinessScoreCard = ({
  courseId,
  compact = false,
}: ReadinessScoreCardProps) => {
  const { data: readiness, isLoading } = useReadinessScore(courseId);

  if (isLoading) {
    return (
      <Card className={`${compact ? "p-4" : "p-6"} animate-pulse`}>
        <div className="h-24 bg-muted rounded" />
      </Card>
    );
  }

  if (!readiness) return null;

  const levelConfig = getLevelConfig(readiness.level);
  const confidenceConfig = getConfidenceConfig(readiness.confidenceLevel);
  const ConfidenceIcon = confidenceConfig.Icon;

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-sm">Readiness Score</h4>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              <p className="text-xs mb-2">
                Based on lesson completion (40%), quiz performance (40%), and
                mock exam results (20%). Recent activity is weighted more heavily.
              </p>
              <p className="text-xs text-muted-foreground italic">
                This is an estimate only and does not guarantee exam success.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`text-3xl font-bold ${getScoreColor(readiness.overall)}`}
          >
            {readiness.overall}%
          </div>
          <div className="flex-1">
            <Progress value={readiness.overall} className="h-2" />
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs ${levelConfig.color}`}>
                {levelConfig.label}
              </p>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`flex items-center gap-1 ${confidenceConfig.color}`}>
                    <ConfidenceIcon className="w-3 h-3" />
                    <span className="text-xs">{readiness.confidence}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{confidenceConfig.label}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Readiness Score</h3>
            <p className="text-xs text-muted-foreground">
              Your exam preparation level
            </p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p className="text-xs mb-2 font-medium">How is this calculated?</p>
            <ul className="text-xs space-y-1 text-muted-foreground mb-2">
              <li>• Lesson Completion: 40%</li>
              <li>• Quiz Performance: 40%</li>
              <li>• Mock Exam Results: 20%</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Recent activity is weighted more heavily. Older quiz attempts 
              contribute less to your score.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Main Score Display */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`relative w-24 h-24 rounded-full ${levelConfig.bgColor} flex items-center justify-center`}
        >
          <span
            className={`text-3xl font-bold ${getScoreColor(readiness.overall)}`}
          >
            {readiness.overall}%
          </span>
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={`${readiness.overall * 2.83} 283`}
              strokeLinecap="round"
              className={getScoreColor(readiness.overall)}
            />
          </svg>
        </div>
        <div className="flex-1">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${levelConfig.bgColor} mb-2`}
          >
            <TrendingUp className={`w-3.5 h-3.5 ${levelConfig.color}`} />
            <span className={`text-sm font-medium ${levelConfig.color}`}>
              {levelConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {levelConfig.description}
          </p>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${confidenceConfig.bgColor} mb-4`}>
        <ConfidenceIcon className={`w-5 h-5 ${confidenceConfig.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${confidenceConfig.color}`}>
              {confidenceConfig.label}
            </span>
            <span className={`text-sm ${confidenceConfig.color}`}>
              {readiness.confidence}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {confidenceConfig.description}
          </p>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="space-y-4">
        {/* Lessons */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Lessons</span>
              <span className="font-medium">
                {readiness.lessonsCompleted}/{readiness.totalLessons}
              </span>
            </div>
            <Progress value={readiness.lessonProgress} className="h-1.5" />
          </div>
          <span
            className={`text-sm font-semibold w-12 text-right ${getScoreColor(readiness.lessonProgress)}`}
          >
            {readiness.lessonProgress}%
          </span>
        </div>

        {/* Quizzes */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <FileQuestion className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Quiz Average</span>
              <span className="font-medium">
                {readiness.quizzesTaken > 0
                  ? `${readiness.quizzesTaken} taken`
                  : "None yet"}
              </span>
            </div>
            <Progress value={readiness.quizPerformance} className="h-1.5" />
          </div>
          <span
            className={`text-sm font-semibold w-12 text-right ${getScoreColor(readiness.quizPerformance)}`}
          >
            {readiness.quizPerformance}%
          </span>
        </div>

        {/* Mock Exams */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Mock Exams</span>
              <span className="font-medium">
                {readiness.mockExamsTaken > 0
                  ? `${readiness.mockExamsTaken} taken`
                  : "None yet"}
              </span>
            </div>
            <Progress value={readiness.mockExamPerformance} className="h-1.5" />
          </div>
          <span
            className={`text-sm font-semibold w-12 text-right ${getScoreColor(readiness.mockExamPerformance)}`}
          >
            {readiness.mockExamPerformance}%
          </span>
        </div>

        {/* Last Activity */}
        {readiness.lastActivityDays !== null && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Activity</span>
                <span className="font-medium">
                  {readiness.lastActivityDays === 0
                    ? "Today"
                    : readiness.lastActivityDays === 1
                      ? "Yesterday"
                      : `${readiness.lastActivityDays} days ago`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>
            This score is an estimate based on your study activity and does not 
            guarantee exam success. Actual results depend on many factors including 
            exam conditions and question selection.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReadinessScoreCard;
