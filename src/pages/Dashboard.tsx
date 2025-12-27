import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  Play,
  Calendar,
  Award,
  Brain,
  Zap
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = () => {
  // Mock data for charts
  const progressData = [
    { week: "W1", score: 45 },
    { week: "W2", score: 52 },
    { week: "W3", score: 48 },
    { week: "W4", score: 61 },
    { week: "W5", score: 68 },
    { week: "W6", score: 74 },
    { week: "W7", score: 72 },
    { week: "W8", score: 81 },
  ];

  const competencyData = [
    { subject: "Economics", score: 85, fullMark: 100 },
    { subject: "Costing", score: 72, fullMark: 100 },
    { subject: "Financial Reporting", score: 68, fullMark: 100 },
    { subject: "Governance", score: 91, fullMark: 100 },
    { subject: "Analysis", score: 78, fullMark: 100 },
    { subject: "Decision Making", score: 64, fullMark: 100 },
  ];

  const questionHistory = [
    { topic: "Microeconomics", correct: 42, incorrect: 8 },
    { topic: "Macroeconomics", correct: 35, incorrect: 15 },
    { topic: "Cost Analysis", correct: 28, incorrect: 22 },
    { topic: "Governance", correct: 48, incorrect: 2 },
    { topic: "Ethics", correct: 38, incorrect: 12 },
  ];

  const weakAreas = [
    { topic: "Cost-Volume-Profit Analysis", score: 52, priority: "high" },
    { topic: "Activity-Based Costing", score: 58, priority: "high" },
    { topic: "Macroeconomic Policy", score: 64, priority: "medium" },
    { topic: "Transfer Pricing", score: 68, priority: "medium" },
  ];

  const suggestedSessions = [
    { title: "CVP Analysis Deep Dive", duration: "45 min", type: "Video + Practice" },
    { title: "ABC Costing Fundamentals", duration: "30 min", type: "Interactive" },
    { title: "Mock Exam: Management Accounting", duration: "2 hours", type: "Practice Test" },
    { title: "Quick Review: Governance", duration: "15 min", type: "Flashcards" },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute top-10 right-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm font-medium mb-3">
                Demo Dashboard
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                Welcome back, Sarah! 👋
              </h1>
              <p className="text-primary-foreground/70">
                You're making great progress on your P1 Management Accounting course.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full">
            <path d="M0 40L1440 40L1440 0C1200 30 720 40 0 15L0 40Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Syllabus Completed", value: "68%", icon: BookOpen, color: "text-primary" },
              { label: "Study Hours", value: "42h", icon: Clock, color: "text-teal" },
              { label: "Questions Practiced", value: "347", icon: Target, color: "text-accent" },
              { label: "Current Streak", value: "12 days", icon: Zap, color: "text-yellow-500" },
            ].map((stat) => (
              <Card key={stat.label} className="p-6 hover-lift">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Score Progress
                  </h2>
                  <span className="text-sm text-muted-foreground">Last 8 weeks</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Competency Radar */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Brain className="w-5 h-5 text-accent" />
                    Competency Analysis
                  </h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={competencyData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Question History */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-teal" />
                    Practice Question History
                  </h2>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionHistory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="topic" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="correct" fill="hsl(var(--accent))" stackId="a" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="incorrect" fill="hsl(var(--destructive))" stackId="a" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-accent" />
                    <span className="text-sm text-muted-foreground">Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive" />
                    <span className="text-sm text-muted-foreground">Incorrect</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Course Progress */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Current Course
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">P1 Management Accounting</span>
                      <span className="text-muted-foreground">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-muted-foreground">Lessons</p>
                      <p className="font-semibold text-foreground">34 / 50</p>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-muted-foreground">Quizzes</p>
                      <p className="font-semibold text-foreground">8 / 12</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Weak Areas */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Areas to Improve
                </h3>
                <div className="space-y-3">
                  {weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{area.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={area.score} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{area.score}%</span>
                        </div>
                      </div>
                      <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${
                        area.priority === "high" 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}>
                        {area.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Suggested Sessions */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Suggested Next Sessions
                </h3>
                <div className="space-y-3">
                  {suggestedSessions.map((session, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-foreground">{session.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration}
                        </span>
                        <span>{session.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Schedule
                </Button>
              </Card>

              {/* Achievement */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Award className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">12 Day Streak!</p>
                    <p className="text-sm text-muted-foreground">Keep it up! You're on fire 🔥</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
