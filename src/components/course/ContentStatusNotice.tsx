import { Badge } from "@/components/ui/badge";
import { useCourseContentStatus, isInDevelopment } from "@/hooks/useCourseContentStatus";

export function ContentStatusBadge({ courseId }: { courseId: string }) {
  const { data } = useCourseContentStatus();
  const s = data?.get(courseId);
  if (!s || !isInDevelopment(s)) return null;
  return (
    <Badge variant="outline" className="text-xs border-primary/50 text-primary">
      {s.is_free ? "Free - practice available" : "Not yet open for purchase"}
    </Badge>
  );
}

/** Plain summary of what exists in a course today, shown before anyone pays. */
export function ContentStatusNotice({ courseId }: { courseId: string }) {
  const { data } = useCourseContentStatus();
  const s = data?.get(courseId);
  if (!s || !isInDevelopment(s)) return null;
  return (
    <div role="note" className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 p-4 text-sm text-primary-foreground mb-6">
      <p className="font-semibold mb-1">
        {s.is_free ? "What's in this free course today" : "This course is still being written"}
      </p>
      <p className="text-primary-foreground/85">
        {s.lesson_records} lesson outlines, {s.substantive_lessons} full written lessons, {s.videos} videos,{" "}
        {s.questions} practice questions, {s.downloads} downloads and {s.usable_mocks} ready mock exams.
        {!s.is_free && " It isn't on sale until its material has been written and academically reviewed."}
      </p>
    </div>
  );
}
