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
import { Bell, Plus, Pencil, Trash2, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-blue-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  urgent: <Zap className="w-4 h-4 text-primary" />,
};

const typeBadge: Record<string, string> = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  urgent: "bg-primary/10 text-primary",
};

const EMPTY_FORM = {
  title: "",
  message: "",
  type: "info",
  target_audience: "all",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

export default function AnnouncementsManagement() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin_announcements"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [] as Announcement[];
      return (data || []) as Announcement[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Omit<Announcement, "id" | "created_at"> & { id?: string }) => {
      const row = {
        title: payload.title,
        message: payload.message,
        type: payload.type,
        target_audience: payload.target_audience,
        is_active: payload.is_active,
        starts_at: payload.starts_at || null,
        ends_at: payload.ends_at || null,
      };
      if (payload.id) {
        const { error } = await (supabase as any).from("announcements").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("announcements").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements_active"] });
      toast.success(editing ? "Announcement updated" : "Announcement created");
      handleClose();
    },
    onError: () => toast.error("Failed to save announcement"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any).from("announcements").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements_active"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements_active"] });
      toast.success("Announcement deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleOpen = (a?: Announcement) => {
    if (a) {
      setEditing(a);
      setForm({
        title: a.title,
        message: a.message,
        type: a.type,
        target_audience: a.target_audience,
        is_active: a.is_active,
        starts_at: a.starts_at?.slice(0, 16) || "",
        ends_at: a.ends_at?.slice(0, 16) || "",
      });
    } else {
      setEditing(null);
      setForm({ ...EMPTY_FORM });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    upsertMutation.mutate({ ...form, id: editing?.id });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
            <CardDescription>
              Create and manage site-wide announcements shown to users as dismissible banners.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpen()}>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. Scheduled maintenance tonight"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Full announcement text..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Audience</Label>
                    <Select value={form.target_audience} onValueChange={(v) => setForm({ ...form, target_audience: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        <SelectItem value="enrolled">Enrolled only</SelectItem>
                        <SelectItem value="admins">Admins only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Start (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                    id="is_active"
                  />
                  <Label htmlFor="is_active">Active (visible to users)</Label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={upsertMutation.isPending}>
                    {editing ? "Save Changes" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No announcements yet. Create one to show a banner to users.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5">{typeIcons[a.type] || typeIcons.info}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-medium text-sm">{a.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[a.type] || typeBadge.info}`}>
                          {a.type}
                        </span>
                        <Badge variant="outline" className="text-xs">{a.target_audience}</Badge>
                        {!a.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Created {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={a.is_active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: a.id, is_active: v })}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(a)}>
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
                          <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "{a.title}" and hide it from all users.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(a.id)}
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
    </div>
  );
}
