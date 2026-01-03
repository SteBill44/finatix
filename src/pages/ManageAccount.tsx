import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, CreditCard, Shield, Save, Loader2, Trash2, AlertTriangle, Bell } from "lucide-react";

interface NotificationPreferences {
  progress_reminders: boolean;
  enrollment_confirmation: boolean;
  weekly_digest: boolean;
  discussion_replies: boolean;
  new_content: boolean;
  course_completion: boolean;
}

interface ProfileData {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  cima_id: string | null;
  siebel_id: string | null;
}

const ManageAccount = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    first_name: "",
    last_name: "",
    cima_id: "",
    siebel_id: "",
  });
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    progress_reminders: true,
    enrollment_confirmation: true,
    weekly_digest: true,
    discussion_replies: true,
    new_content: true,
    course_completion: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, first_name, last_name, cima_id, siebel_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          cima_id: profileData.cima_id || "",
          siebel_id: profileData.siebel_id || "",
        });
      }

      // Fetch notification preferences
      const { data: notifData } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

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

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        full_name: profile.full_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        cima_id: profile.cima_id,
        siebel_id: profile.siebel_id,
      }, { onConflict: 'user_id' });

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);

    setSavingNotifications(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        ...newNotifications,
      }, { onConflict: 'user_id' });

    setSavingNotifications(false);

    if (error) {
      // Revert on error
      setNotifications(notifications);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE") return;

    setDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) {
        throw error;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      await signOut();
      navigate("/");
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmText("");
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Account</h1>
            <p className="text-muted-foreground mt-2">
              Update your profile information and account settings
            </p>
          </div>

          {/* Profile Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal details and display name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name || ""}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name || ""}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Address
              </CardTitle>
              <CardDescription>
                Your account email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CIMA Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                CIMA Details
              </CardTitle>
              <CardDescription>
                Your CIMA registration information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cimaId">CIMA ID</Label>
                <Input
                  id="cimaId"
                  value={profile.cima_id || ""}
                  onChange={(e) => setProfile({ ...profile, cima_id: e.target.value })}
                  placeholder="Enter your CIMA ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siebelId">Siebel ID (Optional)</Label>
                <Input
                  id="siebelId"
                  value={profile.siebel_id || ""}
                  onChange={(e) => setProfile({ ...profile, siebel_id: e.target.value })}
                  placeholder="Enter your Siebel ID"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                To change your password, please use the password reset feature on the login page.
              </p>
              <Button variant="outline" onClick={() => navigate("/auth?mode=reset")}>
                Reset Password
              </Button>
            </CardContent>
          </Card>

          {/* Email Notification Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
                {savingNotifications && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>
                Choose which emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enrollment_confirmation">Enrollment Confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive confirmation when you enroll in a new course
                  </p>
                </div>
                <Switch
                  id="enrollment_confirmation"
                  checked={notifications.enrollment_confirmation}
                  onCheckedChange={(checked) => handleNotificationChange('enrollment_confirmation', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="course_completion">Course Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you complete a course
                  </p>
                </div>
                <Switch
                  id="course_completion"
                  checked={notifications.course_completion}
                  onCheckedChange={(checked) => handleNotificationChange('course_completion', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="progress_reminders">Progress Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders to continue your learning journey
                  </p>
                </div>
                <Switch
                  id="progress_reminders"
                  checked={notifications.progress_reminders}
                  onCheckedChange={(checked) => handleNotificationChange('progress_reminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly_digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a weekly summary of your learning progress
                  </p>
                </div>
                <Switch
                  id="weekly_digest"
                  checked={notifications.weekly_digest}
                  onCheckedChange={(checked) => handleNotificationChange('weekly_digest', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new_content">New Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Be notified when new lessons or courses are added
                  </p>
                </div>
                <Switch
                  id="new_content"
                  checked={notifications.new_content}
                  onCheckedChange={(checked) => handleNotificationChange('new_content', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="discussion_replies">Discussion Replies</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone replies to your discussions
                  </p>
                </div>
                <Switch
                  id="discussion_replies"
                  checked={notifications.discussion_replies}
                  onCheckedChange={(checked) => handleNotificationChange('discussion_replies', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  You currently have no active subscriptions.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/pricing")}>
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Save Button */}
          <div className="flex justify-end mb-8">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Delete Account Permanently
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                          <p>
                            This will permanently delete your account and all your data, including:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Your profile information</li>
                            <li>All course enrollments and progress</li>
                            <li>Quiz attempts and scores</li>
                            <li>Certificates earned</li>
                            <li>Discussion posts and comments</li>
                            <li>Badges and achievements</li>
                          </ul>
                          <p className="font-medium text-destructive">
                            This action cannot be undone.
                          </p>
                          <div className="pt-2">
                            <Label htmlFor="deleteConfirm" className="text-foreground">
                              Type <span className="font-mono font-bold">DELETE</span> to confirm:
                            </Label>
                            <Input
                              id="deleteConfirm"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                              placeholder="DELETE"
                              className="mt-2"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== "DELETE" || deleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Forever
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ManageAccount;
