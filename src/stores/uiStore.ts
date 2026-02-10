/**
 * Zustand UI Store
 * Client-side state for UI preferences and transient state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Quiz/exam in-progress state
  activeQuizId: string | null;
  quizAnswers: Record<number, unknown>;
  flaggedQuestions: Set<number>;
  setActiveQuiz: (quizId: string | null) => void;
  setQuizAnswer: (index: number, answer: unknown) => void;
  toggleFlaggedQuestion: (index: number) => void;
  clearQuizState: () => void;

  // Filters
  courseFilter: string;
  difficultyFilter: string;
  setCourseFilter: (filter: string) => void;
  setDifficultyFilter: (filter: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Quiz state (not persisted - handled separately)
      activeQuizId: null,
      quizAnswers: {},
      flaggedQuestions: new Set<number>(),
      setActiveQuiz: (quizId) => set({ activeQuizId: quizId, quizAnswers: {}, flaggedQuestions: new Set() }),
      setQuizAnswer: (index, answer) =>
        set((state) => ({ quizAnswers: { ...state.quizAnswers, [index]: answer } })),
      toggleFlaggedQuestion: (index) =>
        set((state) => {
          const newSet = new Set(state.flaggedQuestions);
          if (newSet.has(index)) newSet.delete(index);
          else newSet.add(index);
          return { flaggedQuestions: newSet };
        }),
      clearQuizState: () => set({ activeQuizId: null, quizAnswers: {}, flaggedQuestions: new Set() }),

      // Filters
      courseFilter: "all",
      difficultyFilter: "all",
      setCourseFilter: (filter) => set({ courseFilter: filter }),
      setDifficultyFilter: (filter) => set({ difficultyFilter: filter }),
    }),
    {
      name: "finatix-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        courseFilter: state.courseFilter,
        difficultyFilter: state.difficultyFilter,
      }),
    }
  )
);
