import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Save, Loader2 } from "lucide-react";
import { useLessonNotes } from "@/hooks/useLessonNotes";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface LessonNotesProps {
  lessonId: string;
  lessonTitle: string;
}

const LessonNotes = ({ lessonId, lessonTitle }: LessonNotesProps) => {
  const { user } = useAuth();
  const { notes, isLoading, saveNotes, saveNotesImmediate, isSaving } = useLessonNotes(lessonId);
  const [content, setContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const lastSavedContentRef = useRef<string>("");

  // Initialize content when notes load
  useEffect(() => {
    if (notes?.content !== undefined && !hasUnsavedChanges) {
      setContent(notes.content);
      lastSavedContentRef.current = notes.content;
    }
  }, [notes?.content, hasUnsavedChanges]);

  // Handle content change with debounced save
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    if (!user || newContent === lastSavedContentRef.current) {
      setHasUnsavedChanges(false);
      return;
    }
    
    setHasUnsavedChanges(true);
    saveNotes(newContent);
  };

  // Update saved content ref when save completes
  useEffect(() => {
    if (!isSaving && hasUnsavedChanges) {
      // After saving completes, update the reference
      lastSavedContentRef.current = content;
      setHasUnsavedChanges(false);
    }
  }, [isSaving]);

  // Save on page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges && user) {
        saveNotesImmediate(content);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (hasUnsavedChanges && user) {
        saveNotesImmediate(content);
      }
    };
  }, [hasUnsavedChanges, content, saveNotesImmediate, user]);

  if (!user) {
    return (
      <Card className="p-6 bg-secondary/30">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">My Notes</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in to take notes on this lesson.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">My Notes</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">My Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {!isSaving && hasUnsavedChanges && (
            <Badge variant="outline" className="text-muted-foreground">
              Unsaved
            </Badge>
          )}
          {!isSaving && !hasUnsavedChanges && notes && (
            <Badge variant="secondary" className="text-muted-foreground">
              Saved
            </Badge>
          )}
        </div>
      </div>

      <Textarea
        placeholder={`Take notes on "${lessonTitle}"...\n\nYour notes are automatically saved as you type.`}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className={cn(
          "min-h-[200px] resize-none bg-secondary/30 border-border",
          "focus:ring-primary focus:border-primary"
        )}
      />

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {content.length} characters
        </p>
        {hasUnsavedChanges && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => saveNotesImmediate(content)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            Save Now
          </Button>
        )}
      </div>
    </Card>
  );
};

export default LessonNotes;
