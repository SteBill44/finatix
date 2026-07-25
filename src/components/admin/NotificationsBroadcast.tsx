import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Bell, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

type Audience = "all" | "enrolled" | "completed" | "not_enrolled" | "role";
type Role = "admin" | "master_admin" | "user";

export default function NotificationsBroadcast() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [audience, setAudience] = useState<Audience>("all");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [role, setRole] = useState<Role>("user");

  const { data: courses = [] } = useQuery({
    queryKey: ["admin_courses_for_broadcast"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) return [];
      return data as { id: string; title: string }[];
    },
  });

  const { data: recent = [], isLoading } = useQuery({
    queryKey: ["admin_recent_notifications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("id, title, message, type, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return [] as RecentNotification[];
      const seen = new Set<string>();
      const unique: RecentNotification[] = [];
      for (const n of (data || []) as RecentNotification[]) {
        const key = `${n.title}|${n.message}|${n.created_at.slice(0, 16)}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(n);
        }
      }
      return unique;
    },
  });

  const needsCourses = audience === "enrolled" || audience === "completed" || audience === "not_enrolled";

  const audienceLabel = useMemo(() => {
    switch (audience) {
      case "all": return "Everyone";
      case "enrolled": return "Enrolled in selected course(s)";
      case "completed": return "Completed selected course(s)";
      case "not_enrolled": return "NOT enrolled in selected course(s)";
      case "role": return `Users with role: ${role}`;
    }
  }, [audience, role]);

  const broadcast = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc("broadcast_notification_targeted", {
        p_title: title.trim(),
        p_message: message.trim(),
        p_type: type,
        p_data: null,
        p_audience: audience,
        p_course_ids: needsCourses && selectedCourseIds.length > 0 ? selectedCourseIds : null,
        p_role: audience === "role" ? role : null,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      toast.success(`Notification sent to ${count} user${count === 1 ? "" : "s"}`);
      setTitle("");
      setMessage("");
      setType("info");
      queryClient.invalidateQueries({ queryKey: ["admin_recent_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications_inbox"] });
      queryClient.invalidateQueries({ queryKey: ["notifications_unread_count"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to send notification"),
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (needsCourses && selectedCourseIds.length === 0) {
      toast.error("Select at least one course");
      return;
    }
    broadcast.mutate();
  };

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </CardTitle>
          <CardDescription>
            Delivers an inbox notification (bell icon) to the audience you choose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="e.g. New course available"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              placeholder="Full notification text..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="enrolled">Enrolled in course(s)</SelectItem>
                  <SelectItem value="completed">Completed course(s)</SelectItem>
                  <SelectItem value="not_enrolled">Not enrolled in course(s)</SelectItem>
                  <SelectItem value="role">Users with a specific role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {audience === "role" && (
            <div className="space-y-1.5 max-w-xs">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="master_admin">Master admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {needsCourses && (
            <div className="space-y-2">
              <Label>Courses</Label>
              <div className="border border-border rounded-md p-3 max-h-64 overflow-auto space-y-2">
                {courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses available.</p>
                ) : (
                  courses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedCourseIds.includes(c.id)}
                        onCheckedChange={() => toggleCourse(c.id)}
                      />
                      <span>{c.title}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedCourseIds.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedCourseIds.length} selected</p>
              )}
            </div>
          )}

          <div className="rounded-md bg-muted/40 border border-border p-3 text-sm">
            <span className="text-muted-foreground">Will be sent to:</span>{" "}
            <span className="font-medium">{audienceLabel}</span>
          </div>

          <div className="pt-2">
            <Button onClick={handleSend} disabled={broadcast.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {broadcast.isPending ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>Latest notifications sent across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No notifications sent yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((n) => (
                <div key={n.id} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
