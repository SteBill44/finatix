import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  type NotificationPreferences,
  type ProfileData,
  DEFAULT_PROFILE,
  DEFAULT_NOTIFICATIONS,
} from "./types";

interface UseAccountDataResult {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  notifications: NotificationPreferences;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationPreferences>>;
  loading: boolean;
}

/** Fetches the current user's profile + notification preferences once on mount. */
export function useAccountData(): UseAccountDataResult {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [{ data: profileData }, { data: notifData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, first_name, last_name, cima_id, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          cima_id: profileData.cima_id || "",
          avatar_url: profileData.avatar_url || null,
        });
      }

      if (notifData) {
        setNotifications({
          progress_reminders: notifData.progress_reminders ?? true,
          enrollment_confirmation: notifData.enrollment_confirmation ?? true,
          weekly_digest: notifData.weekly_digest ?? true,
          discussion_replies: notifData.discussion_replies ?? true,
          new_content: notifData.new_content ?? true,
          course_completion: notifData.course_completion ?? true,
        });
      }

      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return { profile, setProfile, notifications, setNotifications, loading };
}
