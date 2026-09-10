// Single source of truth for quiz answer formats and grading.
//
// Canonical answer format per question type:
//   multiple_choice   -> number (option index)            e.g. 2
//   multiple_response -> number[] (option indexes)        e.g. [0, 3]
//   number_entry      -> number, or numeric string        e.g. 12.5 | "12.5"
//   hotspot           -> string (region id)               e.g. "region-2"
//   drag_drop         -> string[] (ordered item ids)      e.g. ["a","b","c"]
//                        or Record<itemId, targetId>      e.g. { a: "t1" }
//
// Anything else is invalid and graded as incorrect.

export interface HotspotRegion {
  id: string;
  isCorrect?: boolean;
}

export interface DragItem {
  id: string;
  correctPosition?: number | null;
  matchTarget?: string | null;
}

export interface GradableQuestion {
  question_type: string;
  correct_answer?: number | null;
  correct_answers?: number[] | null;
  number_answer?: number | null;
  number_tolerance?: number | null;
  hotspot_regions?: HotspotRegion[] | null;
  drag_items?: DragItem[] | null;
  drag_targets?: Array<{ id: string }> | null;
}

export type RawAnswer = unknown;

export interface NormalizedAnswer {
  valid: boolean;
  value?: number | number[] | string | string[] | Record<string, string>;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Validate + coerce a raw client answer into the canonical shape for its type. */
export function normalizeAnswer(questionType: string, answer: RawAnswer): NormalizedAnswer {
  if (answer === null || answer === undefined) return { valid: false };

  switch (questionType) {
    case "multiple_choice": {
      if (typeof answer === "number" && Number.isInteger(answer) && answer >= 0) {
        return { valid: true, value: answer };
      }
      if (typeof answer === "string" && /^\d+$/.test(answer.trim())) {
        return { valid: true, value: Number(answer.trim()) };
      }
      return { valid: false };
    }

    case "multiple_response":
    case "multiple_select": {
      if (!Array.isArray(answer) || answer.length === 0) return { valid: false };
      const out: number[] = [];
      for (const raw of answer) {
        if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0) out.push(raw);
        else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) out.push(Number(raw.trim()));
        else return { valid: false };
      }
      return { valid: true, value: Array.from(new Set(out)) };
    }

    case "number_entry":
    case "number_input": {
      if (typeof answer === "number" && Number.isFinite(answer)) {
        return { valid: true, value: answer };
      }
      if (typeof answer === "string") {
        const cleaned = answer.trim().replace(/,/g, "");
        if (cleaned === "") return { valid: false };
        const parsed = Number(cleaned);
        if (Number.isFinite(parsed)) return { valid: true, value: parsed };
      }
      return { valid: false };
    }

    case "hotspot": {
      if (typeof answer === "string" && answer.trim() !== "") {
        return { valid: true, value: answer.trim() };
      }
      return { valid: false };
    }

    case "drag_drop": {
      if (Array.isArray(answer)) {
        if (answer.length === 0) return { valid: false };
        if (!answer.every((v) => typeof v === "string" && v.trim() !== "")) return { valid: false };
        return { valid: true, value: (answer as string[]).map((v) => v.trim()) };
      }
      if (isPlainObject(answer)) {
        const entries = Object.entries(answer);
        if (entries.length === 0) return { valid: false };
        const map: Record<string, string> = {};
        for (const [k, v] of entries) {
          if (typeof v !== "string" || v.trim() === "") return { valid: false };
          map[k] = v.trim();
        }
        return { valid: true, value: map };
      }
      return { valid: false };
    }

    default: {
      // Unknown types fall back to multiple-choice semantics.
      return normalizeAnswer("multiple_choice", answer);
    }
  }
}

/** Grade a raw client answer against the stored question data. */
export function isAnswerCorrect(question: GradableQuestion, answer: RawAnswer): boolean {
  const type = question.question_type || "multiple_choice";
  const normalized = normalizeAnswer(type, answer);
  if (!normalized.valid) return false;
  const value = normalized.value;

  switch (type) {
    case "multiple_response":
    case "multiple_select": {
      const correct = Array.isArray(question.correct_answers) ? question.correct_answers : null;
      if (!correct || correct.length === 0) return false;
      const selected = value as number[];
      const correctSet = Array.from(new Set(correct));
      return (
        selected.length === correctSet.length &&
        correctSet.every((c) => selected.includes(c))
      );
    }

    case "number_entry":
    case "number_input": {
      if (question.number_answer === null || question.number_answer === undefined) return false;
      const tolerance = Math.abs(question.number_tolerance ?? 0);
      return Math.abs((value as number) - question.number_answer) <= tolerance + 1e-9;
    }

    case "hotspot": {
      const regions = question.hotspot_regions || [];
      const region = regions.find((r) => r && r.id === value);
      return region?.isCorrect === true;
    }

    case "drag_drop": {
      const items = (question.drag_items || []).filter((i) => i && typeof i.id === "string");
      if (items.length === 0) return false;

      // Matching variant: item id -> target id
      if (isPlainObject(value)) {
        const map = value as Record<string, string>;
        const matchable = items.filter((i) => i.matchTarget !== null && i.matchTarget !== undefined);
        if (matchable.length === 0) return false;
        if (Object.keys(map).length !== matchable.length) return false;
        return matchable.every((i) => map[i.id] === i.matchTarget);
      }

      // Ordering variant: ordered array of item ids
      const ordered = value as string[];
      const ordered_ids = new Set(ordered);
      if (ordered.length !== items.length || ordered_ids.size !== ordered.length) return false;
      return items.every((item) => {
        if (item.correctPosition === null || item.correctPosition === undefined) return false;
        return ordered.indexOf(item.id) === item.correctPosition;
      });
    }

    case "multiple_choice":
    default: {
      if (question.correct_answer === null || question.correct_answer === undefined) return false;
      return value === question.correct_answer;
    }
  }
}
