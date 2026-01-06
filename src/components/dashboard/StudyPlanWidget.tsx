import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Calendar, Clock, Target, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStudyPlans, useTodayGoal, useWeekGoals } from "@/hooks/useStudyPlanner";
import { Skeleton } from "@/components/ui/skeleton";

const StudyPlanWidget = () => {
  const { data: plans, isLoading: plansLoading } = useStudyPlans();
  const activePlan = plans?.find(p => p.is_active);
  
  const { data: todayGoal } = useTodayGoal(activePlan?.id);
  const { data: weekGoals } = useWeekGoals(activePlan?.id);

  if (plansLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!activePlan) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4">
          <p className="text-muted-foreground text-sm mb-3">
            Set an exam date to create your study plan
          </p>
          <Button asChild size="sm">
            <Link to="/study-planner">Create Plan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysUntilExam = differenceInDays(new Date(activePlan.exam_date), new Date());
  const weekProgress = weekGoals?.length 
    ? (weekGoals.filter(g => g.completed).length / weekGoals.length) * 100
    : 0;
  const todayProgress = todayGoal 
    ? Math.min((todayGoal.actual_minutes / todayGoal.target_minutes) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Study Plan
          </span>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
            <Link to="/study-planner">
              View <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exam Countdown */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">
            {daysUntilExam > 0 ? daysUntilExam : 0}
          </p>
          <p className="text-xs text-muted-foreground">
            days until {activePlan.courses?.title || "exam"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(activePlan.exam_date), "MMMM d, yyyy")}
          </p>
        </div>

        {/* Today's Goal */}
        {todayGoal && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                Today's Goal
              </span>
              <span className="text-muted-foreground">
                {todayGoal.actual_minutes}/{todayGoal.target_minutes} min
              </span>
            </div>
            <Progress value={todayProgress} className="h-2" />
          </div>
        )}

        {/* Week Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              This Week
            </span>
            <span className="text-muted-foreground">
              {weekGoals?.filter(g => g.completed).length || 0}/{weekGoals?.length || 7} days
            </span>
          </div>
          <Progress value={weekProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPlanWidget;
