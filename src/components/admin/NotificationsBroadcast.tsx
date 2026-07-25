import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bell } from "lucide-react";
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

export default function NotificationsBroadcast() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  const { data: recent = [], isLoading } = useQuery({
    queryKey: ["admin_recent_notifications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("id, title, message, type, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return [] as RecentNotification[];
      // Deduplicate by title+message+minute so broadcasts collapse to one row
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

  const broadcast = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc("broadcast_notification", {
        p_title: title.trim(),
        p_message: message.trim(),
        p_type: type,
        p_data: null,
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
    broadcast.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification to All Users
          </CardTitle>
          <CardDescription>
            Delivers an inbox notification (bell icon) to every registered user immediately.
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
          <div className="space-y-1.5 max-w-xs">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2">
            <Button onClick={handleSend} disabled={broadcast.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {broadcast.isPending ? "Sending..." : "Send to All Users"}
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
