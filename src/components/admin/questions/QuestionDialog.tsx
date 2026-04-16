import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, Plus, X, Check } from "lucide-react";
import { QuestionType, HotspotRegion, DragItem } from "@/hooks/useQuizzes";

export interface QuestionFormState {
  question: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: number;
  correct_answers: number[];
  number_answer: number;
  number_tolerance: number;
  image_url: string;
  hotspot_regions: HotspotRegion[];
  drag_items: DragItem[];
  explanation: string;
  order_index: number;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "multiple_response", label: "Multiple Response" },
  { value: "number_entry", label: "Number Entry" },
  { value: "hotspot", label: "Hotspot" },
  { value: "drag_drop", label: "Drag & Drop" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  form: QuestionFormState;
  onChange: (updates: Partial<QuestionFormState>) => void;
  onSave: () => void;
}

const QuestionDialog = ({ open, onOpenChange, isEditing, form, onChange, onSave }: Props) => {
  const addOption = () => onChange({ options: [...form.options, ""] });

  const removeOption = (index: number) =>
    onChange({
      options: form.options.filter((_, i) => i !== index),
      correct_answer: form.correct_answer >= index ? Math.max(0, form.correct_answer - 1) : form.correct_answer,
    });

  const updateOption = (index: number, value: string) =>
    onChange({ options: form.options.map((o, i) => (i === index ? value : o)) });

  const toggleCorrectAnswer = (index: number) => {
    if (form.question_type === "multiple_response") {
      onChange({
        correct_answers: form.correct_answers.includes(index)
          ? form.correct_answers.filter((i) => i !== index)
          : [...form.correct_answers, index],
      });
    } else {
      onChange({ correct_answer: index });
    }
  };

  const addDragItem = () =>
    onChange({
      drag_items: [
        ...form.drag_items,
        { id: `item_${Date.now()}`, text: "", correctPosition: form.drag_items.length },
      ],
    });

  const updateDragItem = (index: number, text: string) =>
    onChange({ drag_items: form.drag_items.map((item, i) => (i === index ? { ...item, text } : item)) });

  const removeDragItem = (index: number) =>
    onChange({
      drag_items: form.drag_items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, correctPosition: i })),
    });

  const addHotspotRegion = () =>
    onChange({
      hotspot_regions: [
        ...form.hotspot_regions,
        { id: `region_${Date.now()}`, x: 10, y: 10, width: 20, height: 20, isCorrect: false },
      ],
    });

  const updateHotspotRegion = (index: number, updates: Partial<HotspotRegion>) =>
    onChange({
      hotspot_regions: form.hotspot_regions.map((r, i) => (i === index ? { ...r, ...updates } : r)),
    });

  const removeHotspotRegion = (index: number) =>
    onChange({ hotspot_regions: form.hotspot_regions.filter((_, i) => i !== index) });

  const isOptionCorrect = (index: number) =>
    form.question_type === "multiple_response"
      ? form.correct_answers.includes(index)
      : form.correct_answer === index;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Question" : "Add Question"}</DialogTitle>
          <DialogDescription>Create questions for your quiz with different formats.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={form.question_type}
              onValueChange={(value: QuestionType) => onChange({ question_type: value })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={form.question}
              onChange={(e) => onChange({ question: e.target.value })}
              placeholder="Enter your question..."
              rows={3}
            />
          </div>

          {(form.question_type === "multiple_choice" || form.question_type === "multiple_response") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" /> Add Option
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {form.question_type === "multiple_response"
                  ? "Click the checkbox to mark correct answers (multiple allowed)"
                  : "Click the radio to mark the correct answer"}
              </p>
              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrectAnswer(index)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isOptionCorrect(index)
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isOptionCorrect(index) && <Check className="h-4 w-4" />}
                  </button>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  {form.options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {form.question_type === "number_entry" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.number_answer}
                    onChange={(e) => onChange({ number_answer: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tolerance (±)</Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={form.number_tolerance}
                    onChange={(e) => onChange({ number_tolerance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Answers within ±{form.number_tolerance} of {form.number_answer} will be accepted.
              </p>
            </div>
          )}

          {form.question_type === "hotspot" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => onChange({ image_url: e.target.value })}
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
                {form.hotspot_regions.map((region, index) => (
                  <div key={region.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {(["x", "y", "width", "height"] as const).map((field) => (
                        <Input
                          key={field}
                          type="number"
                          placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} %`}
                          value={region[field]}
                          onChange={(e) =>
                            updateHotspotRegion(index, { [field]: parseFloat(e.target.value) || 0 })
                          }
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant={region.isCorrect ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateHotspotRegion(index, { isCorrect: !region.isCorrect })}
                    >
                      {region.isCorrect ? "Correct" : "Mark Correct"}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHotspotRegion(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.question_type === "drag_drop" && (
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
              {form.drag_items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input
                    value={item.text}
                    onChange={(e) => updateDragItem(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDragItem(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Explanation (shown after answer)</Label>
            <Textarea
              value={form.explanation}
              onChange={(e) => onChange({ explanation: e.target.value })}
              placeholder="Explain why the answer is correct..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              value={form.order_index}
              onChange={(e) => onChange({ order_index: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>{isEditing ? "Save Changes" : "Create Question"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
