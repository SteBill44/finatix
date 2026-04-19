import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Map, Plus, Pencil, Trash2, BookOpen, Clock, GripVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  level: string | null;
  slug: string;
}

interface LearningPathCourse {
  id: string;
  course_id: string;
  order_index: number;
  is_required: boolean | null;
  course: Course;
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: string | null;
  estimated_hours: number | null;
  is_published: boolean | null;
  created_at: string | null;
  path_courses?: LearningPathCourse[];
}

const EMPTY_PATH = {
  title: "",
  description: "",
  difficulty_level: "beginner",
  estimated_hours: "",
  is_published: false,
};

export default function LearningPathsManagement() {
  const queryClient = useQueryClient();
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [coursesDialogOpen, setCoursesDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [managingPath, setManagingPath] = useState<LearningPath | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PATH });
  const [addCourseId, setAddCourseId] = useState("");

  const { data: paths = [], isLoading } = useQuery({
    queryKey: ["admin_learning_paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_paths")
        .select(`
          *,
          path_courses:learning_path_courses(
            *,
            course:courses(id, title, level, slug)
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as LearningPath[];
    },
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ["admin_all_courses_for_paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, level, slug")
        .is("deleted_at", null)
        .order("title");
      if (error) throw error;
      return (data || []) as Course[];
    },
  });

  const upsertPath = useMutation({
    mutationFn: async (payload: typeof EMPTY_PATH & { id?: string }) => {
      const row = {
        title: payload.title,
        description: payload.description || null,
        difficulty_level: payload.difficulty_level || null,
        estimated_hours: payload.estimated_hours ? Number(payload.estimated_hours) : null,
        is_published: payload.is_published,
      };
      if (payload.id) {
        const { error } = await supabase.from("learning_paths").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("learning_paths").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_learning_paths"] });
      queryClient.invalidateQueries({ queryKey: ["learning_paths"] });
      toast.success(editingPath ? "Path updated" : "Path created");
      setPathDialogOpen(false);
      setEditingPath(null);
      setForm({ ...EMPTY_PATH });
    },
    onError: () => toast.error("Failed to save path"),
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("learning_paths").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_learning_paths"] });
      queryClient.invalidateQueries({ queryKey: ["learning_paths"] });
    },
  });

  const deletePath = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_paths").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_learning_paths"] });
      queryClient.invalidateQueries({ queryKey: ["learning_paths"] });
      toast.success("Path deleted");
    },
    onError: () => toast.error("Failed to delete path"),
  });

  const addCourseToPath = useMutation({
    mutationFn: async ({ pathId, courseId }: { pathId: string; courseId: string }) => {
      const existing = managingPath?.path_courses || [];
      const nextOrder = existing.length;
      const { error } = await supabase.from("learning_path_courses").insert({
        learning_path_id: pathId,
        course_id: courseId,
        order_index: nextOrder,
        is_required: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_learning_paths"] });
      setAddCourseId("");
      toast.success("Course added to path");
    },
    onError: () => toast.error("Failed to add course"),
  });

  const removeCourseFromPath = useMutation({
    mutationFn: async (pathCourseId: string) => {
      const { error } = await supabase.from("learning_path_courses").delete().eq("id", pathCourseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_learning_paths"] });
      toast.success("Course removed");
    },
  });

  const handleOpenEdit = (path?: LearningPath) => {
    if (path) {
      setEditingPath(path);
      setForm({
        title: path.title,
        description: path.description || "",
        difficulty_level: path.difficulty_level || "beginner",
        estimated_hours: path.estimated_hours?.toString() || "",
        is_published: path.is_published ?? false,
      });
    } else {
      setEditingPath(null);
      setForm({ ...EMPTY_PATH });
    }
    setPathDialogOpen(true);
  };

  const handleOpenCourses = (path: LearningPath) => {
    setManagingPath(path);
    setCoursesDialogOpen(true);
  };

  // Refresh managing path when query updates
  const currentManagingPath = managingPath
    ? paths.find((p) => p.id === managingPath.id) || managingPath
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Learning Paths
            </CardTitle>
            <CardDescription>
              Create structured study pathways that guide students through multiple courses in sequence.
            </CardDescription>
          </div>
          <Dialog open={pathDialogOpen} onOpenChange={(o) => { if (!o) { setPathDialogOpen(false); setEditingPath(null); }}}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenEdit()}>
                <Plus className="h-4 w-4 mr-2" />
                New Path
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPath ? "Edit Learning Path" : "Create Learning Path"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. Complete CIMA Qualification"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What will students achieve on this path?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Difficulty</Label>
                    <Select value={form.difficulty_level} onValueChange={(v) => setForm({ ...form, difficulty_level: v })}>
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
                  <div className="space-y-1.5">
                    <Label>Est. Hours</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 120"
                      value={form.estimated_hours}
                      onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="published"
                    checked={form.is_published}
                    onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                  />
                  <Label htmlFor="published">Published (visible to students)</Label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setPathDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => upsertPath.mutate({ ...form, id: editingPath?.id })}
                    disabled={!form.title.trim() || upsertPath.isPending}
                  >
                    {editingPath ? "Save Changes" : "Create Path"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : paths.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No learning paths yet. Create one to guide students through a sequence of courses.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium">{path.title}</span>
                      {path.is_published ? (
                        <Badge variant="default" className="text-xs">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      )}
                      {path.difficulty_level && (
                        <Badge variant="outline" className="text-xs capitalize">{path.difficulty_level}</Badge>
                      )}
                    </div>
                    {path.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{path.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {path.path_courses?.length || 0} courses
                      </span>
                      {path.estimated_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {path.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={path.is_published ?? false}
                      onCheckedChange={(v) => togglePublished.mutate({ id: path.id, is_published: v })}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleOpenCourses(path)}>
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      Courses
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(path)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete learning path?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{path.title}" and all associated course assignments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePath.mutate(path.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Courses Dialog */}
      <Dialog open={coursesDialogOpen} onOpenChange={setCoursesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Courses — {currentManagingPath?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing courses */}
            {currentManagingPath?.path_courses && currentManagingPath.path_courses.length > 0 ? (
              <div className="space-y-2">
                {currentManagingPath.path_courses
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((pc, i) => (
                    <div key={pc.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      <span className="w-5 h-5 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center flex-shrink-0 font-medium">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm truncate">{pc.course.title}</span>
                      {pc.course.level && (
                        <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{pc.course.level}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0"
                        onClick={() => removeCourseFromPath.mutate(pc.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No courses in this path yet.</p>
            )}

            <Separator />

            {/* Add course */}
            <div className="space-y-2">
              <Label>Add a Course</Label>
              <div className="flex gap-2">
                <Select value={addCourseId} onValueChange={setAddCourseId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCourses
                      .filter((c) => !currentManagingPath?.path_courses?.some((pc) => pc.course_id === c.id))
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!addCourseId || addCourseToPath.isPending}
                  onClick={() => {
                    if (currentManagingPath) {
                      addCourseToPath.mutate({ pathId: currentManagingPath.id, courseId: addCourseId });
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
