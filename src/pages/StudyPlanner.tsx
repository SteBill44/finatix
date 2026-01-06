import { useState } from "react";
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Calendar, Clock, Target, Plus, Trash2, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudyPlans, useStudyGoals, useCreateStudyPlan, useDeleteStudyPlan } from "@/hooks/useStudyPlanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StudyPlanner = () => {
  const { user } = useAuth();
  const { data: plans, isLoading } = useStudyPlans();
  const createPlan = useCreateStudyPlan();
  const deletePlan = useDeleteStudyPlan();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get enrolled courses
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments-for-planner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, courses(id, title)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activePlan = plans?.find(p => p.is_active) || plans?.[0];
  const displayPlan = selectedPlanId 
    ? plans?.find(p => p.id === selectedPlanId) 
    : activePlan;

  const { data: goals } = useStudyGoals(displayPlan?.id);

  const handleCreatePlan = async () => {
    if (!selectedCourseId || !examDate) {
      toast.error("Please select a course and exam date");
      return;
    }

    try {
      await createPlan.mutateAsync({
        course_id: selectedCourseId,
        exam_date: examDate,
        target_study_hours_per_week: hoursPerWeek[0],
      });
      setIsCreateOpen(false);
      setSelectedCourseId("");
      setExamDate("");
      setHoursPerWeek([10]);
      toast.success("Study plan created!");
    } catch {
      toast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan.mutateAsync(planId);
      toast.success("Plan deleted");
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  // Get week days for calendar
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const getGoalForDate = (date: Date) => {
    return goals?.find(g => isSameDay(new Date(g.date), date));
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Planner</h1>
            <p className="text-muted-foreground">
              Set exam dates and track your daily study goals
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Study Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrollments?.map((e) => (
                        <SelectItem key={e.course_id} value={e.course_id}>
                          {(e.courses as { title: string })?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Study Hours per Week: {hoursPerWeek[0]}</Label>
                  <Slider
                    value={hoursPerWeek}
                    onValueChange={setHoursPerWeek}
                    min={5}
                    max={40}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    ~{Math.round((hoursPerWeek[0] * 60) / 7)} minutes per day
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCreatePlan}
                  disabled={createPlan.isPending}
                >
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48 md:col-span-2" />
          </div>
        ) : !plans?.length ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No study plans yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a plan by setting your exam date and study goals
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Plans List */}
            <div className="space-y-4">
              <h3 className="font-semibold">Your Plans</h3>
              {plans.map((plan) => {
                const daysLeft = differenceInDays(new Date(plan.exam_date), new Date());
                return (
                  <Card 
                    key={plan.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      displayPlan?.id === plan.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium line-clamp-1">
                            {plan.courses?.title || "Course"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(plan.exam_date), "MMM d, yyyy")}
                          </p>
                          <p className={cn(
                            "text-sm font-medium mt-1",
                            daysLeft <= 7 ? "text-destructive" : 
                            daysLeft <= 30 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {daysLeft > 0 ? `${daysLeft} days left` : "Exam passed"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Right Column: Selected Plan Details */}
            {displayPlan && (
              <div className="md:col-span-2 space-y-6">
                {/* Exam Countdown */}
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        {displayPlan.courses?.title || "Exam"}
                      </h3>
                      <div className="text-5xl font-bold text-primary mb-2">
                        {Math.max(0, differenceInDays(new Date(displayPlan.exam_date), new Date()))}
                      </div>
                      <p className="text-muted-foreground">days until exam</p>
                      <p className="text-sm mt-2">
                        {format(new Date(displayPlan.exam_date), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Week View */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => {
                        const goal = getGoalForDate(day);
                        const progress = goal 
                          ? Math.min((goal.actual_minutes / goal.target_minutes) * 100, 100)
                          : 0;
                        
                        return (
                          <div 
                            key={day.toISOString()}
                            className={cn(
                              "text-center p-2 rounded-lg border",
                              isToday(day) && "ring-2 ring-primary",
                              goal?.completed && "bg-green-50 dark:bg-green-950 border-green-200"
                            )}
                          >
                            <p className="text-xs text-muted-foreground">
                              {format(day, "EEE")}
                            </p>
                            <p className="font-semibold">{format(day, "d")}</p>
                            {goal ? (
                              <div className="mt-2">
                                {goal.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                ) : (
                                  <Progress value={progress} className="h-1" />
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {goal.target_minutes}m
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-2">-</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Study Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="py-4 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{displayPlan.target_study_hours_per_week}</p>
                      <p className="text-xs text-muted-foreground">hours/week goal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4 text-center">
                      <Target className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">
                        {Math.round((displayPlan.target_study_hours_per_week * 60) / 7)}
                      </p>
                      <p className="text-xs text-muted-foreground">min/day goal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4 text-center">
                      <CheckCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">
                        {goals?.filter(g => g.completed).length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">days completed</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudyPlanner;
