import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { NotificationPreferences } from "./types";

interface NotificationsSectionProps {
  userId: string;
  notifications: NotificationPreferences;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationPreferences>>;
}

const FIELDS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "enrollment_confirmation",
    title: "Enrollment Confirmation",
    description: "Receive confirmation when you enroll in a new course",
  },
  {
    key: "course_completion",
    title: "Course Completion",
    description: "Get notified when you complete a course",
  },
  {
    key: "progress_reminders",
    title: "Progress Reminders",
    description: "Receive reminders to continue your learning journey",
  },
  {
    key: "weekly_digest",
    title: "Weekly Digest",
    description: "Get a weekly summary of your learning progress",
  },
  {
    key: "new_content",
    title: "New Content",
    description: "Be notified when new lessons or courses are added",
  },
  {
    key: "discussion_replies",
    title: "Discussion Replies",
    description: "Get notified when someone replies to your discussions",
  },
];

export function NotificationsSection({
  userId,
  notifications,
  setNotifications,
}: NotificationsSectionProps) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const previous = notifications;
    const next = { ...notifications, [key]: value };
    setNotifications(next);

    setSaving(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: userId, ...next }, { onConflict: "user_id" });
    setSaving(false);

    if (error) {
      setNotifications(previous);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Email Notifications
          {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>Choose which emails you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {FIELDS.map((field, idx) => (
          <div key={field.key}>
            {idx > 0 && <Separator className="mb-6" />}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={field.key}>{field.title}</Label>
                <p className="text-sm text-muted-foreground">{field.description}</p>
              </div>
              <Switch
                id={field.key}
                checked={notifications[field.key]}
                onCheckedChange={(checked) => handleChange(field.key, checked)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
