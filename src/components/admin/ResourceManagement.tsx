import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAllResources, useCreateResource, useUpdateResource, useDeleteResource } from "@/hooks/useResources";
import { Plus, Trash2, Pencil, Upload, FileText, File, Download, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  course_id: string;
}

const ResourceManagement = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    file_url: "",
    file_type: "",
    file_size: 0,
  });

  const { data: resources, isLoading: resourcesLoading } = useAllResources();
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  // Fetch courses
  const { data: courses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch lessons for selected course
  const { data: lessons } = useQuery({
    queryKey: ["admin-lessons", selectedCourse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, course_id")
        .eq("course_id", selectedCourse)
        .order("order_index");
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!selectedCourse,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        file_url: publicUrl,
        file_type: fileExt || "unknown",
        file_size: file.size,
        title: prev.title || file.name.replace(`.${fileExt}`, ""),
      }));

      toast({ title: "File uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.file_url || !selectedLesson) {
      toast({ title: "Validation Error", description: "Title, file, and lesson are required.", variant: "destructive" });
      return;
    }

    try {
      if (editingResource) {
        await updateResource.mutateAsync({
          id: editingResource.id,
          title: form.title,
          description: form.description || undefined,
        });
        toast({ title: "Resource updated successfully" });
      } else {
        await createResource.mutateAsync({
          lesson_id: selectedLesson,
          title: form.title,
          description: form.description || undefined,
          file_url: form.file_url,
          file_type: form.file_type,
          file_size: form.file_size || undefined,
        });
        toast({ title: "Resource created successfully" });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error saving resource", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResource.mutateAsync(id);
      toast({ title: "Resource deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error deleting resource", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    setSelectedCourse(resource.lessons?.course_id || "");
    setSelectedLesson(resource.lesson_id);
    setForm({
      title: resource.title,
      description: resource.description || "",
      file_url: resource.file_url,
      file_type: resource.file_type,
      file_size: resource.file_size || 0,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingResource(null);
    setSelectedCourse("");
    setSelectedLesson("");
    setForm({
      title: "",
      description: "",
      file_url: "",
      file_type: "",
      file_size: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lesson Resources
          </CardTitle>
          <CardDescription>Manage downloadable resources for lessons</CardDescription>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </CardHeader>
      <CardContent>
        {resourcesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : resources && resources.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource: any) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{resource.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {resource.lessons?.title || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="uppercase">
                      {resource.file_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(resource.file_size)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-muted-foreground" />
                      {resource.download_count || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(resource)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No resources found. Add your first resource to get started.
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </DialogTitle>
            <DialogDescription>
              {editingResource
                ? "Update the resource details"
                : "Upload a file and add it to a lesson"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(value) => {
                  setSelectedCourse(value);
                  setSelectedLesson("");
                }}
                disabled={!!editingResource}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lesson Selection */}
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select
                value={selectedLesson}
                onValueChange={setSelectedLesson}
                disabled={!selectedCourse || !!editingResource}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons?.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            {!editingResource && (
              <div className="space-y-2">
                <Label>File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.mp3,.mp4"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {form.file_url && (
                  <p className="text-sm text-muted-foreground">
                    ✓ File uploaded: {form.file_type.toUpperCase()} ({formatFileSize(form.file_size)})
                  </p>
                )}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Resource title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the resource"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createResource.isPending || updateResource.isPending}
            >
              {createResource.isPending || updateResource.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingResource ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ResourceManagement;