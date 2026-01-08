import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  level: string;
}

interface EnrolledUser {
  enrollment_id: string;
  user_id: string;
  full_name: string | null;
  enrolled_at: string;
  completed_at: string | null;
}

interface AvailableUser {
  user_id: string;
  full_name: string | null;
  created_at: string;
}

const BulkEnrollmentManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUsersToEnroll, setSelectedUsersToEnroll] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("enrolled");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchEnrolledUsers(selectedCourseId);
      fetchAvailableUsers(selectedCourseId);
    } else {
      setEnrolledUsers([]);
      setAvailableUsers([]);
      setSelectedUsers(new Set());
      setSelectedUsersToEnroll(new Set());
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, level")
      .order("title");

    if (error) {
      toast.error("Failed to fetch courses");
    } else {
      setCourses(data || []);
    }
  };

  const fetchEnrolledUsers = async (courseId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        enrolled_at,
        completed_at,
        profiles!inner(full_name)
      `)
      .eq("course_id", courseId)
      .order("enrolled_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch enrolled users");
      setEnrolledUsers([]);
    } else {
      const users: EnrolledUser[] = (data || []).map((enrollment: any) => ({
        enrollment_id: enrollment.id,
        user_id: enrollment.user_id,
        full_name: enrollment.profiles?.full_name || "Unknown User",
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
      }));
      setEnrolledUsers(users);
    }
    setLoading(false);
  };

  const fetchAvailableUsers = async (courseId: string) => {
    setLoadingAvailable(true);
    
    // Fetch all profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at")
      .order("full_name");

    if (profilesError) {
      toast.error("Failed to fetch users");
      setAvailableUsers([]);
      setLoadingAvailable(false);
      return;
    }

    // Fetch enrolled user IDs for this course
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", courseId);

    if (enrollmentsError) {
      toast.error("Failed to fetch enrollments");
      setAvailableUsers([]);
      setLoadingAvailable(false);
      return;
    }

    const enrolledUserIds = new Set(enrollments?.map(e => e.user_id) || []);
    
    // Filter out already enrolled users
    const available = (allProfiles || [])
      .filter(p => !enrolledUserIds.has(p.user_id))
      .map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        created_at: p.created_at,
      }));

    setAvailableUsers(available);
    setLoadingAvailable(false);
  };

  const toggleUserSelection = (enrollmentId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(enrollmentId)) {
      newSelected.delete(enrollmentId);
    } else {
      newSelected.add(enrollmentId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleUserToEnrollSelection = (userId: string) => {
    const newSelected = new Set(selectedUsersToEnroll);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsersToEnroll(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === enrolledUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(enrolledUsers.map(u => u.enrollment_id)));
    }
  };

  const toggleSelectAllToEnroll = () => {
    if (selectedUsersToEnroll.size === availableUsers.length) {
      setSelectedUsersToEnroll(new Set());
    } else {
      setSelectedUsersToEnroll(new Set(availableUsers.map(u => u.user_id)));
    }
  };

  const handleBulkUnenroll = async () => {
    if (selectedUsers.size === 0) return;

    setUnenrolling(true);
    const enrollmentIds = Array.from(selectedUsers);

    const { error } = await supabase
      .from("enrollments")
      .delete()
      .in("id", enrollmentIds);

    if (error) {
      toast.error("Failed to unenroll users");
    } else {
      toast.success(`Successfully unenrolled ${enrollmentIds.length} user(s)`);
      setEnrolledUsers(prev => prev.filter(u => !selectedUsers.has(u.enrollment_id)));
      setSelectedUsers(new Set());
      // Refresh available users
      if (selectedCourseId) {
        fetchAvailableUsers(selectedCourseId);
      }
    }

    setUnenrolling(false);
    setConfirmDialogOpen(false);
  };

  const handleBulkEnroll = async () => {
    if (selectedUsersToEnroll.size === 0 || !selectedCourseId) return;

    setEnrolling(true);
    const userIds = Array.from(selectedUsersToEnroll);

    const enrollments = userIds.map(userId => ({
      user_id: userId,
      course_id: selectedCourseId,
    }));

    const { error } = await supabase
      .from("enrollments")
      .insert(enrollments);

    if (error) {
      toast.error("Failed to enroll users");
    } else {
      toast.success(`Successfully enrolled ${userIds.length} user(s)`);
      setSelectedUsersToEnroll(new Set());
      // Refresh both lists
      if (selectedCourseId) {
        fetchEnrolledUsers(selectedCourseId);
        fetchAvailableUsers(selectedCourseId);
      }
    }

    setEnrolling(false);
    setEnrollDialogOpen(false);
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case "certificate":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "operational":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "management":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "strategic":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Enrollment Management
        </CardTitle>
        <CardDescription>
          Select a course to enroll or unenroll multiple users at once.
        </CardDescription>
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
                  <Badge variant="outline" className={getLevelBadgeStyle(course.level)}>
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
              {selectedUsers.size > 0 && (
                <div className="mb-4">
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={unenrolling}
                  >
                    {unenrolling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4 mr-2" />
                    )}
                    Unenroll Selected ({selectedUsers.size})
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : enrolledUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users enrolled in this course</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.size === enrolledUsers.length && enrolledUsers.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledUsers.map((user) => (
                        <TableRow key={user.enrollment_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.enrollment_id)}
                              onCheckedChange={() => toggleUserSelection(user.enrollment_id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.enrolled_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.completed_at ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="enroll" className="mt-4">
              {selectedUsersToEnroll.size > 0 && (
                <div className="mb-4">
                  <Button
                    onClick={() => setEnrollDialogOpen(true)}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Enroll Selected ({selectedUsersToEnroll.size})
                  </Button>
                </div>
              )}

              {loadingAvailable ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>All users are already enrolled in this course</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsersToEnroll.size === availableUsers.length && availableUsers.length > 0}
                            onCheckedChange={toggleSelectAllToEnroll}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsersToEnroll.has(user.user_id)}
                              onCheckedChange={() => toggleUserToEnrollSelection(user.user_id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.full_name || "Unknown User"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Unenroll Confirmation Dialog */}
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unenroll {selectedUsers.size} user(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unenroll {selectedUsers.size} user(s) from "{selectedCourse?.title}"?
                This will remove all their progress for this course. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={unenrolling}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkUnenroll}
                disabled={unenrolling}
              >
                {unenrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unenrolling...
                  </>
                ) : (
                  "Unenroll All"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Enroll Confirmation Dialog */}
        <AlertDialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enroll {selectedUsersToEnroll.size} user(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to enroll {selectedUsersToEnroll.size} user(s) in "{selectedCourse?.title}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={enrolling}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkEnroll}
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  "Enroll All"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default BulkEnrollmentManagement;
