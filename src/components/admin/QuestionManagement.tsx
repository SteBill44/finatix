import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, GripVertical, X, Check } from "lucide-react";
import { QuestionType, HotspotRegion, DragItem, DragTarget } from "@/hooks/useQuizzes";

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  courses?: { title: string };
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

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "multiple_response", label: "Multiple Response" },
  { value: "number_entry", label: "Number Entry" },
  { value: "hotspot", label: "Hotspot" },
  { value: "drag_drop", label: "Drag & Drop" },
];

const QuestionManagement = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Record<string, QuizQuestion[]>>({});
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Question form state
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  
  const [questionForm, setQuestionForm] = useState({
    question: "",
    question_type: "multiple_choice" as QuestionType,
    options: ["", "", "", ""],
    correct_answer: 0,
    correct_answers: [] as number[],
    number_answer: 0,
    number_tolerance: 0,
    image_url: "",
    hotspot_regions: [] as HotspotRegion[],
    drag_items: [] as DragItem[],
    explanation: "",
    order_index: 0,
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

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
    } else {
      // Transform the data to match our interface
      const transformedData: QuizQuestion[] = (data || []).map((q: any) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        question_type: (q.question_type || 'multiple_choice') as QuestionType,
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
      setQuestions((prev) => ({ ...prev, [quizId]: transformedData }));
    }
  };

  const toggleQuizExpanded = (quizId: string) => {
    const newExpanded = new Set(expandedQuizzes);
    if (newExpanded.has(quizId)) {
      newExpanded.delete(quizId);
    } else {
      newExpanded.add(quizId);
      if (!questions[quizId]) {
        fetchQuestions(quizId);
      }
    }
    setExpandedQuizzes(newExpanded);
  };

  const handleAddQuestion = (quizId: string) => {
    setSelectedQuizId(quizId);
    const quizQuestions = questions[quizId] || [];
    const maxOrder = quizQuestions.length > 0 ? Math.max(...quizQuestions.map((q) => q.order_index)) : -1;
    setQuestionForm({
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
      order_index: maxOrder + 1,
    });
    setEditingQuestion(null);
    setQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setSelectedQuizId(question.quiz_id);
    setQuestionForm({
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
    setQuestionDialogOpen(true);
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

  const handleSaveQuestion = async () => {
    if (!questionForm.question || !selectedQuizId) {
      toast({ title: "Validation Error", description: "Question text is required.", variant: "destructive" });
      return;
    }

    const questionData: any = {
      quiz_id: selectedQuizId,
      question: questionForm.question,
      question_type: questionForm.question_type,
      options: questionForm.options.filter((o) => o.trim() !== ""),
      correct_answer: questionForm.correct_answer,
      explanation: questionForm.explanation || null,
      order_index: questionForm.order_index,
    };

    // Add type-specific fields
    if (questionForm.question_type === "multiple_response") {
      questionData.correct_answers = questionForm.correct_answers;
    }
    if (questionForm.question_type === "number_entry") {
      questionData.number_answer = questionForm.number_answer;
      questionData.number_tolerance = questionForm.number_tolerance;
    }
    if (questionForm.question_type === "hotspot") {
      questionData.image_url = questionForm.image_url;
      questionData.hotspot_regions = questionForm.hotspot_regions;
    }
    if (questionForm.question_type === "drag_drop") {
      questionData.drag_items = questionForm.drag_items;
    }

    if (editingQuestion) {
      const { error } = await supabase
        .from("quiz_questions")
        .update(questionData)
        .eq("id", editingQuestion.id);

      if (error) {
        toast({ title: "Error updating question", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Question updated successfully" });
        fetchQuestions(selectedQuizId);
      }
    } else {
      const { error } = await supabase.from("quiz_questions").insert(questionData);

      if (error) {
        toast({ title: "Error creating question", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Question created successfully" });
        fetchQuestions(selectedQuizId);
      }
    }

    setQuestionDialogOpen(false);
  };

  const addOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correct_answer: prev.correct_answer >= index ? Math.max(0, prev.correct_answer - 1) : prev.correct_answer,
    }));
  };

  const updateOption = (index: number, value: string) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? value : o)),
    }));
  };

  const toggleCorrectAnswer = (index: number) => {
    if (questionForm.question_type === "multiple_response") {
      setQuestionForm((prev) => ({
        ...prev,
        correct_answers: prev.correct_answers.includes(index)
          ? prev.correct_answers.filter((i) => i !== index)
          : [...prev.correct_answers, index],
      }));
    } else {
      setQuestionForm((prev) => ({
        ...prev,
        correct_answer: index,
      }));
    }
  };

  const addDragItem = () => {
    const newId = `item_${Date.now()}`;
    setQuestionForm((prev) => ({
      ...prev,
      drag_items: [...prev.drag_items, { id: newId, text: "", correctPosition: prev.drag_items.length }],
    }));
  };

  const updateDragItem = (index: number, text: string) => {
    setQuestionForm((prev) => ({
      ...prev,
      drag_items: prev.drag_items.map((item, i) =>
        i === index ? { ...item, text } : item
      ),
    }));
  };

  const removeDragItem = (index: number) => {
    setQuestionForm((prev) => ({
      ...prev,
      drag_items: prev.drag_items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, correctPosition: i })),
    }));
  };

  const addHotspotRegion = () => {
    const newId = `region_${Date.now()}`;
    setQuestionForm((prev) => ({
      ...prev,
      hotspot_regions: [
        ...prev.hotspot_regions,
        { id: newId, x: 10, y: 10, width: 20, height: 20, isCorrect: false },
      ],
    }));
  };

  const updateHotspotRegion = (index: number, updates: Partial<HotspotRegion>) => {
    setQuestionForm((prev) => ({
      ...prev,
      hotspot_regions: prev.hotspot_regions.map((region, i) =>
        i === index ? { ...region, ...updates } : region
      ),
    }));
  };

  const removeHotspotRegion = (index: number) => {
    setQuestionForm((prev) => ({
      ...prev,
      hotspot_regions: prev.hotspot_regions.filter((_, i) => i !== index),
    }));
  };

  const getQuestionTypeBadgeColor = (type: QuestionType) => {
    switch (type) {
      case "multiple_choice": return "bg-blue-500/10 text-blue-500";
      case "multiple_response": return "bg-purple-500/10 text-purple-500";
      case "number_entry": return "bg-green-500/10 text-green-500";
      case "hotspot": return "bg-orange-500/10 text-orange-500";
      case "drag_drop": return "bg-pink-500/10 text-pink-500";
      default: return "bg-muted text-muted-foreground";
    }
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
          <div className="text-center py-8 text-muted-foreground">
            No quizzes found. Create a quiz first.
          </div>
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
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {questions[quiz.id]?.length || 0} questions
                    </Badge>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t p-4">
                      <div className="flex justify-end mb-4">
                        <Button size="sm" onClick={() => handleAddQuestion(quiz.id)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Question
                        </Button>
                      </div>

                      {questions[quiz.id]?.length === 0 ? (
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
                            {questions[quiz.id]?.map((question, index) => (
                              <TableRow key={question.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="max-w-md truncate">
                                  {question.question}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getQuestionTypeBadgeColor(question.question_type)}>
                                    {question.question_type.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditQuestion(question)}
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

        {/* Question Dialog */}
        <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Edit Question" : "Add Question"}
              </DialogTitle>
              <DialogDescription>
                Create questions for your quiz with different formats.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Question Type */}
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={questionForm.question_type}
                  onValueChange={(value: QuestionType) =>
                    setQuestionForm((prev) => ({ ...prev, question_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={questionForm.question}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, question: e.target.value }))
                  }
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>

              {/* Multiple Choice / Multiple Response Options */}
              {(questionForm.question_type === "multiple_choice" ||
                questionForm.question_type === "multiple_response") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {questionForm.question_type === "multiple_response"
                      ? "Click the checkbox to mark correct answers (multiple allowed)"
                      : "Click the radio to mark the correct answer"}
                  </p>
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCorrectAnswer(index)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          questionForm.question_type === "multiple_response"
                            ? questionForm.correct_answers.includes(index)
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-muted-foreground"
                            : questionForm.correct_answer === index
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-muted-foreground"
                        }`}
                      >
                        {((questionForm.question_type === "multiple_response" &&
                          questionForm.correct_answers.includes(index)) ||
                          (questionForm.question_type === "multiple_choice" &&
                            questionForm.correct_answer === index)) && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className="flex-1"
                      />
                      {questionForm.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Number Entry */}
              {questionForm.question_type === "number_entry" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        type="number"
                        step="any"
                        value={questionForm.number_answer}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            number_answer: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tolerance (±)</Label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={questionForm.number_tolerance}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            number_tolerance: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Answers within ±{questionForm.number_tolerance} of {questionForm.number_answer} will be accepted.
                  </p>
                </div>
              )}

              {/* Hotspot */}
              {questionForm.question_type === "hotspot" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={questionForm.image_url}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Hotspot Regions</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addHotspotRegion}>
                        <Plus className="h-4 w-4 mr-1" /> Add Region
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Define clickable regions (as percentages of image size)
                    </p>
                    {questionForm.hotspot_regions.map((region, index) => (
                      <div key={region.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="grid grid-cols-4 gap-2 flex-1">
                          <Input
                            type="number"
                            placeholder="X %"
                            value={region.x}
                            onChange={(e) =>
                              updateHotspotRegion(index, { x: parseFloat(e.target.value) || 0 })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Y %"
                            value={region.y}
                            onChange={(e) =>
                              updateHotspotRegion(index, { y: parseFloat(e.target.value) || 0 })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Width %"
                            value={region.width}
                            onChange={(e) =>
                              updateHotspotRegion(index, { width: parseFloat(e.target.value) || 0 })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Height %"
                            value={region.height}
                            onChange={(e) =>
                              updateHotspotRegion(index, { height: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant={region.isCorrect ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateHotspotRegion(index, { isCorrect: !region.isCorrect })}
                        >
                          {region.isCorrect ? "Correct" : "Mark Correct"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHotspotRegion(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drag and Drop */}
              {questionForm.question_type === "drag_drop" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Items to Order</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDragItem}>
                      <Plus className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter items in the CORRECT order. They will be shuffled for the student.
                  </p>
                  {questionForm.drag_items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <Input
                        value={item.text}
                        onChange={(e) => updateDragItem(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDragItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label>Explanation (shown after answer)</Label>
                <Textarea
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))
                  }
                  placeholder="Explain why the answer is correct..."
                  rows={2}
                />
              </div>

              {/* Order Index */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={questionForm.order_index}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      order_index: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuestion}>
                {editingQuestion ? "Save Changes" : "Create Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuestionManagement;
