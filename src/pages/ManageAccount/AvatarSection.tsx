import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { ProfileData } from "./types";

interface AvatarSectionProps {
  user: AuthUser;
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export function AvatarSection({ user, profile, setProfile }: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, avatar_url: avatarUrl }, { onConflict: "user_id" });
      if (updateError) throw updateError;

      setProfile((p) => ({ ...p, avatar_url: avatarUrl }));
      toast({ title: "Success", description: "Profile picture updated successfully." });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile.avatar_url) return;
    setUploading(true);
    try {
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([
          `${user.id}/avatar.jpg`,
          `${user.id}/avatar.png`,
          `${user.id}/avatar.jpeg`,
          `${user.id}/avatar.webp`,
        ]);
      if (deleteError) console.warn("Could not delete avatar file:", deleteError);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      setProfile((p) => ({ ...p, avatar_url: null }));
      toast({ title: "Success", description: "Profile picture removed." });
    } catch (error) {
      console.error("Remove avatar error:", error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>Upload a profile picture to personalize your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage src={profile.avatar_url || undefined} alt="Profile picture" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.first_name?.[0]?.toUpperCase() ||
                  profile.full_name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            {profile.avatar_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
