export const queryKeys = {
  auth: {
    all: ['auth'],
    session: () => [...queryKeys.auth.all, 'session'],
    user: () => [...queryKeys.auth.all, 'user'],
  },
  courses: {
    all: ['courses'],
    list: () => [...queryKeys.courses.all, 'list'],
    detail: (id: string) => [...queryKeys.courses.all, 'detail', id],
    enrolled: (userId: string) => [...queryKeys.courses.all, 'enrolled', userId],
    byLearningPath: (pathId: string) => [...queryKeys.courses.all, 'learning-path', pathId],
  },
  lessons: {
    all: ['lessons'],
    list: () => [...queryKeys.lessons.all, 'list'],
    detail: (id: string) => [...queryKeys.lessons.all, 'detail', id],
    byCourse: (courseId: string) => [...queryKeys.lessons.all, 'course', courseId],
    progress: (userId: string) => [...queryKeys.lessons.all, 'progress', userId],
  },
  quizzes: {
    all: ['quizzes'],
    list: () => [...queryKeys.quizzes.all, 'list'],
    detail: (id: string) => [...queryKeys.quizzes.all, 'detail', id],
    byCourse: (courseId: string) => [...queryKeys.quizzes.all, 'course', courseId],
    byLesson: (lessonId: string) => [...queryKeys.quizzes.all, 'lesson', lessonId],
    questions: (quizId: string) => [...queryKeys.quizzes.all, 'questions', quizId],
  },
  quizAttempts: {
    all: ['quiz-attempts'],
    list: () => [...queryKeys.quizAttempts.all, 'list'],
    byUser: (userId: string) => [...queryKeys.quizAttempts.all, 'user', userId],
    byQuiz: (quizId: string) => [...queryKeys.quizAttempts.all, 'quiz', quizId],
    byUserAndQuiz: (userId: string, quizId: string) => [
      ...queryKeys.quizAttempts.all,
      'user',
      userId,
      'quiz',
      quizId,
    ],
  },
  studySessions: {
    all: ['study-sessions'],
    list: () => [...queryKeys.studySessions.all, 'list'],
    byUser: (userId: string) => [...queryKeys.studySessions.all, 'user', userId],
    totalTime: (userId: string) => [...queryKeys.studySessions.all, 'total-time', userId],
  },
  enrollments: {
    all: ['enrollments'],
    list: () => [...queryKeys.enrollments.all, 'list'],
    byUser: (userId: string) => [...queryKeys.enrollments.all, 'user', userId],
    byCourse: (courseId: string) => [...queryKeys.enrollments.all, 'course', courseId],
  },
  readinessScore: {
    all: ['readiness-score'],
    byUser: (userId: string) => [...queryKeys.readinessScore.all, 'user', userId],
  },
  achievements: {
    all: ['achievements'],
    byUser: (userId: string) => [...queryKeys.achievements.all, 'user', userId],
  },
  notifications: {
    all: ['notifications'],
    byUser: (userId: string) => [...queryKeys.notifications.all, 'user', userId],
  },
  announcements: {
    all: ['announcements'],
    list: () => [...queryKeys.announcements.all, 'list'],
  },
  admin: {
    all: ['admin'],
    costMonitoring: () => [...queryKeys.admin.all, 'cost-monitoring'],
    users: () => [...queryKeys.admin.all, 'users'],
    auditLogs: () => [...queryKeys.admin.all, 'audit-logs'],
  },
  learningPaths: {
    all: ['learning-paths'],
    list: () => [...queryKeys.learningPaths.all, 'list'],
    detail: (id: string) => [...queryKeys.learningPaths.all, 'detail', id],
  },
} as const;
