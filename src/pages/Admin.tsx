import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Users, BookOpen, Shield, ChevronDown, ChevronRight, GraduationCap, Eye } from "lucide-react";
import UserDetailSheet from "@/components/admin/UserDetailSheet";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  price: number;
  duration_hours: number | null;
  image_url: string | null;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  duration_minutes: number | null;
  order_index: number;
}

interface UserWithRole {
  user_id: string;
  email: string;
  role: "admin" | "user" | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Course form state
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    level: "beginner",
    price: 0,
    duration_hours: 0,
    image_url: "",
  });

  // Lesson form state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    duration_minutes: 0,
    order_index: 0,
  });

  // User role state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "user">("user");

  // User detail sheet state
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<{ userId: string; role: "admin" | "user" | null } | null>(null);

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

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching courses", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setLoadingCourses(false);
  };

  const fetchLessons = async (courseId: string) => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (error) {
      toast({ title: "Error fetching lessons", description: error.message, variant: "destructive" });
    } else {
      setLessons((prev) => ({ ...prev, [courseId]: data || [] }));
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at");

    if (profilesError) {
      toast({ title: "Error fetching users", description: profilesError.message, variant: "destructive" });
      setLoadingUsers(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast({ title: "Error fetching roles", description: rolesError.message, variant: "destructive" });
    }

    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        user_id: profile.user_id,
        email: profile.full_name || "Unknown",
        role: userRole?.role || null,
        created_at: profile.created_at,
      };
    });

    setUsers(usersWithRoles);
    setLoadingUsers(false);
  };

  const toggleCourseExpanded = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
      if (!lessons[courseId]) {
        fetchLessons(courseId);
      }
    }
    setExpandedCourses(newExpanded);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.slug) {
      toast({ title: "Validation Error", description: "Title and slug are required.", variant: "destructive" });
      return;
    }

    const courseData = {
      title: courseForm.title,
      slug: courseForm.slug,
      description: courseForm.description || null,
      level: courseForm.level,
      price: courseForm.price,
      duration_hours: courseForm.duration_hours || null,
      image_url: courseForm.image_url || null,
    };

    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", editingCourse.id);

      if (error) {
        toast({ title: "Error updating course", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Course updated successfully" });
        fetchCourses();
      }
    } else {
      const { error } = await supabase.from("courses").insert(courseData);

      if (error) {
        toast({ title: "Error creating course", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Course created successfully" });
        fetchCourses();
      }
    }

    setCourseDialogOpen(false);
    resetCourseForm();
  };

  const handleDeleteCourse = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Course deleted successfully" });
      fetchCourses();
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      level: course.level,
      price: course.price,
      duration_hours: course.duration_hours || 0,
      image_url: course.image_url || "",
    });
    setCourseDialogOpen(true);
  };

  const resetCourseForm = () => {
    setEditingCourse(null);
    setCourseForm({
      title: "",
      slug: "",
      description: "",
      level: "beginner",
      price: 0,
      duration_hours: 0,
      image_url: "",
    });
  };

  // Lesson handlers
  const handleSaveLesson = async () => {
    if (!lessonForm.title || !selectedCourseId) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }

    const lessonData = {
      course_id: selectedCourseId,
      title: lessonForm.title,
      description: lessonForm.description || null,
      content: lessonForm.content || null,
      duration_minutes: lessonForm.duration_minutes || null,
      order_index: lessonForm.order_index,
    };

    if (editingLesson) {
      const { error } = await supabase
        .from("lessons")
        .update(lessonData)
        .eq("id", editingLesson.id);

      if (error) {
        toast({ title: "Error updating lesson", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Lesson updated successfully" });
        fetchLessons(selectedCourseId);
      }
    } else {
      const { error } = await supabase.from("lessons").insert(lessonData);

      if (error) {
        toast({ title: "Error creating lesson", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Lesson created successfully" });
        fetchLessons(selectedCourseId);
      }
    }

    setLessonDialogOpen(false);
    resetLessonForm();
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);

    if (error) {
      toast({ title: "Error deleting lesson", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lesson deleted successfully" });
      fetchLessons(lesson.course_id);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setSelectedCourseId(lesson.course_id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      duration_minutes: lesson.duration_minutes || 0,
      order_index: lesson.order_index,
    });
    setLessonDialogOpen(true);
  };

  const handleAddLesson = (courseId: string) => {
    setSelectedCourseId(courseId);
    const courseLessons = lessons[courseId] || [];
    const maxOrder = courseLessons.length > 0 ? Math.max(...courseLessons.map((l) => l.order_index)) : -1;
    setLessonForm({
      title: "",
      description: "",
      content: "",
      duration_minutes: 0,
      order_index: maxOrder + 1,
    });
    setLessonDialogOpen(true);
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setSelectedCourseId(null);
    setLessonForm({
      title: "",
      description: "",
      content: "",
      duration_minutes: 0,
      order_index: 0,
    });
  };

  const handleAssignRole = async () => {
    if (!selectedUserId) return;

    const existingRole = users.find((u) => u.user_id === selectedUserId)?.role;

    if (existingRole) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", selectedUserId);

      if (error) {
        toast({ title: "Error updating role", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Role updated successfully" });
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUserId, role: newRole });

      if (error) {
        toast({ title: "Error assigning role", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Role assigned successfully" });
        fetchUsers();
      }
    }

    setRoleDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleRemoveRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);

    if (error) {
      toast({ title: "Error removing role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed successfully" });
      fetchUsers();
    }
  };

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
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage courses, lessons, users, and site settings</p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses & Lessons
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Courses & Lessons</CardTitle>
                  <CardDescription>Manage your course catalog and lesson content</CardDescription>
                </div>
                <Dialog open={courseDialogOpen} onOpenChange={(open) => {
                  setCourseDialogOpen(open);
                  if (!open) resetCourseForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-background">
                    <DialogHeader>
                      <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                      <DialogDescription>
                        {editingCourse ? "Update course details below." : "Fill in the details for the new course."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          placeholder="Course title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                          id="slug"
                          value={courseForm.slug}
                          onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                          placeholder="course-slug"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          placeholder="Course description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="level">Level</Label>
                          <Select
                            value={courseForm.level}
                            onValueChange={(value) => setCourseForm({ ...courseForm, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            value={courseForm.price}
                            onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Duration (hours)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={courseForm.duration_hours}
                            onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            value={courseForm.image_url}
                            onChange={(e) => setCourseForm({ ...courseForm, image_url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveCourse}>
                        {editingCourse ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <div className="text-center py-8 text-muted-foreground">Loading courses...</div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No courses found. Create your first course!</div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <Collapsible
                        key={course.id}
                        open={expandedCourses.has(course.id)}
                        onOpenChange={() => toggleCourseExpanded(course.id)}
                      >
                        <div className="border rounded-lg">
                          <div className="flex items-center justify-between p-4 bg-muted/50">
                            <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                              {expandedCourses.has(course.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <div>
                                <div className="font-medium">{course.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Badge variant="secondary" className="capitalize text-xs">
                                    {course.level}
                                  </Badge>
                                  <span>${course.price}</span>
                                  {course.duration_hours && <span>• {course.duration_hours}h</span>}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCourse(course);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCourse(course.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 border-t">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  Lessons
                                </h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddLesson(course.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Lesson
                                </Button>
                              </div>
                              {!lessons[course.id] ? (
                                <div className="text-sm text-muted-foreground">Loading lessons...</div>
                              ) : lessons[course.id].length === 0 ? (
                                <div className="text-sm text-muted-foreground">No lessons yet. Add your first lesson!</div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">#</TableHead>
                                      <TableHead>Title</TableHead>
                                      <TableHead>Duration</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lessons[course.id].map((lesson) => (
                                      <TableRow key={lesson.id}>
                                        <TableCell className="text-muted-foreground">{lesson.order_index + 1}</TableCell>
                                        <TableCell className="font-medium">{lesson.title}</TableCell>
                                        <TableCell>{lesson.duration_minutes ? `${lesson.duration_minutes} min` : "-"}</TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditLesson(lesson)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteLesson(lesson)}
                                          >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Dialog */}
            <Dialog open={lessonDialogOpen} onOpenChange={(open) => {
              setLessonDialogOpen(open);
              if (!open) resetLessonForm();
            }}>
              <DialogContent className="max-w-2xl bg-background">
                <DialogHeader>
                  <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
                  <DialogDescription>
                    {editingLesson ? "Update lesson details below." : "Fill in the details for the new lesson."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lesson-title">Title *</Label>
                    <Input
                      id="lesson-title"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="Lesson title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lesson-description">Description</Label>
                    <Textarea
                      id="lesson-description"
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                      placeholder="Brief lesson description"
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lesson-content">Content</Label>
                    <Textarea
                      id="lesson-content"
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      placeholder="Lesson content (supports markdown)"
                      rows={8}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                      <Input
                        id="lesson-duration"
                        type="number"
                        value={lessonForm.duration_minutes}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lesson-order">Order Index</Label>
                      <Input
                        id="lesson-order"
                        type="number"
                        value={lessonForm.order_index}
                        onChange={(e) => setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLesson}>
                    {editingLesson ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users & Roles</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No users found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow 
                          key={userItem.user_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedUserForDetail({ userId: userItem.user_id, role: userItem.role });
                            setUserDetailOpen(true);
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              {userItem.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {userItem.role ? (
                              <Badge variant={userItem.role === "admin" ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                                {userItem.role === "admin" && <Shield className="h-3 w-3" />}
                                {userItem.role}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No role</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(userItem.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Dialog open={roleDialogOpen && selectedUserId === userItem.user_id} onOpenChange={(open) => {
                              setRoleDialogOpen(open);
                              if (!open) setSelectedUserId(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUserId(userItem.user_id);
                                    setNewRole(userItem.role || "user");
                                  }}
                                >
                                  {userItem.role ? "Change Role" : "Assign Role"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-background">
                                <DialogHeader>
                                  <DialogTitle>Manage Role</DialogTitle>
                                  <DialogDescription>
                                    Assign or update the role for this user.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="role">Role</Label>
                                  <Select
                                    value={newRole}
                                    onValueChange={(value: "admin" | "user") => setNewRole(value)}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleAssignRole}>Save</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            {userItem.role && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveRole(userItem.user_id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Detail Sheet */}
        <UserDetailSheet
          userId={selectedUserForDetail?.userId || null}
          userRole={selectedUserForDetail?.role || null}
          open={userDetailOpen}
          onOpenChange={setUserDetailOpen}
        />
      </div>
    </Layout>
  );
};

export default Admin;