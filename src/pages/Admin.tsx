import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, BookOpen, Activity, GraduationCap, FileText, ClipboardList, ScrollText, Mail, Building2, DollarSign, LayoutDashboard, History, ListChecks } from "lucide-react";
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

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { toast } = useToast();

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

  return (
    <Layout>
      <div className="container mx-auto pt-24 lg:pt-28 pb-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage courses, lessons, users, and site settings</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex w-full h-auto gap-1 p-1 overflow-x-auto scrollbar-thin">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="content-status" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Content Status
            </TabsTrigger>
            <TabsTrigger value="syllabus" className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              Syllabus
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Enrollments
            </TabsTrigger>
            <TabsTrigger value="interest" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Interest
            </TabsTrigger>
            <TabsTrigger value="corporate" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Corporate
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
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
            <QuestionManagement />
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
