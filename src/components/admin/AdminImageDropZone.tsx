import React, { useState, useCallback, useRef } from "react";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAdminView } from "@/contexts/AdminViewContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface AdminImageDropZoneProps {
  children: React.ReactNode;
  onImageUpdated: (newUrl: string) => void;
  className?: string;
  storageFolder?: string;
}

const AdminImageDropZone = ({
  children,
  onImageUpdated,
  className = "",
  storageFolder = "site-images",
}: AdminImageDropZoneProps) => {
  const { isAdmin } = useIsAdmin();
  const { isStudentView } = useAdminView();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounter = useRef(0);

  const isEffectiveAdmin = isAdmin && !isStudentView;

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${storageFolder}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("resources")
          .getPublicUrl(fileName);

        onImageUpdated(urlData.publicUrl);
        toast.success("Image updated successfully");
      } catch (err: any) {
        console.error("Upload failed:", err);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUpdated, storageFolder]
  );

  if (!isEffectiveAdmin) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative group ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Subtle admin hint on hover */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200 rounded-xl pointer-events-none flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border shadow-sm">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Upload className="w-3 h-3" />
            Drop to replace
          </span>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-xl flex items-center justify-center z-20">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary shadow-lg">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Release to upload
            </span>
          </div>
        </div>
      )}

      {/* Uploading overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
          <div className="bg-background/90 rounded-lg px-4 py-2 border border-border shadow-lg">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImageDropZone;
