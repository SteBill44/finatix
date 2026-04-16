import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

// ---------------------------------------------------------------------------
// Mocks — factories must be self-contained (vi.mock is hoisted)
// ---------------------------------------------------------------------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

// Import after mocks are declared so we get the mocked versions
import { useSubmitQuiz } from "./useSubmitQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

const MOCK_USER = { id: "user-123", email: "test@example.com" };
const SUBMIT_PARAMS = {
  quizId: "quiz-abc",
  answers: { 0: 1, 1: [0, 2] } as any,
  timeTakenSeconds: 120,
  focusViolations: 0,
};
const SUCCESS_RESPONSE = { success: true, score: 8, maxScore: 10, percentage: 80, attemptId: "attempt-xyz" };

const mockInvoke = () => vi.mocked(supabase.functions.invoke);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useSubmitQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: MOCK_USER } as any);
  });

  it("throws when the user is not signed in", async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    await act(async () => {
      await expect(result.current.mutateAsync(SUBMIT_PARAMS)).rejects.toThrow(
        "You must be signed in to submit a quiz"
      );
    });

    expect(mockInvoke()).not.toHaveBeenCalled();
  });

  it("calls the submit-quiz edge function with the correct payload", async () => {
    mockInvoke().mockResolvedValue({ data: SUCCESS_RESPONSE, error: null } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync(SUBMIT_PARAMS);
    });

    expect(mockInvoke()).toHaveBeenCalledWith("submit-quiz", {
      body: {
        quizId: "quiz-abc",
        answers: { 0: 1, 1: [0, 2] },
        timeTakenSeconds: 120,
        focusViolations: 0,
      },
    });
  });

  it("returns the score data from the edge function on success", async () => {
    mockInvoke().mockResolvedValue({ data: SUCCESS_RESPONSE, error: null } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    let response: any;
    await act(async () => {
      response = await result.current.mutateAsync(SUBMIT_PARAMS);
    });

    expect(response).toEqual(SUCCESS_RESPONSE);
  });

  it("defaults focusViolations to 0 when not provided", async () => {
    mockInvoke().mockResolvedValue({ data: SUCCESS_RESPONSE, error: null } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ quizId: "quiz-abc", answers: {} });
    });

    expect(mockInvoke()).toHaveBeenCalledWith(
      "submit-quiz",
      expect.objectContaining({ body: expect.objectContaining({ focusViolations: 0 }) })
    );
  });

  it("throws when the edge function returns an error object", async () => {
    mockInvoke().mockResolvedValue({ data: null, error: { message: "Function invocation failed" } } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    await act(async () => {
      await expect(result.current.mutateAsync(SUBMIT_PARAMS)).rejects.toThrow("Function invocation failed");
    });
  });

  it("throws when the response body contains an error field", async () => {
    mockInvoke().mockResolvedValue({ data: { error: "Quiz not found" }, error: null } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    await act(async () => {
      await expect(result.current.mutateAsync(SUBMIT_PARAMS)).rejects.toThrow("Quiz not found");
    });
  });

  it("passes null answers through unchanged", async () => {
    mockInvoke().mockResolvedValue({ data: SUCCESS_RESPONSE, error: null } as any);
    const { result } = renderHook(() => useSubmitQuiz(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ quizId: "quiz-abc", answers: { 0: null } });
    });

    expect(mockInvoke()).toHaveBeenCalledWith(
      "submit-quiz",
      expect.objectContaining({ body: expect.objectContaining({ answers: { 0: null } }) })
    );
  });
});
