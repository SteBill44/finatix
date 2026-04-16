import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EnrolledUsersTab, { EnrolledUser } from "./enrollment/EnrolledUsersTab";
import AvailableUsersTab, { AvailableUser } from "./enrollment/AvailableUsersTab";

interface Course {
  id: string;
  title: string;
  level: string;
}

const LEVEL_BADGE_STYLES: Record<string, string> = {
  certificate: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  operational: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  management: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  strategic: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const BulkEnrollmentManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);

  const [selectedToUnenroll, setSelectedToUnenroll] = useState<Set<string>>(new Set());
  const [selectedToEnroll, setSelectedToEnroll] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [confirmUnenroll, setConfirmUnenroll] = useState(false);
  const [confirmEnroll, setConfirmEnroll] = useState(false);
  const [activeTab, setActiveTab] = useState("enrolled");

  const [enrolledSearch, setEnrolledSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [enrolledPage, setEnrolledPage] = useState(1);
  const [availablePage, setAvailablePage] = useState(1);

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchEnrolledUsers(selectedCourseId);
      fetchAvailableUsers(selectedCourseId);
    } else {
      setEnrolledUsers([]);
      setAvailableUsers([]);
      setSelectedToUnenroll(new Set());
      setSelectedToEnroll(new Set());
    }
    setEnrolledSearch("");
    setAvailableSearch("");
    setEnrolledPage(1);
    setAvailablePage(1);
  }, [selectedCourseId]);

  useEffect(() => { setEnrolledPage(1); }, [enrolledSearch]);
  useEffect(() => { setAvailablePage(1); }, [availableSearch]);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("id, title, level").order("title");
    if (error) toast.error("Failed to fetch courses");
    else setCourses(data || []);
  };

  const fetchEnrolledUsers = async (courseId: string) => {
    setLoading(true);

    const { data: enrollmentsData, error: enrollErr } = await supabase
      .from("enrollments")
      .select("id, user_id, enrolled_at, completed_at, profiles!inner(full_name)")
      .eq("course_id", courseId)
      .order("enrolled_at", { ascending: false });

    if (enrollErr) {
      toast.error("Failed to fetch enrolled users");
      setEnrolledUsers([]);
      setLoading(false);
      return;
    }

    const { data: lessonsData } = await supabase.from("lessons").select("id").eq("course_id", courseId);
    const totalLessons = lessonsData?.length || 0;
    const lessonIds = lessonsData?.map((l) => l.id) || [];
    const userIds = enrollmentsData?.map((e: any) => e.user_id) || [];

    let progressMap: Record<string, number> = {};
    if (userIds.length > 0 && lessonIds.length > 0) {
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("user_id, lesson_id, completed")
        .in("user_id", userIds)
        .in("lesson_id", lessonIds)
        .eq("completed", true);

      progressData?.forEach((p) => {
        progressMap[p.user_id] = (progressMap[p.user_id] || 0) + 1;
      });
    }

    setEnrolledUsers(
      (enrollmentsData || []).map((e: any) => ({
        enrollment_id: e.id,
        user_id: e.user_id,
        full_name: e.profiles?.full_name || "Unknown User",
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
        lessons_completed: progressMap[e.user_id] || 0,
        total_lessons: totalLessons,
      }))
    );
    setLoading(false);
  };

  const fetchAvailableUsers = async (courseId: string) => {
    setLoadingAvailable(true);

    const { data: allProfiles, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at")
      .order("full_name");

    if (profileErr) {
      toast.error("Failed to fetch users");
      setAvailableUsers([]);
      setLoadingAvailable(false);
      return;
    }

    const { data: enrollments, error: enrollErr } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", courseId);

    if (enrollErr) {
      toast.error("Failed to fetch enrollments");
      setAvailableUsers([]);
      setLoadingAvailable(false);
      return;
    }

    const enrolledIds = new Set(enrollments?.map((e) => e.user_id) || []);
    setAvailableUsers(
      (allProfiles || [])
        .filter((p) => !enrolledIds.has(p.user_id))
        .map((p) => ({ user_id: p.user_id, full_name: p.full_name, created_at: p.created_at }))
    );
    setLoadingAvailable(false);
  };

  const handleBulkUnenroll = async () => {
    if (selectedToUnenroll.size === 0) return;
    setUnenrolling(true);
    const ids = Array.from(selectedToUnenroll);
    const { error } = await supabase.from("enrollments").delete().in("id", ids);
    if (error) {
      toast.error("Failed to unenroll users");
    } else {
      toast.success(`Successfully unenrolled ${ids.length} user(s)`);
      setEnrolledUsers((prev) => prev.filter((u) => !selectedToUnenroll.has(u.enrollment_id)));
      setSelectedToUnenroll(new Set());
      if (selectedCourseId) fetchAvailableUsers(selectedCourseId);
    }
    setUnenrolling(false);
    setConfirmUnenroll(false);
  };

  const handleBulkEnroll = async () => {
    if (selectedToEnroll.size === 0 || !selectedCourseId) return;
    setEnrolling(true);
    const rows = Array.from(selectedToEnroll).map((userId) => ({ user_id: userId, course_id: selectedCourseId }));
    const { error } = await supabase.from("enrollments").insert(rows);
    if (error) {
      toast.error("Failed to enroll users");
    } else {
      toast.success(`Successfully enrolled ${rows.length} user(s)`);
      setSelectedToEnroll(new Set());
      fetchEnrolledUsers(selectedCourseId);
      fetchAvailableUsers(selectedCourseId);
    }
    setEnrolling(false);
    setConfirmEnroll(false);
  };

  const handleExportCSV = () => {
    if (enrolledUsers.length === 0) { toast.error("No enrolled users to export"); return; }
    setExporting(true);
    const courseName = courses.find((c) => c.id === selectedCourseId)?.title || "Unknown";
    const headers = ["Name", "Enrolled Date", "Status", "Lessons Completed", "Total Lessons", "Progress %"];
    const rows = enrolledUsers.map((u) => {
      const pct = u.total_lessons > 0 ? Math.round((u.lessons_completed / u.total_lessons) * 100) : 0;
      return [u.full_name || "Unknown", new Date(u.enrolled_at).toLocaleDateString(), u.completed_at ? "Completed" : "In Progress", String(u.lessons_completed), String(u.total_lessons), `${pct}%`];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `${courseName.replace(/[^a-z0-9]/gi, "_")}_enrollments.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${enrolledUsers.length} enrolled users to CSV`);
    setExporting(false);
  };

  const toggleUnenroll = (id: string) => {
    const next = new Set(selectedToUnenroll);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedToUnenroll(next);
  };

  const toggleEnroll = (id: string) => {
    const next = new Set(selectedToEnroll);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedToEnroll(next);
  };

  const toggleAllUnenroll = () => {
    const filtered = enrolledSearch.trim()
      ? enrolledUsers.filter((u) => u.full_name?.toLowerCase().includes(enrolledSearch.toLowerCase()))
      : enrolledUsers;
    const page = filtered.slice((enrolledPage - 1) * 20, enrolledPage * 20);
    const allSelected = page.every((u) => selectedToUnenroll.has(u.enrollment_id));
    setSelectedToUnenroll((prev) => {
      const next = new Set(prev);
      page.forEach((u) => allSelected ? next.delete(u.enrollment_id) : next.add(u.enrollment_id));
      return next;
    });
  };

  const toggleAllEnroll = () => {
    const filtered = availableSearch.trim()
      ? availableUsers.filter((u) => u.full_name?.toLowerCase().includes(availableSearch.toLowerCase()))
      : availableUsers;
    const page = filtered.slice((availablePage - 1) * 20, availablePage * 20);
    const allSelected = page.every((u) => selectedToEnroll.has(u.user_id));
    setSelectedToEnroll((prev) => {
      const next = new Set(prev);
      page.forEach((u) => allSelected ? next.delete(u.user_id) : next.add(u.user_id));
      return next;
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Enrollment Management
        </CardTitle>
        <CardDescription>Select a course to enroll or unenroll multiple users at once.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-[400px]">
            <SelectValue placeholder="Select a course to manage enrollments" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                <span className="flex items-center gap-2">
                  {course.title}
                  <Badge variant="outline" className={LEVEL_BADGE_STYLES[course.level.toLowerCase()] || "bg-muted text-muted-foreground"}>
                    {course.level}
                  </Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCourseId && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="enrolled" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Enrolled ({enrolledUsers.length})
              </TabsTrigger>
              <TabsTrigger value="enroll" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Enroll Users ({availableUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enrolled" className="mt-4">
              <EnrolledUsersTab
                users={enrolledUsers}
                searchQuery={enrolledSearch}
                onSearchChange={setEnrolledSearch}
                selectedIds={selectedToUnenroll}
                onToggleUser={toggleUnenroll}
                onToggleAll={toggleAllUnenroll}
                page={enrolledPage}
                onPageChange={setEnrolledPage}
                loading={loading}
                unenrolling={unenrolling}
                exporting={exporting}
                onUnenrollClick={() => setConfirmUnenroll(true)}
                onExportCSV={handleExportCSV}
              />
            </TabsContent>

            <TabsContent value="enroll" className="mt-4">
              <AvailableUsersTab
                users={availableUsers}
                searchQuery={availableSearch}
                onSearchChange={setAvailableSearch}
                selectedIds={selectedToEnroll}
                onToggleUser={toggleEnroll}
                onToggleAll={toggleAllEnroll}
                page={availablePage}
                onPageChange={setAvailablePage}
                loading={loadingAvailable}
                enrolling={enrolling}
                onEnrollClick={() => setConfirmEnroll(true)}
              />
            </TabsContent>
          </Tabs>
        )}

        <AlertDialog open={confirmUnenroll} onOpenChange={setConfirmUnenroll}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unenroll {selectedToUnenroll.size} user(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all their progress for "{selectedCourse?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={unenrolling}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkUnenroll}
                disabled={unenrolling}
              >
                {unenrolling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Unenrolling...</> : "Unenroll All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmEnroll} onOpenChange={setConfirmEnroll}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enroll {selectedToEnroll.size} user(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                Enroll {selectedToEnroll.size} user(s) in "{selectedCourse?.title}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={enrolling}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkEnroll} disabled={enrolling}>
                {enrolling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enrolling...</> : "Enroll All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default BulkEnrollmentManagement;
