import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export type QuestionType = 'multiple_choice' | 'multiple_response' | 'number_entry' | 'hotspot' | 'drag_drop';

export interface Question {
  id: string;
  question: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer?: number;
  correct_answers?: number[];
  number_answer?: number;
  number_tolerance?: number;
  image_url?: string;
  hotspot_regions?: HotspotRegion[];
  drag_items?: DragItem[];
  drag_targets?: DragTarget[];
  explanation?: string;
}

export interface HotspotRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isCorrect: boolean;
}

export interface DragItem {
  id: string;
  text: string;
  correctPosition?: number;
  matchTarget?: string;
}

export interface DragTarget {
  id: string;
  text: string;
}

// Answer types for different question types
export type Answer = 
  | number // multiple_choice
  | number[] // multiple_response
  | string // number_entry (stored as string for input)
  | string // hotspot (clicked region id)
  | string[] // drag_drop (ordered item ids)
  | Record<string, string>; // drag_drop matching (itemId -> targetId)

interface QuestionRendererProps {
  question: Question;
  answer: Answer | null;
  onAnswerChange: (answer: Answer) => void;
  showResult?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
}

export const QuestionRenderer = ({
  question,
  answer,
  onAnswerChange,
  showResult = false,
  isCorrect,
  disabled = false,
}: QuestionRendererProps) => {
  switch (question.question_type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          answer={answer as number | null}
          onAnswerChange={onAnswerChange}
          showResult={showResult}
          disabled={disabled}
        />
      );
    case 'multiple_response':
      return (
        <MultipleResponseQuestion
          question={question}
          answer={answer as number[] | null}
          onAnswerChange={onAnswerChange}
          showResult={showResult}
          disabled={disabled}
        />
      );
    case 'number_entry':
      return (
        <NumberEntryQuestion
          question={question}
          answer={answer as string | null}
          onAnswerChange={onAnswerChange}
          showResult={showResult}
          isCorrect={isCorrect}
          disabled={disabled}
        />
      );
    case 'hotspot':
      return (
        <HotspotQuestion
          question={question}
          answer={answer as string | null}
          onAnswerChange={onAnswerChange}
          showResult={showResult}
          disabled={disabled}
        />
      );
    case 'drag_drop':
      return (
        <DragDropQuestion
          question={question}
          answer={answer as string[] | Record<string, string> | null}
          onAnswerChange={onAnswerChange}
          showResult={showResult}
          disabled={disabled}
        />
      );
    default:
      return (
        <MultipleChoiceQuestion
          question={question}
          answer={answer as number | null}
          onAnswerChange={onAnswerChange}
          showResult={showResult}
          disabled={disabled}
        />
      );
  }
};

// Multiple Choice Question Component
const MultipleChoiceQuestion = ({
  question,
  answer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  question: Question;
  answer: number | null;
  onAnswerChange: (answer: number) => void;
  showResult: boolean;
  disabled: boolean;
}) => {
  const options = question.options || [];

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = answer === index;
        const isCorrect = question.correct_answer === index;
        
        let optionClass = "p-4 rounded-xl border-2 cursor-pointer transition-all ";
        
        if (showResult) {
          if (isCorrect) {
            optionClass += "border-green-500 bg-green-500/10 ";
          } else if (isSelected && !isCorrect) {
            optionClass += "border-red-500 bg-red-500/10 ";
          } else {
            optionClass += "border-border bg-card ";
          }
        } else {
          optionClass += isSelected
            ? "border-primary bg-primary/5 "
            : "border-border bg-card hover:border-primary/50 ";
        }

        if (disabled) {
          optionClass += "cursor-not-allowed opacity-70 ";
        }

        return (
          <div
            key={index}
            className={optionClass}
            onClick={() => !disabled && onAnswerChange(index)}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-foreground flex-1">{option}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Multiple Response Question Component
const MultipleResponseQuestion = ({
  question,
  answer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  question: Question;
  answer: number[] | null;
  onAnswerChange: (answer: number[]) => void;
  showResult: boolean;
  disabled: boolean;
}) => {
  const options = question.options || [];
  const selectedAnswers = answer || [];
  const correctAnswers = question.correct_answers || [];

  const toggleOption = (index: number) => {
    if (disabled) return;
    
    if (selectedAnswers.includes(index)) {
      onAnswerChange(selectedAnswers.filter((i) => i !== index));
    } else {
      onAnswerChange([...selectedAnswers, index]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">
        Select all that apply
      </p>
      {options.map((option, index) => {
        const isSelected = selectedAnswers.includes(index);
        const isCorrect = correctAnswers.includes(index);
        
        let optionClass = "p-4 rounded-xl border-2 cursor-pointer transition-all ";
        
        if (showResult) {
          if (isCorrect) {
            optionClass += "border-green-500 bg-green-500/10 ";
          } else if (isSelected && !isCorrect) {
            optionClass += "border-red-500 bg-red-500/10 ";
          } else {
            optionClass += "border-border bg-card ";
          }
        } else {
          optionClass += isSelected
            ? "border-primary bg-primary/5 "
            : "border-border bg-card hover:border-primary/50 ";
        }

        if (disabled) {
          optionClass += "cursor-not-allowed opacity-70 ";
        }

        return (
          <div
            key={index}
            className={optionClass}
            onClick={() => toggleOption(index)}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                disabled={disabled}
                className="h-5 w-5"
              />
              <span className="text-foreground flex-1">{option}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Number Entry Question Component
const NumberEntryQuestion = ({
  question,
  answer,
  onAnswerChange,
  showResult,
  isCorrect,
  disabled,
}: {
  question: Question;
  answer: string | null;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  isCorrect?: boolean;
  disabled: boolean;
}) => {
  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Label htmlFor="number-answer" className="text-sm text-muted-foreground mb-2 block">
          Enter your answer
        </Label>
        <Input
          id="number-answer"
          type="text"
          inputMode="decimal"
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "text-lg h-12",
            showResult && isCorrect && "border-green-500 bg-green-500/10",
            showResult && !isCorrect && "border-red-500 bg-red-500/10"
          )}
          placeholder="Type your answer..."
        />
      </div>
      {showResult && (
        <div className="text-sm">
          <span className="text-muted-foreground">Correct answer: </span>
          <span className="font-medium text-green-600">
            {question.number_answer}
            {question.number_tolerance && question.number_tolerance > 0 && (
              <span className="text-muted-foreground"> (±{question.number_tolerance})</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

// Hotspot Question Component
const HotspotQuestion = ({
  question,
  answer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  question: Question;
  answer: string | null;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  disabled: boolean;
}) => {
  const regions = question.hotspot_regions || [];
  
  const handleRegionClick = (regionId: string) => {
    if (disabled) return;
    onAnswerChange(regionId);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click on the correct area of the image
      </p>
      <div className="relative inline-block">
        {question.image_url ? (
          <img
            src={question.image_url}
            alt="Question image"
            className="max-w-full rounded-lg border border-border"
          />
        ) : (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
        {/* Render clickable regions */}
        {regions.map((region) => {
          const isSelected = answer === region.id;
          const isCorrectRegion = region.isCorrect;
          
          let regionClass = "absolute border-2 cursor-pointer transition-all ";
          
          if (showResult) {
            if (isCorrectRegion) {
              regionClass += "border-green-500 bg-green-500/30 ";
            } else if (isSelected && !isCorrectRegion) {
              regionClass += "border-red-500 bg-red-500/30 ";
            } else {
              regionClass += "border-transparent ";
            }
          } else {
            regionClass += isSelected
              ? "border-primary bg-primary/20 "
              : "border-transparent hover:bg-white/10 ";
          }

          return (
            <div
              key={region.id}
              className={regionClass}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
              onClick={() => handleRegionClick(region.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Sortable Item Component for Drag and Drop
const SortableItem = ({
  id,
  text,
  disabled,
  showResult,
  isCorrectPosition,
}: {
  id: string;
  text: string;
  disabled: boolean;
  showResult: boolean;
  isCorrectPosition?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let itemClass = "p-4 rounded-xl border-2 bg-card flex items-center gap-3 ";
  
  if (isDragging) {
    itemClass += "opacity-50 ";
  }
  
  if (showResult) {
    if (isCorrectPosition) {
      itemClass += "border-green-500 bg-green-500/10 ";
    } else {
      itemClass += "border-red-500 bg-red-500/10 ";
    }
  } else {
    itemClass += "border-border hover:border-primary/50 ";
  }

  if (disabled) {
    itemClass += "cursor-not-allowed ";
  } else {
    itemClass += "cursor-grab ";
  }

  return (
    <div ref={setNodeRef} style={style} className={itemClass} {...attributes} {...listeners}>
      <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <span className="text-foreground">{text}</span>
    </div>
  );
};

// Drag and Drop Question Component
const DragDropQuestion = ({
  question,
  answer,
  onAnswerChange,
  showResult,
  disabled,
}: {
  question: Question;
  answer: string[] | Record<string, string> | null;
  onAnswerChange: (answer: string[] | Record<string, string>) => void;
  showResult: boolean;
  disabled: boolean;
}) => {
  const dragItems = question.drag_items || [];
  const hasTargets = question.drag_targets && question.drag_targets.length > 0;
  
  // For ordering type (no targets)
  const [items, setItems] = useState<DragItem[]>(() => {
    if (Array.isArray(answer) && answer.length > 0) {
      // Restore order from answer
      return answer.map(id => dragItems.find(item => item.id === id)!).filter(Boolean);
    }
    return [...dragItems];
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!answer && dragItems.length > 0) {
      setItems([...dragItems]);
    }
  }, [dragItems]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onAnswerChange(newItems.map((item) => item.id));
        return newItems;
      });
    }
  };

  if (hasTargets) {
    // Matching type - not implemented in this version
    return (
      <div className="text-muted-foreground">
        Drag and drop matching will be available soon.
      </div>
    );
  }

  // Ordering type
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag items to arrange them in the correct order
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                text={item.text}
                disabled={disabled}
                showResult={showResult}
                isCorrectPosition={showResult && item.correctPosition === index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

// Helper function to check if an answer is correct
export const isAnswerCorrect = (question: Question, answer: Answer | null): boolean => {
  if (answer === null || answer === undefined) return false;

  switch (question.question_type) {
    case 'multiple_choice':
      return answer === question.correct_answer;

    case 'multiple_response': {
      const correctAnswers = question.correct_answers || [];
      const selectedAnswers = answer as number[];
      if (selectedAnswers.length !== correctAnswers.length) return false;
      return correctAnswers.every((a) => selectedAnswers.includes(a)) &&
             selectedAnswers.every((a) => correctAnswers.includes(a));
    }

    case 'number_entry': {
      const numAnswer = parseFloat(answer as string);
      if (isNaN(numAnswer)) return false;
      const correctNum = question.number_answer || 0;
      const tolerance = question.number_tolerance || 0;
      return Math.abs(numAnswer - correctNum) <= tolerance;
    }

    case 'hotspot': {
      const regions = question.hotspot_regions || [];
      const selectedRegion = regions.find((r) => r.id === answer);
      return selectedRegion?.isCorrect || false;
    }

    case 'drag_drop': {
      const dragItems = question.drag_items || [];
      const orderedIds = answer as string[];
      if (!Array.isArray(orderedIds)) return false;
      return dragItems.every((item, index) => {
        const answerIndex = orderedIds.indexOf(item.id);
        return item.correctPosition === answerIndex;
      });
    }

    default:
      return answer === question.correct_answer;
  }
};

export default QuestionRenderer;
