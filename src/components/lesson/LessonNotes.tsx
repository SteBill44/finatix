import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { 
  StickyNote, 
  Save, 
  Loader2, 
  Bold, 
  Italic, 
  List,
  Heading2
} from "lucide-react";
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
  const lastSavedContentRef = useRef("");
  const previousLessonIdRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize content when notes load or lessonId changes
  useEffect(() => {
    // Reset when lessonId changes
    if (previousLessonIdRef.current !== lessonId) {
      previousLessonIdRef.current = lessonId;
      setContent("");
      setHasUnsavedChanges(false);
      lastSavedContentRef.current = "";
    }
    
    // Set content from loaded notes
    if (notes?.content !== undefined && !hasUnsavedChanges) {
      setContent(notes.content);
      lastSavedContentRef.current = notes.content;
    }
  }, [notes?.content, lessonId, hasUnsavedChanges]);

  // Handle content change with debounced save
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    const isDifferentFromSaved = newContent !== lastSavedContentRef.current;
    setHasUnsavedChanges(isDifferentFromSaved);
    
    if (user && isDifferentFromSaved) {
      saveNotes(newContent);
    }
  };

  // Handle manual save
  const handleSaveNow = () => {
    if (user && hasUnsavedChanges) {
      saveNotesImmediate(content);
      lastSavedContentRef.current = content;
      setHasUnsavedChanges(false);
    }
  };

  // Formatting helper - wraps selected text or inserts at cursor
  const applyFormat = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent: string;
    let newCursorPos: number;

    if (selectedText) {
      // Wrap selected text
      newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
      newCursorPos = end + prefix.length + suffix.length;
    } else {
      // Insert at cursor
      newContent = content.substring(0, start) + prefix + suffix + content.substring(end);
      newCursorPos = start + prefix.length;
    }

    handleContentChange(newContent);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, handleContentChange]);

  // Format handlers
  const handleBold = () => applyFormat("**");
  const handleItalic = () => applyFormat("*");
  const handleHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const prefix = "## ";
    
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    handleContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };
  
  const handleBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const prefix = "• ";
    
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    handleContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  // Use refs to access latest values in cleanup without causing effect reruns
  const contentRef = useRef(content);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const userRef = useRef(user);
  const saveNotesImmediateRef = useRef(saveNotesImmediate);

  useEffect(() => {
    contentRef.current = content;
    hasUnsavedChangesRef.current = hasUnsavedChanges;
    userRef.current = user;
    saveNotesImmediateRef.current = saveNotesImmediate;
  });

  // Save on browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChangesRef.current && userRef.current) {
        saveNotesImmediateRef.current(contentRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Save on component unmount (navigating away)
  useEffect(() => {
    return () => {
      if (hasUnsavedChangesRef.current && userRef.current) {
        saveNotesImmediateRef.current(contentRef.current);
      }
    };
  }, []);

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

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 mb-2 p-1 bg-secondary/50 rounded-md">
        <Toggle
          size="sm"
          aria-label="Bold"
          onClick={handleBold}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Italic"
          onClick={handleItalic}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Toggle
          size="sm"
          aria-label="Heading"
          onClick={handleHeading}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Bullet point"
          onClick={handleBulletPoint}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Toggle>
      </div>

      <Textarea
        ref={textareaRef}
        placeholder={`Take notes on "${lessonTitle}"...\n\nUse **bold**, *italic*, • bullets, and ## headings.`}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className={cn(
          "min-h-[200px] resize-none bg-secondary/30 border-border font-mono text-sm",
          "focus:ring-primary focus:border-primary"
        )}
      />

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {content.length} characters • Markdown supported
        </p>
        {hasUnsavedChanges && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={handleSaveNow}
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
