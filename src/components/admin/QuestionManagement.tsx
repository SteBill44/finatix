import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, Link } from "lucide-react";
import { QuestionType, HotspotRegion, DragItem, DragTarget } from "@/hooks/useQuizzes";
import QuestionDialog, { QuestionFormState } from "./questions/QuestionDialog";

interface Quiz {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  order_index: number;
  courses?: { title: string };
}

interface Lesson {
  id: string;
  title: string;
  course_id: string;
  order_index: number;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: number;
  correct_answers?: number[];
  number_answer?: number;
  number_tolerance?: number;
  image_url?: string;
  hotspot_regions?: HotspotRegion[];
  drag_items?: DragItem[];
  drag_targets?: DragTarget[];
  explanation: string | null;
  order_index: number;
}

const EMPTY_FORM: QuestionFormState = {
  question: "",
  question_type: "multiple_choice",
  options: ["", "", "", ""],
  correct_answer: 0,
  correct_answers: [],
  number_answer: 0,
  number_tolerance: 0,
  image_url: "",
  hotspot_regions: [],
  drag_items: [],
  explanation: "",
  order_index: 0,
};

const TYPE_BADGE_COLORS: Record<QuestionType, string> = {
  multiple_choice: "bg-blue-500/10 text-blue-500",
  multiple_response: "bg-purple-500/10 text-purple-500",
  number_entry: "bg-green-500/10 text-green-500",
  hotspot: "bg-orange-500/10 text-orange-500",
  drag_drop: "bg-pink-500/10 text-pink-500",
};

const QuestionManagement = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Record<string, QuizQuestion[]>>({});
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionFormState>(EMPTY_FORM);

  useEffect(() => {
    fetchQuizzes();
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, course_id, order_index")
      .order("order_index", { ascending: true });

    if (error) {
      toast({ title: "Error fetching lessons", description: error.message, variant: "destructive" });
    } else {
      setLessons(data || []);
    }
  };

  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select(`*, courses(title)`)
      .order("order_index", { ascending: true });

    if (error) {
      toast({ title: "Error fetching quizzes", description: error.message, variant: "destructive" });
    } else {
      setQuizzes(data || []);
    }
    setLoadingQuizzes(false);
  };

  const fetchQuestions = async (quizId: string) => {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (error) {
      toast({ title: "Error fetching questions", description: error.message, variant: "destructive" });
      return;
    }

    const transformed: QuizQuestion[] = (data || []).map((q: any) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question: q.question,
      question_type: (q.question_type || "multiple_choice") as QuestionType,
      options: q.options as string[],
      correct_answer: q.correct_answer,
      correct_answers: q.correct_answers,
      number_answer: q.number_answer,
      number_tolerance: q.number_tolerance,
      image_url: q.image_url,
      hotspot_regions: q.hotspot_regions as HotspotRegion[],
      drag_items: q.drag_items as DragItem[],
      drag_targets: q.drag_targets as DragTarget[],
      explanation: q.explanation,
      order_index: q.order_index,
    }));
    setQuestions((prev) => ({ ...prev, [quizId]: transformed }));
  };

  const handleLinkLesson = async (quizId: string, lessonId: string | null) => {
    const { error } = await supabase.from("quizzes").update({ lesson_id: lessonId }).eq("id", quizId);
    if (error) {
      toast({ title: "Error linking lesson", description: error.message, variant: "destructive" });
    } else {
      toast({ title: lessonId ? "Quiz linked to lesson" : "Quiz unlinked from lesson" });
      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, lesson_id: lessonId } : q)));
    }
  };

  const toggleQuizExpanded = (quizId: string) => {
    const next = new Set(expandedQuizzes);
    if (next.has(quizId)) {
      next.delete(quizId);
    } else {
      next.add(quizId);
      if (!questions[quizId]) fetchQuestions(quizId);
    }
    setExpandedQuizzes(next);
  };

  const openAddDialog = (quizId: string) => {
    const existing = questions[quizId] || [];
    const maxOrder = existing.length > 0 ? Math.max(...existing.map((q) => q.order_index)) : -1;
    setSelectedQuizId(quizId);
    setEditingQuestion(null);
    setForm({ ...EMPTY_FORM, order_index: maxOrder + 1 });
    setDialogOpen(true);
  };

  const openEditDialog = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setSelectedQuizId(question.quiz_id);
    setForm({
      question: question.question,
      question_type: question.question_type,
      options: question.options || ["", "", "", ""],
      correct_answer: question.correct_answer,
      correct_answers: question.correct_answers || [],
      number_answer: question.number_answer || 0,
      number_tolerance: question.number_tolerance || 0,
      image_url: question.image_url || "",
      hotspot_regions: question.hotspot_regions || [],
      drag_items: question.drag_items || [],
      explanation: question.explanation || "",
      order_index: question.order_index,
    });
    setDialogOpen(true);
  };

  const handleDeleteQuestion = async (question: QuizQuestion) => {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", question.id);
    if (error) {
      toast({ title: "Error deleting question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question deleted successfully" });
      fetchQuestions(question.quiz_id);
    }
  };

  const handleSave = async () => {
    if (!form.question || !selectedQuizId) {
      toast({ title: "Validation Error", description: "Question text is required.", variant: "destructive" });
      return;
    }

    const payload: any = {
      quiz_id: selectedQuizId,
      question: form.question,
      question_type: form.question_type,
      options: form.options.filter((o) => o.trim() !== ""),
      correct_answer: form.correct_answer,
      explanation: form.explanation || null,
      order_index: form.order_index,
    };

    if (form.question_type === "multiple_response") payload.correct_answers = form.correct_answers;
    if (form.question_type === "number_entry") {
      payload.number_answer = form.number_answer;
      payload.number_tolerance = form.number_tolerance;
    }
    if (form.question_type === "hotspot") {
      payload.image_url = form.image_url;
      payload.hotspot_regions = form.hotspot_regions;
    }
    if (form.question_type === "drag_drop") payload.drag_items = form.drag_items;

    if (editingQuestion) {
      const { error } = await supabase.from("quiz_questions").update(payload).eq("id", editingQuestion.id);
      if (error) {
        toast({ title: "Error updating question", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Question updated successfully" });
    } else {
      const { error } = await supabase.from("quiz_questions").insert(payload);
      if (error) {
        toast({ title: "Error creating question", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Question created successfully" });
    }

    fetchQuestions(selectedQuizId);
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Questions</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingQuizzes ? (
          <div className="text-center py-8 text-muted-foreground">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No quizzes found. Create a quiz first.</div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Collapsible
                key={quiz.id}
                open={expandedQuizzes.has(quiz.id)}
                onOpenChange={() => toggleQuizExpanded(quiz.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedQuizzes.has(quiz.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quiz.courses?.title || "Unknown Course"}
                          {quiz.lesson_id && (
                            <span className="ml-2 text-primary">• Linked to lesson</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{questions[quiz.id]?.length || 0} questions</Badge>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t p-4">
                      <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Link className="h-4 w-4 text-primary" />
                          <Label className="text-sm font-medium">Link to Lesson</Label>
                        </div>
                        <Select
                          value={quiz.lesson_id || "none"}
                          onValueChange={(v) => handleLinkLesson(quiz.id, v === "none" ? null : v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a lesson..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No lesson (course-level quiz)</SelectItem>
                            {lessons
                              .filter((l) => l.course_id === quiz.course_id)
                              .map((lesson) => (
                                <SelectItem key={lesson.id} value={lesson.id}>
                                  {lesson.order_index + 1}. {lesson.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Link this quiz to a specific lesson to track lesson-level performance.
                        </p>
                      </div>

                      <div className="flex justify-end mb-4">
                        <Button size="sm" onClick={() => openAddDialog(quiz.id)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Question
                        </Button>
                      </div>

                      {!questions[quiz.id] || questions[quiz.id].length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">
                          No questions yet. Add your first question.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>Question</TableHead>
                              <TableHead className="w-32">Type</TableHead>
                              <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questions[quiz.id].map((question, index) => (
                              <TableRow key={question.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="max-w-md truncate">{question.question}</TableCell>
                                <TableCell>
                                  <Badge className={TYPE_BADGE_COLORS[question.question_type] || "bg-muted text-muted-foreground"}>
                                    {question.question_type.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEditDialog(question)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteQuestion(question)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}

        <QuestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          isEditing={!!editingQuestion}
          form={form}
          onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
          onSave={handleSave}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionManagement;
