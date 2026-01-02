import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCreateResource, useUpdateResource, useDeleteResource } from "@/hooks/useResources";
import { Plus, Trash2, Pencil, FileText, File, Download, Loader2, GripVertical, Upload, X, CheckCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  course_id: string;
}

interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  download_count: number;
  order_index: number;
  lessons?: { id: string; title: string; course_id: string } | null;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: { file_url: string; file_type: string; file_size: number };
}

// Sortable row component
const SortableRow = ({ resource, onEdit, onDelete, formatFileSize }: {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  formatFileSize: (bytes: number | null) => string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-secondary rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
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
          <Button variant="ghost" size="icon" onClick={() => onEdit(resource)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(resource.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const ResourceManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [filterLesson, setFilterLesson] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    file_url: "",
    file_type: "",
    file_size: 0,
  });

  // Bulk upload state
  const [bulkFiles, setBulkFiles] = useState<UploadingFile[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Fetch resources for a specific lesson (for reordering)
  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["admin-resources", filterLesson],
    queryFn: async () => {
      let query = supabase
        .from("lesson_resources")
        .select(`*, lessons (id, title, course_id)`)
        .order("order_index");

      if (filterLesson) {
        query = query.eq("lesson_id", filterLesson);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Resource[];
    },
  });

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("lesson_resources")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["lesson_resources"] });
    },
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    queryKey: ["admin-lessons", selectedCourse || filterCourse],
    queryFn: async () => {
      const courseId = selectedCourse || filterCourse;
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, course_id")
        .eq("course_id", courseId)
        .order("order_index");
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!(selectedCourse || filterCourse),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !resources) return;

    const oldIndex = resources.findIndex((r) => r.id === active.id);
    const newIndex = resources.findIndex((r) => r.id === over.id);

    const newOrder = arrayMove(resources, oldIndex, newIndex);
    const updates = newOrder.map((r, index) => ({ id: r.id, order_index: index }));

    // Optimistic update
    queryClient.setQueryData(["admin-resources", filterLesson], newOrder);
    reorderMutation.mutate(updates);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("resources")
        .getPublicUrl(fileName);

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

  // Bulk file selection
  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadingFile[] = files.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));
    setBulkFiles((prev) => [...prev, ...newFiles]);
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Bulk upload process
  const handleBulkUpload = async () => {
    if (!selectedLesson || bulkFiles.length === 0) {
      toast({ title: "Validation Error", description: "Select a lesson and add files.", variant: "destructive" });
      return;
    }

    setBulkUploading(true);

    // Get current max order index
    const { data: existingResources } = await supabase
      .from("lesson_resources")
      .select("order_index")
      .eq("lesson_id", selectedLesson)
      .order("order_index", { ascending: false })
      .limit(1);

    let orderIndex = (existingResources?.[0]?.order_index || 0) + 1;

    for (let i = 0; i < bulkFiles.length; i++) {
      const uploadFile = bulkFiles[i];
      if (uploadFile.status === "done") continue;

      // Update status to uploading
      setBulkFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading", progress: 10 } : f))
      );

      try {
        const file = uploadFile.file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        setBulkFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 50 } : f))
        );

        const { data: { publicUrl } } = supabase.storage
          .from("resources")
          .getPublicUrl(fileName);

        // Create resource record
        const { error: insertError } = await supabase.from("lesson_resources").insert({
          lesson_id: selectedLesson,
          title: file.name.replace(`.${fileExt}`, ""),
          file_url: publicUrl,
          file_type: fileExt || "unknown",
          file_size: file.size,
          order_index: orderIndex++,
        });

        if (insertError) throw insertError;

        setBulkFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "done", progress: 100 } : f))
        );
      } catch (error: any) {
        setBulkFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: error.message } : f
          )
        );
      }
    }

    setBulkUploading(false);
    queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
    queryClient.invalidateQueries({ queryKey: ["lesson_resources"] });
    toast({ title: "Bulk upload completed" });
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
        // Get max order index
        const { data: existingResources } = await supabase
          .from("lesson_resources")
          .select("order_index")
          .eq("lesson_id", selectedLesson)
          .order("order_index", { ascending: false })
          .limit(1);

        const orderIndex = (existingResources?.[0]?.order_index || 0) + 1;

        await createResource.mutateAsync({
          lesson_id: selectedLesson,
          title: form.title,
          description: form.description || undefined,
          file_url: form.file_url,
          file_type: form.file_type,
          file_size: form.file_size || undefined,
          order_index: orderIndex,
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

  const handleEdit = (resource: Resource) => {
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
    setForm({ title: "", description: "", file_url: "", file_type: "", file_size: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetBulkForm = () => {
    setBulkFiles([]);
    setSelectedCourse("");
    setSelectedLesson("");
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lesson Resources
          </CardTitle>
          <CardDescription>Manage downloadable resources for lessons. Drag to reorder.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetBulkForm();
              setBulkDialogOpen(true);
            }}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
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
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="w-48">
          <Select value={filterCourse || "all"} onValueChange={(v) => { setFilterCourse(v === "all" ? "" : v); setFilterLesson(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filterCourse && (
            <div className="w-48">
              <Select value={filterLesson || "all"} onValueChange={(v) => setFilterLesson(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lessons</SelectItem>
                  {lessons?.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {resourcesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : resources && resources.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={resources.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  {resources.map((resource) => (
                    <SortableRow
                      key={resource.id}
                      resource={resource}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      formatFileSize={formatFileSize}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
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
            <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            <DialogDescription>
              {editingResource ? "Update the resource details" : "Upload a file and add it to a lesson"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedLesson(""); }} disabled={!!editingResource}>
                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={!selectedCourse || !!editingResource}>
                <SelectTrigger><SelectValue placeholder="Select a lesson" /></SelectTrigger>
                <SelectContent>
                  {lessons?.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!editingResource && (
              <div className="space-y-2">
                <Label>File</Label>
                <div className="flex items-center gap-2">
                  <Input ref={fileInputRef} type="file" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.mp3,.mp4" />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {form.file_url && (
                  <p className="text-sm text-muted-foreground">✓ File uploaded: {form.file_type.toUpperCase()} ({formatFileSize(form.file_size)})</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Resource title" />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Brief description" rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createResource.isPending || updateResource.isPending}>
              {(createResource.isPending || updateResource.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingResource ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Upload Resources</DialogTitle>
            <DialogDescription>Upload multiple files to a lesson at once</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedLesson(""); }}>
                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={!selectedCourse}>
                <SelectTrigger><SelectValue placeholder="Select a lesson" /></SelectTrigger>
                <SelectContent>
                  {lessons?.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Files</Label>
              <Input ref={bulkFileInputRef} type="file" multiple onChange={handleBulkFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.mp3,.mp4" />
            </div>

            {bulkFiles.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bulkFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      {file.status === "uploading" && <Progress value={file.progress} className="h-1 mt-1" />}
                      {file.status === "error" && <p className="text-xs text-destructive">{file.error}</p>}
                    </div>
                    {file.status === "done" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : file.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeBulkFile(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkDialogOpen(false); resetBulkForm(); }}>Cancel</Button>
            <Button onClick={handleBulkUpload} disabled={bulkUploading || bulkFiles.length === 0 || !selectedLesson}>
              {bulkUploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Upload {bulkFiles.filter((f) => f.status !== "done").length} Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ResourceManagement;