import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Video, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonVideoUploadProps {
  lessonId: string;
  lessonTitle: string;
  currentVideoUrl?: string | null;
  onVideoUploaded: (videoUrl: string) => void;
  onVideoRemoved: () => void;
}

const LessonVideoUpload = ({
  lessonId,
  lessonTitle,
  currentVideoUrl,
  onVideoUploaded,
  onVideoRemoved,
}: LessonVideoUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4, WebM, OGG, or MOV video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is 500MB. Your file is ${formatFileSize(file.size)}.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${lessonId}/${Date.now()}.${fileExt}`;

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("lesson-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("lesson-videos")
        .getPublicUrl(data.path);

      setUploadProgress(100);

      // Update lesson with video URL
      const { error: updateError } = await supabase
        .from("lessons")
        .update({ video_url: urlData.publicUrl })
        .eq("id", lessonId);

      if (updateError) throw updateError;

      toast({
        title: "Video uploaded successfully",
        description: `Video has been added to "${lessonTitle}"`,
      });

      onVideoUploaded(urlData.publicUrl);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveVideo = async () => {
    if (!currentVideoUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentVideoUrl.split("/lesson-videos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("lesson-videos").remove([filePath]);
      }

      // Update lesson to remove video URL
      const { error } = await supabase
        .from("lessons")
        .update({ video_url: null })
        .eq("id", lessonId);

      if (error) throw error;

      toast({
        title: "Video removed",
        description: "The video has been removed from this lesson.",
      });

      onVideoRemoved();
    } catch (error: any) {
      toast({
        title: "Failed to remove video",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  if (currentVideoUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          <span>Video uploaded</span>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <video
            src={currentVideoUrl}
            controls
            className="w-full max-h-48 rounded"
            preload="metadata"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveVideo}
          className="text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Remove Video
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleInputChange}
        className="hidden"
      />

      {uploading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading video...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-muted">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop video here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM, OGG, MOV • Max 500MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonVideoUpload;
