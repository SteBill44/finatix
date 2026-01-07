import { motion } from "framer-motion";
import { Info, TrendingUp, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOverallReadiness } from "@/hooks/useExamReadiness";
import { READINESS_DISCLAIMER, type ConfidenceIndicator } from "@/lib/examReadiness";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ExamReadinessWidget = () => {
  const { data: readiness, isLoading } = useOverallReadiness();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!readiness) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Exam Readiness
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{READINESS_DISCLAIMER}</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            Enroll in a course to see your readiness score
          </p>
        </CardContent>
      </Card>
    );
  }

  const getLevelIcon = () => {
    switch (readiness.level) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'high':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'medium':
        return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Exam Readiness
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">{READINESS_DISCLAIMER}</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Circular Progress */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={readiness.color}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 251.2" }}
              animate={{
                strokeDasharray: `${(readiness.score / 100) * 251.2} 251.2`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{readiness.score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Level indicator */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {getLevelIcon()}
          <span className="font-medium">{readiness.message}</span>
        </div>

        {/* Confidence Indicator */}
        <ConfidenceBadge confidence={readiness.confidence} />

        {/* Breakdown */}
        <div className="space-y-2 text-xs mt-4">
          <BreakdownItem label="Lessons" value={readiness.breakdown.lessonProgress} />
          <BreakdownItem label="Quiz Scores" value={readiness.breakdown.quizPerformance} />
          <BreakdownItem label="Syllabus Mastery" value={readiness.breakdown.syllabusMastery} />
          <BreakdownItem label="Mock Exams" value={readiness.breakdown.mockExams} />
          <BreakdownItem label="Trend" value={readiness.breakdown.trend} />
        </div>

        {/* Top recommendation */}
        {readiness.recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Recommendation:</p>
            <p className="text-sm">{readiness.recommendations[0]}</p>
          </div>
        )}

        {/* Disclaimer */}
        <Alert variant="default" className="mt-4 bg-muted/50">
          <Info className="h-3 w-3" />
          <AlertDescription className="text-xs text-muted-foreground">
            This is an estimate only and does not guarantee exam results.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

const ConfidenceBadge = ({ confidence }: { confidence: ConfidenceIndicator }) => {
  const getConfidenceIcon = () => {
    switch (confidence.level) {
      case 'high':
        return <ShieldCheck className="h-3.5 w-3.5 text-green-500" />;
      case 'medium':
        return <Shield className="h-3.5 w-3.5 text-yellow-500" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />;
    }
  };

  const getConfidenceColor = () => {
    switch (confidence.level) {
      case 'high':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full border text-xs font-medium cursor-help ${getConfidenceColor()}`}>
          {getConfidenceIcon()}
          <span>{confidence.percentage}% confidence</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium mb-1">{confidence.message}</p>
        <div className="text-xs space-y-0.5 text-muted-foreground">
          <p>• Quiz attempts: {confidence.dataPoints.quizAttempts}</p>
          <p>• Lessons completed: {confidence.dataPoints.lessonsCompleted}</p>
          <p>• Mock exams taken: {confidence.dataPoints.mockExams}</p>
          <p>• Syllabus areas covered: {confidence.dataPoints.syllabusAreas}</p>
          <p>• Study time tracked: {confidence.dataPoints.studySessions ? 'Yes' : 'No'}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const BreakdownItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <Progress value={value} className="w-16 h-1.5" />
      <span className="w-8 text-right">{value}%</span>
    </div>
  </div>
);

export default ExamReadinessWidget;
