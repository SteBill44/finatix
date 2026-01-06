// Exam Readiness Score Calculator
// Calculates a score from 0-100 predicting exam readiness

export interface ReadinessData {
  completedLessons: number;
  totalLessons: number;
  quizScores: number[]; // Array of scores as percentages
  studyHoursThisMonth: number;
  recommendedHoursPerMonth: number;
  mockExamScores?: number[]; // Optional mock exam scores
}

export interface ReadinessResult {
  score: number;
  level: 'low' | 'medium' | 'high' | 'ready';
  color: string;
  message: string;
  breakdown: {
    lessonProgress: number;
    quizPerformance: number;
    studyTime: number;
    trend: number;
    mockExams: number;
  };
  recommendations: string[];
}

/**
 * Calculate the exam readiness score
 * 
 * Weights:
 * - Lesson completion: 25%
 * - Average quiz scores: 35%
 * - Study time: 15%
 * - Performance trend: 15%
 * - Mock exam performance: 10%
 */
export function calculateReadinessScore(data: ReadinessData): ReadinessResult {
  const {
    completedLessons,
    totalLessons,
    quizScores,
    studyHoursThisMonth,
    recommendedHoursPerMonth,
    mockExamScores = [],
  } = data;

  // 1. Lesson Progress (25%)
  const lessonProgress = totalLessons > 0 
    ? (completedLessons / totalLessons) * 100 
    : 0;

  // 2. Quiz Performance (35%)
  const quizPerformance = quizScores.length > 0
    ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
    : 0;

  // 3. Study Time (15%)
  const studyTimeRatio = recommendedHoursPerMonth > 0
    ? Math.min((studyHoursThisMonth / recommendedHoursPerMonth) * 100, 100)
    : 0;

  // 4. Performance Trend (15%)
  // Compare last 3 quiz scores to first 3 (if available)
  let trend = 50; // Neutral baseline
  if (quizScores.length >= 6) {
    const recentAvg = quizScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlyAvg = quizScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const improvement = recentAvg - earlyAvg;
    trend = Math.min(100, Math.max(0, 50 + improvement));
  } else if (quizScores.length >= 2) {
    const improvement = quizScores[quizScores.length - 1] - quizScores[0];
    trend = Math.min(100, Math.max(0, 50 + improvement / 2));
  }

  // 5. Mock Exam Performance (10%)
  const mockExamAvg = mockExamScores.length > 0
    ? mockExamScores.reduce((a, b) => a + b, 0) / mockExamScores.length
    : quizPerformance; // Fallback to quiz performance if no mock exams

  // Calculate weighted score
  const score = Math.round(
    lessonProgress * 0.25 +
    quizPerformance * 0.35 +
    studyTimeRatio * 0.15 +
    trend * 0.15 +
    mockExamAvg * 0.10
  );

  // Determine level and color
  let level: ReadinessResult['level'];
  let color: string;
  let message: string;

  if (score >= 75) {
    level = 'ready';
    color = 'hsl(var(--success))';
    message = 'You appear ready for the exam!';
  } else if (score >= 60) {
    level = 'high';
    color = 'hsl(142 76% 36%)';
    message = 'Good progress, keep studying!';
  } else if (score >= 40) {
    level = 'medium';
    color = 'hsl(var(--warning))';
    message = 'More preparation needed';
  } else {
    level = 'low';
    color = 'hsl(var(--destructive))';
    message = 'Focus on completing more content';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (lessonProgress < 80) {
    recommendations.push(`Complete ${Math.ceil((0.8 - completedLessons / totalLessons) * totalLessons)} more lessons`);
  }
  
  if (quizPerformance < 70 && quizScores.length > 0) {
    recommendations.push('Review topics where you scored below 70%');
  }
  
  if (studyTimeRatio < 80) {
    const hoursNeeded = Math.ceil((recommendedHoursPerMonth * 0.8 - studyHoursThisMonth));
    if (hoursNeeded > 0) {
      recommendations.push(`Increase study time by ${hoursNeeded}+ hours this month`);
    }
  }
  
  if (quizScores.length < 5) {
    recommendations.push('Take more practice quizzes');
  }
  
  if (mockExamScores.length === 0) {
    recommendations.push('Try a mock exam to test your knowledge');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain your study routine and confidence');
  }

  return {
    score,
    level,
    color,
    message,
    breakdown: {
      lessonProgress: Math.round(lessonProgress),
      quizPerformance: Math.round(quizPerformance),
      studyTime: Math.round(studyTimeRatio),
      trend: Math.round(trend),
      mockExams: Math.round(mockExamAvg),
    },
    recommendations: recommendations.slice(0, 3), // Max 3 recommendations
  };
}

export const READINESS_DISCLAIMER = 
  "This score is an estimate based on your study activity and does not guarantee exam results. " +
  "Actual exam performance depends on many factors including exam conditions, stress management, " +
  "and the specific questions you receive. Use this as a guide, not a prediction.";
