import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Quiz/exam in-progress state
  activeQuizId: string | null;
  quizAnswers: Record<number, unknown>;
  flaggedQuestions: number[];
  setActiveQuiz: (quizId: string | null) => void;
  setQuizAnswer: (index: number, answer: unknown) => void;
  toggleFlaggedQuestion: (index: number) => void;
  isFlagged: (index: number) => boolean;
  clearQuizState: () => void;

  // Filters
  courseFilter: string;
  difficultyFilter: string;
  setCourseFilter: (filter: string) => void;
  setDifficultyFilter: (filter: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Quiz state (intentionally not persisted - see partialize below)
      activeQuizId: null,
      quizAnswers: {},
      flaggedQuestions: [],
      setActiveQuiz: (quizId) => set({ activeQuizId: quizId, quizAnswers: {}, flaggedQuestions: [] }),
      setQuizAnswer: (index, answer) =>
        set((state) => ({ quizAnswers: { ...state.quizAnswers, [index]: answer } })),
      toggleFlaggedQuestion: (index) =>
        set((state) => ({
          flaggedQuestions: state.flaggedQuestions.includes(index)
            ? state.flaggedQuestions.filter((i) => i !== index)
            : [...state.flaggedQuestions, index],
        })),
      isFlagged: (index) => get().flaggedQuestions.includes(index),
      clearQuizState: () => set({ activeQuizId: null, quizAnswers: {}, flaggedQuestions: [] }),

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
