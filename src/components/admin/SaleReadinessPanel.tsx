import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCourseContentStatus, type CourseContentStatus } from "@/hooks/useCourseContentStatus";

/** What still blocks a paid course from going on sale, in plain words. */
export function saleGaps(s: CourseContentStatus): string[] {
  const gaps: string[] = [];
  const taught = s.substantive_lessons + s.videos;
  if (s.lesson_records === 0) gaps.push("No lessons");
  else if (taught < s.lesson_records) gaps.push(`${s.lesson_records - taught} lessons need written notes or a video`);
  if (s.questions < 100) gaps.push(`${100 - s.questions} more practice questions (min 100)`);
  if (s.usable_mocks < 1) gaps.push("No mock exam with 20+ questions");
  if (s.placeholder_downloads > 0) gaps.push(`${s.placeholder_downloads} placeholder downloads to replace`);
  if (!s.editorially_approved) gaps.push("Awaiting editorial approval");
  return gaps;
}

const SaleReadinessPanel = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: status, isLoading, isError, refetch } = useCourseContentStatus();
  const { data: courses } = useQuery({
    queryKey: ["admin-course-titles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, slug, price").order("slug");
      if (error) throw error;
      return data;
    },
  });

  const setApproval = async (courseId: string, approved: boolean) => {
    const { error } = await supabase.from("course_editorial_approvals").upsert({
      course_id: courseId,
      approved,
      approved_by: approved ? user?.id ?? null : null,
      approved_at: approved ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      toast.error("Couldn't save the approval. Please try again.");
      return;
    }
    toast.success(approved ? "Marked as editorially approved" : "Approval removed");
    qc.invalidateQueries({ queryKey: ["course-content-status"] });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Sale readiness</CardTitle>
        <CardDescription>
          A paid course goes on sale only when it has editorial approval AND every lesson has written notes (1,500+
          characters) or a video, 100+ practice questions and at least one mock exam with 20+ questions. The text-length
          check is a size check, not a quality check - approve only after an academic review. Free courses stay open
          to enrol either way.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading counts...</p>}
        {isError && (
          <div className="flex items-center gap-3">
            <p className="text-sm text-destructive">Couldn't load content counts.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        )}
        {status && courses && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Outlines</TableHead>
                <TableHead className="text-right">Written</TableHead>
                <TableHead className="text-right">Videos</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Downloads</TableHead>
                <TableHead className="text-right">Mocks ready</TableHead>
                <TableHead>What's missing</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => {
                const s = status.get(c.id);
                if (!s) return null;
                const gaps = saleGaps(s);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-right">{s.lesson_records}</TableCell>
                    <TableCell className="text-right">{s.substantive_lessons}</TableCell>
                    <TableCell className="text-right">{s.videos}</TableCell>
                    <TableCell className="text-right">{s.questions}</TableCell>
                    <TableCell className="text-right">
                      {s.downloads}
                      {s.placeholder_downloads > 0 && (
                        <span className="text-muted-foreground"> (+{s.placeholder_downloads} placeholder)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{s.usable_mocks}/{s.mock_exams}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                      {gaps.length ? gaps.join("; ") : "Nothing"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        aria-label={`Editorial approval for ${c.title}`}
                        checked={s.editorially_approved}
                        onCheckedChange={(v) => setApproval(c.id, v)}
                      />
                    </TableCell>
                    <TableCell>
                      {s.is_free ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : s.on_sale ? (
                        <Badge>On sale</Badge>
                      ) : (
                        <Badge variant="outline">Not on sale</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SaleReadinessPanel;
