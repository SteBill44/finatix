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
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Users, BookOpen, Shield } from "lucide-react";

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
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

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

  // User role state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "user">("user");

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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    // Fetch profiles and their roles
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

  const handleAssignRole = async () => {
    if (!selectedUserId) return;

    // Check if user already has a role
    const existingRole = users.find((u) => u.user_id === selectedUserId)?.role;

    if (existingRole) {
      // Update existing role
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
      // Insert new role
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
          <p className="text-muted-foreground mt-2">Manage courses, users, and site settings</p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
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
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>Manage your course catalog</CardDescription>
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
                  <DialogContent className="max-w-lg">
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
                            <SelectContent>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {course.level}
                            </Badge>
                          </TableCell>
                          <TableCell>${course.price}</TableCell>
                          <TableCell>{course.duration_hours ? `${course.duration_hours}h` : "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
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
                        <TableRow key={userItem.user_id}>
                          <TableCell className="font-medium">{userItem.email}</TableCell>
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
                                  onClick={() => {
                                    setSelectedUserId(userItem.user_id);
                                    setNewRole(userItem.role || "user");
                                  }}
                                >
                                  {userItem.role ? "Change Role" : "Assign Role"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
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
                                    <SelectContent>
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
                                onClick={() => handleRemoveRole(userItem.user_id)}
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
      </div>
    </Layout>
  );
};

export default Admin;