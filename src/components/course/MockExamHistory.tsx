import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Trophy, Clock, TrendingUp, TrendingDown, Calendar, Target, Award } from "lucide-react";
import { format } from "date-fns";

interface MockExamAttempt {
  id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  attempted_at: string;
  time_taken_seconds?: number | null;
  quizTitle?: string;
}

interface MockExamHistoryProps {
  attempts: MockExamAttempt[];
  quizzes: Array<{ id: string; title: string; lesson_id?: string | null }>;
}

const MockExamHistory: React.FC<MockExamHistoryProps> = ({ attempts, quizzes }) => {
  // Filter to only mock exam attempts (quizzes without lesson_id)
  const mockExamQuizIds = quizzes.filter(q => !q.lesson_id).map(q => q.id);
  const mockExamAttempts = attempts
    .filter(a => mockExamQuizIds.includes(a.quiz_id))
    .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime());

  if (mockExamAttempts.length === 0) {
    return null;
  }

  // Group attempts by quiz
  const attemptsByQuiz = mockExamAttempts.reduce((acc, attempt) => {
    if (!acc[attempt.quiz_id]) {
      acc[attempt.quiz_id] = [];
    }
    acc[attempt.quiz_id].push(attempt);
    return acc;
  }, {} as Record<string, MockExamAttempt[]>);

  // Calculate overall stats
  const totalAttempts = mockExamAttempts.length;
  const avgScore = mockExamAttempts.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) / totalAttempts;
  const avgTime = mockExamAttempts
    .filter(a => a.time_taken_seconds)
    .reduce((sum, a, _, arr) => sum + (a.time_taken_seconds || 0) / arr.length, 0);
  const bestScore = Math.max(...mockExamAttempts.map(a => (a.score / a.max_score) * 100));

  // Performance trend data for chart
  const trendData = [...mockExamAttempts]
    .reverse()
    .slice(-10)
    .map((attempt, idx) => ({
      attempt: format(new Date(attempt.attempted_at), "MMM d"),
      score: Math.round((attempt.score / attempt.max_score) * 100),
      examTitle: quizzes.find(q => q.id === attempt.quiz_id)?.title || "Exam",
    }));

  // Calculate trend direction
  const recentAttempts = mockExamAttempts.slice(0, 3);
  const olderAttempts = mockExamAttempts.slice(3, 6);
  const recentAvg = recentAttempts.length > 0 
    ? recentAttempts.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) / recentAttempts.length 
    : 0;
  const olderAvg = olderAttempts.length > 0
    ? olderAttempts.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) / olderAttempts.length
    : recentAvg;
  const trendDirection = recentAvg - olderAvg;

  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Good</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Needs Work</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">{Math.round(bestScore)}%</p>
          <p className="text-xs text-muted-foreground">Best Score</p>
        </Card>
        <Card className="p-4 text-center">
          <Target className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{Math.round(avgScore)}%</p>
          <p className="text-xs text-muted-foreground">Average Score</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-bold text-foreground">{avgTime > 0 ? `${Math.round(avgTime / 60)}m` : "N/A"}</p>
          <p className="text-xs text-muted-foreground">Avg. Time</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="w-5 h-5 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
          <p className="text-xs text-muted-foreground">Total Attempts</p>
        </Card>
      </div>

      {/* Performance Trend Chart */}
      {trendData.length > 1 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {trendDirection >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
              <h3 className="font-semibold text-foreground">Performance Trend</h3>
            </div>
            <span className={`text-sm font-medium ${trendDirection >= 0 ? 'text-green-500' : 'text-destructive'}`}>
              {trendDirection >= 0 ? '+' : ''}{Math.round(trendDirection)}% vs previous
            </span>
          </div>
          <ChartContainer
            config={{
              score: {
                label: "Score %",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[150px]"
          >
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="attempt" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-sm">
                        <p className="font-medium text-foreground">{data.examTitle}</p>
                        <p className="text-primary">{data.score}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>
      )}

      {/* Individual Exam History */}
      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Attempt History
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {mockExamAttempts.slice(0, 20).map((attempt) => {
            const quiz = quizzes.find(q => q.id === attempt.quiz_id);
            const percentage = Math.round((attempt.score / attempt.max_score) * 100);
            
            return (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {quiz?.title || "Mock Exam"}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(attempt.attempted_at), "MMM d, yyyy h:mm a")}
                    </span>
                    {attempt.time_taken_seconds && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(attempt.time_taken_seconds)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getScoreColor(percentage)}`}>
                      {percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.score}/{attempt.max_score}
                    </p>
                  </div>
                  {getScoreBadge(percentage)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default MockExamHistory;
