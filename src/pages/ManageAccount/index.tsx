import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Loader2, Save, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAccountData } from "./useAccountData";
import { AvatarSection } from "./AvatarSection";
import { ProfileSection } from "./ProfileSection";
import { NotificationsSection } from "./NotificationsSection";
import { DangerZone } from "./DangerZone";

const ManageAccount = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, setProfile, notifications, setNotifications, loading } = useAccountData();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          full_name: profile.full_name,
          first_name: profile.first_name,
          last_name: profile.last_name,
          cima_id: profile.cima_id,
        },
        { onConflict: "user_id" }
      );
    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Your profile has been updated." });
    }
  };

  if (authLoading || loading || !user) {
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

          <AvatarSection user={user} profile={profile} setProfile={setProfile} />
          <ProfileSection email={user.email} profile={profile} setProfile={setProfile} />

          {/* Account Security */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
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

          <NotificationsSection
            userId={user.id}
            notifications={notifications}
            setNotifications={setNotifications}
          />

          {/* Subscription */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
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

          <DangerZone signOut={signOut} />
        </div>
      </div>
    </Layout>
  );
};

export default ManageAccount;
