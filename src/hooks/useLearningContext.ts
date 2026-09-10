import { useCallback, useEffect, useState } from "react";
import {
  LearningContext,
  clearLearningContext,
  loadLearningContext,
  saveLearningContext,
} from "@/lib/learningContext";

/**
 * Read/write the visitor's chosen learning context.
 * Kept in sync across tabs and across components in the same tab.
 */
const EVENT = "finatix:learning-context";

export function useLearningContext() {
  const [context, setContext] = useState<LearningContext | null>(() =>
    loadLearningContext(),
  );

  useEffect(() => {
    const sync = () => setContext(loadLearningContext());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const set = useCallback((next: Omit<LearningContext, "savedAt">) => {
    const saved = saveLearningContext(next);
    setContext(saved);
    window.dispatchEvent(new Event(EVENT));
    return saved;
  }, []);

  const clear = useCallback(() => {
    clearLearningContext();
    setContext(null);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { context, setContext: set, clearContext: clear };
}
