import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Video,
  ClipboardList,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResult {
  id: string;
  type: "course" | "lesson" | "quiz";
  title: string;
  description?: string | null;
  parentTitle?: string;
  courseId?: string;
  courseSlug?: string;
}

interface GlobalSearchProps {
  trigger?: React.ReactNode;
}

const GlobalSearch = ({ trigger }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search query
  const { data: results, isLoading } = useQuery({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const searchTerm = `%${query}%`;
      const results: SearchResult[] = [];

      // Search courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, slug, title, description, level")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      if (courses) {
        results.push(
          ...courses.map((c) => ({
            id: c.id,
            type: "course" as const,
            title: c.title,
            description: c.description,
            courseSlug: c.slug,
          }))
        );
      }

      // Search lessons
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, description, course_id, courses(title, slug)")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      if (lessons) {
        results.push(
          ...lessons.map((l) => ({
            id: l.id,
            type: "lesson" as const,
            title: l.title,
            description: l.description,
            parentTitle: (l.courses as unknown as { title: string })?.title,
            courseId: l.course_id,
            courseSlug: (l.courses as unknown as { slug: string })?.slug,
          }))
        );
      }

      // Search quizzes
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, title, description, course_id, courses(title, slug)")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      if (quizzes) {
        results.push(
          ...quizzes.map((q) => ({
            id: q.id,
            type: "quiz" as const,
            title: q.title,
            description: q.description,
            parentTitle: (q.courses as unknown as { title: string })?.title,
            courseId: q.course_id,
            courseSlug: (q.courses as unknown as { slug: string })?.slug,
          }))
        );
      }

      return results;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");

    switch (result.type) {
      case "course":
        navigate(`/courses/${result.courseSlug || result.id}`);
        break;
      case "lesson":
        navigate(`/courses/${result.courseId}/lesson/${result.id}`);
        break;
      case "quiz":
        navigate(`/quiz/${result.id}`);
        break;
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "course":
        return <BookOpen className="w-4 h-4" />;
      case "lesson":
        return <Video className="w-4 h-4" />;
      case "quiz":
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "course":
        return "Course";
      case "lesson":
        return "Lesson";
      case "quiz":
        return "Quiz";
    }
  };

  const courseResults = results?.filter((r) => r.type === "course") || [];
  const lessonResults = results?.filter((r) => r.type === "lesson") || [];
  const quizResults = results?.filter((r) => r.type === "quiz") || [];

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground w-full sm:w-auto justify-start sm:justify-center"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search courses, lessons, quizzes..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && query.length >= 2 && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && query.length >= 2 && results?.length === 0 && (
            <CommandEmpty>
              No results found for "{query}"
            </CommandEmpty>
          )}

          {query.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Type at least 2 characters to search</p>
            </div>
          )}

          {courseResults.length > 0 && (
            <CommandGroup heading="Courses">
              {courseResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`course-${result.id}`}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {getTypeLabel(result.type)}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {lessonResults.length > 0 && (
            <>
              {courseResults.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Lessons">
                {lessonResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`lesson-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.parentTitle}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {quizResults.length > 0 && (
            <>
              {(courseResults.length > 0 || lessonResults.length > 0) && (
                <CommandSeparator />
              )}
              <CommandGroup heading="Quizzes">
                {quizResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`quiz-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.parentTitle}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
