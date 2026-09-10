import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isAnswerCorrect, normalizeAnswer, type GradableQuestion } from "./grading.ts";

const mc: GradableQuestion = { question_type: "multiple_choice", correct_answer: 2 };
const mr: GradableQuestion = { question_type: "multiple_response", correct_answers: [0, 3] };
const num: GradableQuestion = {
  question_type: "number_entry",
  number_answer: 12.5,
  number_tolerance: 0.1,
};
const hotspot: GradableQuestion = {
  question_type: "hotspot",
  hotspot_regions: [
    { id: "r1", isCorrect: false },
    { id: "r2", isCorrect: true },
  ],
};
const dragOrder: GradableQuestion = {
  question_type: "drag_drop",
  drag_items: [
    { id: "a", correctPosition: 0 },
    { id: "b", correctPosition: 1 },
    { id: "c", correctPosition: 2 },
  ],
};
const dragMatch: GradableQuestion = {
  question_type: "drag_drop",
  drag_items: [
    { id: "a", matchTarget: "t1" },
    { id: "b", matchTarget: "t2" },
  ],
  drag_targets: [{ id: "t1" }, { id: "t2" }],
};

Deno.test("multiple choice", () => {
  assertEquals(isAnswerCorrect(mc, 2), true);
  assertEquals(isAnswerCorrect(mc, "2"), true);
  assertEquals(isAnswerCorrect(mc, 1), false);
  assertEquals(isAnswerCorrect(mc, null), false);
  assertEquals(isAnswerCorrect(mc, "abc"), false);
});

Deno.test("multiple response ignores order and duplicates", () => {
  assertEquals(isAnswerCorrect(mr, [3, 0]), true);
  assertEquals(isAnswerCorrect(mr, [0, 0, 3]), true);
  assertEquals(isAnswerCorrect(mr, [0]), false);
  assertEquals(isAnswerCorrect(mr, [0, 3, 1]), false);
  assertEquals(isAnswerCorrect(mr, []), false);
  assertEquals(isAnswerCorrect(mr, 0), false);
});

Deno.test("number entry accepts string values from the UI", () => {
  assertEquals(isAnswerCorrect(num, "12.5"), true);
  assertEquals(isAnswerCorrect(num, 12.5), true);
  assertEquals(isAnswerCorrect(num, " 12.55 "), true); // within tolerance
  assertEquals(isAnswerCorrect(num, "1,2.5".replace("1,2", "12")), true);
  assertEquals(isAnswerCorrect(num, "13"), false);
  assertEquals(isAnswerCorrect(num, ""), false);
  assertEquals(isAnswerCorrect(num, "abc"), false);
});

Deno.test("number entry with thousands separators", () => {
  const q: GradableQuestion = { question_type: "number_entry", number_answer: 1200, number_tolerance: 0 };
  assertEquals(isAnswerCorrect(q, "1,200"), true);
  assertEquals(isAnswerCorrect(q, "1200"), true);
  assertEquals(isAnswerCorrect(q, "1201"), false);
});

Deno.test("hotspot grades by region id", () => {
  assertEquals(isAnswerCorrect(hotspot, "r2"), true);
  assertEquals(isAnswerCorrect(hotspot, "r1"), false);
  assertEquals(isAnswerCorrect(hotspot, "missing"), false);
  assertEquals(isAnswerCorrect(hotspot, 1), false);
  assertEquals(isAnswerCorrect(hotspot, ""), false);
});

Deno.test("drag and drop ordering", () => {
  assertEquals(isAnswerCorrect(dragOrder, ["a", "b", "c"]), true);
  assertEquals(isAnswerCorrect(dragOrder, ["b", "a", "c"]), false);
  assertEquals(isAnswerCorrect(dragOrder, []), false);
  assertEquals(isAnswerCorrect(dragOrder, ["a", "b"]), false);
  assertEquals(isAnswerCorrect(dragOrder, ["a", "a", "c"]), false);
  assertEquals(isAnswerCorrect(dragOrder, null), false);
});

Deno.test("drag and drop matching", () => {
  assertEquals(isAnswerCorrect(dragMatch, { a: "t1", b: "t2" }), true);
  assertEquals(isAnswerCorrect(dragMatch, { a: "t2", b: "t1" }), false);
  assertEquals(isAnswerCorrect(dragMatch, { a: "t1" }), false);
  assertEquals(isAnswerCorrect(dragMatch, {}), false);
});

Deno.test("questions with missing answer data are never correct", () => {
  assertEquals(isAnswerCorrect({ question_type: "multiple_choice" }, 0), false);
  assertEquals(isAnswerCorrect({ question_type: "number_entry" }, "5"), false);
  assertEquals(isAnswerCorrect({ question_type: "hotspot" }, "r1"), false);
  assertEquals(isAnswerCorrect({ question_type: "drag_drop" }, ["a"]), false);
  assertEquals(isAnswerCorrect({ question_type: "multiple_response" }, [1]), false);
});

Deno.test("normalizeAnswer rejects malformed payloads", () => {
  assertEquals(normalizeAnswer("drag_drop", []).valid, false);
  assertEquals(normalizeAnswer("drag_drop", [1, 2]).valid, false);
  assertEquals(normalizeAnswer("multiple_response", ["x"]).valid, false);
  assertEquals(normalizeAnswer("number_entry", {}).valid, false);
  assertEquals(normalizeAnswer("hotspot", {}).valid, false);
  assertEquals(normalizeAnswer("multiple_choice", 1.5).valid, false);
});
