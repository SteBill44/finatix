export interface NotificationPreferences {
  progress_reminders: boolean;
  enrollment_confirmation: boolean;
  weekly_digest: boolean;
  discussion_replies: boolean;
  new_content: boolean;
  course_completion: boolean;
}

export interface ProfileData {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  cima_id: string | null;
  avatar_url: string | null;
}

export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  progress_reminders: true,
  enrollment_confirmation: true,
  weekly_digest: true,
  discussion_replies: true,
  new_content: true,
  course_completion: true,
};

export const DEFAULT_PROFILE: ProfileData = {
  full_name: "",
  first_name: "",
  last_name: "",
  cima_id: "",
  avatar_url: null,
};
