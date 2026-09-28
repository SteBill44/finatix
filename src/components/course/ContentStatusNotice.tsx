import { Badge } from "@/components/ui/badge";
import { useCourseContentStatus, isCourseContentReady } from "@/hooks/useCourseContentStatus";

export function ContentStatusBadge({ courseId }: { courseId: string }) {
  const { data } = useCourseContentStatus();
  const s = data?.get(courseId);
  if (!s || isCourseContentReady(s)) return null;
  return <Badge variant="outline" className="text-xs border-primary/50 text-primary">Content in development</Badge>;
}

/** Honest summary of what currently exists in a course, shown before purchase. */
export function ContentStatusNotice({ courseId }: { courseId: string }) {
  const { data } = useCourseContentStatus();
  const s = data?.get(courseId);
  if (!s || isCourseContentReady(s)) return null;
  return (
    <div role="note" className="rounded-lg border border-primary/40 bg-card p-4 text-sm text-foreground mb-6">
      <p className="font-semibold mb-1">This course is still being written</p>
      <p className="text-muted-foreground">
        Available today: {s.lessons} lesson outlines, {s.lessons_with_content} written lessons, {s.videos} videos,{" "}
        {s.questions} practice questions and {s.resources} downloads. Practice, mocks and readiness scores
        need questions to work, so they may be empty until more material is added.
      </p>
    </div>
  );
}
