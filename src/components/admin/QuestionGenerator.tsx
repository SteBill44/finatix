import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Course {
  id: string;
  title: string;
  level: string;
}

interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

const QuestionGenerator = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: "" });
  const [results, setResults] = useState<Array<{ type: string; count: number; success: boolean }>>([]);

  const loadCourses = async () => {
    if (courses.length > 0) return;
    const { data } = await supabase.from("courses").select("id, title, level").order("title");
    setCourses(data || []);
  };

  const loadLessons = async (courseId: string) => {
    const { data } = await supabase.from("lessons").select("id, title, order_index")
      .eq("course_id", courseId).order("order_index");
    setLessons(data || []);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setResults([]);
    loadLessons(courseId);
  };

  const generateQuestions = async (
    courseId: string, quizType: string, lessonId?: string, batchIndex?: number
  ) => {
    const { data, error } = await supabase.functions.invoke("generate-course-questions", {
      body: { course_id: courseId, quiz_type: quizType, lesson_id: lessonId, batch_index: batchIndex }
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleGenerate = async () => {
    if (!selectedCourseId || !selectedType) return;
    setGenerating(true);
    setResults([]);

    try {
      if (selectedType === "lesson_quiz") {
        setProgress({ current: 0, total: lessons.length, message: "Generating lesson quizzes..." });
        for (let i = 0; i < lessons.length; i++) {
          setProgress({ current: i + 1, total: lessons.length, message: `Quiz for: ${lessons[i].title}` });
          try {
            const result = await generateQuestions(selectedCourseId, "lesson_quiz", lessons[i].id);
            setResults(prev => [...prev, { type: `Quiz: ${lessons[i].title}`, count: result.questionsGenerated, success: true }]);
          } catch (err: any) {
            setResults(prev => [...prev, { type: `Quiz: ${lessons[i].title}`, count: 0, success: false }]);
            if (err.message?.includes("Rate limited")) {
              toast({ title: "Rate limited", description: "Waiting 60s before continuing...", variant: "destructive" });
              await new Promise(r => setTimeout(r, 60000));
              i--; // Retry
            }
          }
        }
      } else if (selectedType === "mock_exam") {
        setProgress({ current: 0, total: 5, message: "Generating mock exams..." });
        for (let i = 0; i < 5; i++) {
          setProgress({ current: i + 1, total: 5, message: `Mock Exam ${i + 1}` });
          try {
            const result = await generateQuestions(selectedCourseId, "mock_exam");
            setResults(prev => [...prev, { type: `Mock Exam ${i + 1}`, count: result.questionsGenerated, success: true }]);
          } catch (err: any) {
            setResults(prev => [...prev, { type: `Mock Exam ${i + 1}`, count: 0, success: false }]);
            if (err.message?.includes("Rate limited")) {
              await new Promise(r => setTimeout(r, 60000));
              i--;
            }
          }
        }
      } else if (selectedType === "final_exam") {
        setProgress({ current: 0, total: 1, message: "Generating final exam..." });
        const result = await generateQuestions(selectedCourseId, "final_exam");
        setProgress({ current: 1, total: 1, message: "Done!" });
        setResults([{ type: "Final Exam", count: result.questionsGenerated, success: true }]);
      } else if (selectedType === "practice") {
        setProgress({ current: 0, total: 5, message: "Generating practice bank..." });
        for (let i = 0; i < 5; i++) {
          setProgress({ current: i + 1, total: 5, message: `Practice batch ${i + 1}/5 (${(i + 1) * 100} questions)` });
          try {
            const result = await generateQuestions(selectedCourseId, "practice", undefined, i);
            setResults(prev => [...prev, { type: `Practice Batch ${i + 1}`, count: result.questionsGenerated, success: true }]);
          } catch (err: any) {
            setResults(prev => [...prev, { type: `Practice Batch ${i + 1}`, count: 0, success: false }]);
            if (err.message?.includes("Rate limited")) {
              await new Promise(r => setTimeout(r, 60000));
              i--;
            }
          }
        }
      }

      toast({ title: "Generation complete!", description: "Questions have been created." });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Question Generator
        </CardTitle>
        <CardDescription>Generate CIMA-standard questions using AI for any course</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select value={selectedCourseId} onValueChange={handleCourseChange} onOpenChange={() => loadCourses()}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent className="bg-popover max-h-60">
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedType} onValueChange={setSelectedType} disabled={!selectedCourseId}>
              <SelectTrigger><SelectValue placeholder="Question type" /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="lesson_quiz">Lesson Quizzes (10 per chapter)</SelectItem>
                <SelectItem value="mock_exam">Mock Exams (5 × 45 questions)</SelectItem>
                <SelectItem value="final_exam">Final Exam (60 questions)</SelectItem>
                <SelectItem value="practice">Practice Bank (500 questions)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={generating || !selectedCourseId || !selectedType}>
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate</>}
          </Button>
        </div>

        {selectedCourseId && selectedType === "lesson_quiz" && (
          <p className="text-sm text-muted-foreground">
            Will generate 10 questions for each of {lessons.length} chapters ({lessons.length * 10} total).
          </p>
        )}

        {generating && progress.total > 0 && (
          <div className="space-y-2">
            <Progress value={(progress.current / progress.total) * 100} />
            <p className="text-sm text-muted-foreground">{progress.message} ({progress.current}/{progress.total})</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {r.success ? <CheckCircle className="h-4 w-4 text-accent" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                <span>{r.type}</span>
                <Badge variant={r.success ? "secondary" : "destructive"} className="ml-auto">
                  {r.success ? `${r.count} questions` : "failed"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionGenerator;
