import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, BookOpen, Activity, GraduationCap, FileText, ClipboardList, ScrollText, Mail, Building2, DollarSign, LayoutDashboard, History, ListChecks, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ResourceManagement from "@/components/admin/ResourceManagement";
import QuestionManagement from "@/components/admin/QuestionManagement";
import SyllabusManagement from "@/components/admin/SyllabusManagement";
import InterestManagement from "@/components/admin/InterestManagement";
import CorporateManagement from "@/components/admin/CorporateManagement";
import { PerformanceMonitoring } from "@/components/admin/PerformanceMonitoring";
import BulkEnrollmentManagement from "@/components/admin/BulkEnrollmentManagement";
import { CostMonitoringDashboard } from "@/components/admin/CostMonitoringDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import CourseManagement from "@/components/admin/CourseManagement";
import UserManagement from "@/components/admin/UserManagement";
import ContentStatusDashboard from "@/components/admin/ContentStatusDashboard";
import QuestionGenerator from "@/components/admin/QuestionGenerator";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const contentTabs = ["courses", "content-status", "syllabus", "questions", "resources"];
  const usersTabs = ["users", "enrollments", "interest", "corporate"];
  const systemTabs = ["performance", "costs", "audit"];

  const getContentLabel = () => {
    const labels: Record<string, string> = {
      courses: "Courses",
      "content-status": "Content Status",
      syllabus: "Syllabus",
      questions: "Questions",
      resources: "Resources",
    };
    return contentTabs.includes(activeTab) ? labels[activeTab] : "Content";
  };

  const getUsersLabel = () => {
    const labels: Record<string, string> = {
      users: "Users",
      enrollments: "Enrollments",
      interest: "Interest",
      corporate: "Corporate",
    };
    return usersTabs.includes(activeTab) ? labels[activeTab] : "Users";
  };

  const getSystemLabel = () => {
    const labels: Record<string, string> = {
      performance: "Performance",
      costs: "Costs",
      audit: "Audit Log",
    };
    return systemTabs.includes(activeTab) ? labels[activeTab] : "System";
  };

  return (
    <Layout>
      <div className="container mx-auto pt-24 lg:pt-28 pb-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage courses, lessons, users, and site settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full h-auto gap-1 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>

            {/* Content Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${contentTabs.includes(activeTab) ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {getContentLabel()}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setActiveTab("courses")}>
                  <BookOpen className="h-4 w-4 mr-2" /> Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("content-status")}>
                  <ListChecks className="h-4 w-4 mr-2" /> Content Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("syllabus")}>
                  <ScrollText className="h-4 w-4 mr-2" /> Syllabus
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("questions")}>
                  <ClipboardList className="h-4 w-4 mr-2" /> Questions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("resources")}>
                  <FileText className="h-4 w-4 mr-2" /> Resources
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Users Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${usersTabs.includes(activeTab) ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  <Users className="h-4 w-4 mr-2" />
                  {getUsersLabel()}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setActiveTab("users")}>
                  <Users className="h-4 w-4 mr-2" /> Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("enrollments")}>
                  <GraduationCap className="h-4 w-4 mr-2" /> Enrollments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("interest")}>
                  <Mail className="h-4 w-4 mr-2" /> Interest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("corporate")}>
                  <Building2 className="h-4 w-4 mr-2" /> Corporate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* System Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${systemTabs.includes(activeTab) ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  <Activity className="h-4 w-4 mr-2" />
                  {getSystemLabel()}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setActiveTab("performance")}>
                  <Activity className="h-4 w-4 mr-2" /> Performance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("costs")}>
                  <DollarSign className="h-4 w-4 mr-2" /> Costs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("audit")}>
                  <History className="h-4 w-4 mr-2" /> Audit Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <AdminAuditLog />
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <BulkEnrollmentManagement />
          </TabsContent>

          {/* Interest Tab */}
          <TabsContent value="interest">
            <InterestManagement />
          </TabsContent>

          {/* Corporate Tab */}
          <TabsContent value="corporate">
            <CorporateManagement />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Monitoring
                </CardTitle>
                <CardDescription>
                  Monitor API response times, error rates, and user activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMonitoring />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Monitoring Tab */}
          <TabsContent value="costs">
            <CostMonitoringDashboard />
          </TabsContent>

          {/* Syllabus Tab */}
          <TabsContent value="syllabus">
            <SyllabusManagement />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <div className="space-y-6">
              <QuestionGenerator />
              <QuestionManagement />
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <ResourceManagement />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          {/* Content Status Tab */}
          <TabsContent value="content-status">
            <ContentStatusDashboard />
          </TabsContent>


          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
