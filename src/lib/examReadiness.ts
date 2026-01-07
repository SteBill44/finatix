// Exam Readiness Score Calculator
// Calculates a score from 0-100 predicting exam readiness

export interface QuizAttemptWithDate {
  score: number;
  maxScore: number;
  attemptedAt: Date;
  syllabusAreaIndex?: number | null;
}

export interface SyllabusAreaMastery {
  areaIndex: number;
  areaName: string;
  totalQuestions: number;
  correctAnswers: number;
  masteryPercentage: number;
}

export interface ReadinessData {
  completedLessons: number;
  totalLessons: number;
  quizScores: number[]; // Array of scores as percentages (legacy support)
  quizAttemptsWithDates?: QuizAttemptWithDate[]; // Quiz attempts with dates for recency
  studyHoursThisMonth: number;
  recommendedHoursPerMonth: number;
  mockExamScores?: number[]; // Optional mock exam scores
  syllabusAreaMastery?: SyllabusAreaMastery[]; // Mastery per syllabus area
  totalSyllabusAreas?: number; // Total number of syllabus areas
}

export interface ConfidenceIndicator {
  level: 'low' | 'medium' | 'high';
  percentage: number;
  message: string;
  dataPoints: {
    quizAttempts: number;
    lessonsCompleted: number;
    studySessions: boolean;
    mockExams: number;
    syllabusAreas: number;
  };
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
    syllabusMastery: number;
  };
  recommendations: string[];
  confidence: ConfidenceIndicator;
}

/**
 * Apply recency weighting to scores - more recent scores count more
 * Uses exponential decay: score * e^(-decay * weeksAgo)
 */
function calculateRecencyWeightedAverage(attempts: QuizAttemptWithDate[]): number {
  if (attempts.length === 0) return 0;
  
  const now = new Date();
  const DECAY_RATE = 0.1; // Decay factor per week
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const attempt of attempts) {
    const weeksAgo = (now.getTime() - attempt.attemptedAt.getTime()) / (7 * 24 * 60 * 60 * 1000);
    const weight = Math.exp(-DECAY_RATE * weeksAgo);
    const scorePercent = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;
    
    weightedSum += scorePercent * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate syllabus area mastery score
 * Returns percentage of areas where student has achieved >= 70% (passing threshold)
 */
function calculateSyllabusMasteryScore(
  mastery: SyllabusAreaMastery[] | undefined,
  totalAreas: number | undefined
): number {
  if (!mastery || mastery.length === 0 || !totalAreas || totalAreas === 0) {
    return 0;
  }
  
  const PASSING_THRESHOLD = 70; // 70% required for mastery
  const masteredAreas = mastery.filter(area => area.masteryPercentage >= PASSING_THRESHOLD).length;
  
  return (masteredAreas / totalAreas) * 100;
}

/**
 * Calculate the exam readiness score
 * 
 * Weights (updated):
 * - Lesson completion: 15%
 * - Quiz performance (recency-weighted): 25%
 * - Syllabus area mastery: 15%
 * - Study time: 10%
 * - Performance trend: 15%
 * - Mock exam performance: 20%
 */
export function calculateReadinessScore(data: ReadinessData): ReadinessResult {
  const {
    completedLessons,
    totalLessons,
    quizScores,
    quizAttemptsWithDates,
    studyHoursThisMonth,
    recommendedHoursPerMonth,
    mockExamScores = [],
    syllabusAreaMastery,
    totalSyllabusAreas,
  } = data;

  // 1. Lesson Progress (15%)
  const lessonProgress = totalLessons > 0 
    ? (completedLessons / totalLessons) * 100 
    : 0;

  // 2. Quiz Performance with Recency Weighting (25%)
  let quizPerformance: number;
  if (quizAttemptsWithDates && quizAttemptsWithDates.length > 0) {
    // Use recency-weighted average
    quizPerformance = calculateRecencyWeightedAverage(quizAttemptsWithDates);
  } else if (quizScores.length > 0) {
    // Fallback to simple average for legacy support
    quizPerformance = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
  } else {
    quizPerformance = 0;
  }

  // 3. Syllabus Area Mastery (15%)
  const syllabusMastery = calculateSyllabusMasteryScore(syllabusAreaMastery, totalSyllabusAreas);

  // 4. Study Time (10%)
  const studyTimeRatio = recommendedHoursPerMonth > 0
    ? Math.min((studyHoursThisMonth / recommendedHoursPerMonth) * 100, 100)
    : 0;

  // 5. Performance Trend (15%)
  // Compare recent vs early performance
  let trend = 50; // Neutral baseline
  const scoresForTrend = quizAttemptsWithDates?.map(a => 
    a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0
  ) || quizScores;
  
  if (scoresForTrend.length >= 6) {
    const recentAvg = scoresForTrend.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlyAvg = scoresForTrend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const improvement = recentAvg - earlyAvg;
    trend = Math.min(100, Math.max(0, 50 + improvement));
  } else if (scoresForTrend.length >= 2) {
    const improvement = scoresForTrend[scoresForTrend.length - 1] - scoresForTrend[0];
    trend = Math.min(100, Math.max(0, 50 + improvement / 2));
  }

  // 6. Mock Exam Performance (20%)
  const mockExamAvg = mockExamScores.length > 0
    ? mockExamScores.reduce((a, b) => a + b, 0) / mockExamScores.length
    : quizPerformance; // Fallback to quiz performance if no mock exams

  // Calculate confidence indicator based on data volume
  const quizAttemptCount = quizAttemptsWithDates?.length || quizScores.length;
  const syllabusAreasWithData = syllabusAreaMastery?.filter(a => a.totalQuestions > 0).length || 0;
  
  const confidenceDataPoints = {
    quizAttempts: quizAttemptCount,
    lessonsCompleted: completedLessons,
    studySessions: studyHoursThisMonth > 0,
    mockExams: mockExamScores.length,
    syllabusAreas: syllabusAreasWithData,
  };
  
  // Calculate confidence score (0-100)
  let confidenceScore = 0;
  
  // Quiz attempts: need at least 10 for high confidence (max 30 points)
  confidenceScore += Math.min(quizAttemptCount / 10, 1) * 30;
  
  // Lessons completed: need at least 50% for high confidence (max 20 points)
  if (totalLessons > 0) {
    confidenceScore += Math.min((completedLessons / totalLessons) / 0.5, 1) * 20;
  }
  
  // Study sessions: any tracked time adds confidence (max 10 points)
  confidenceScore += studyHoursThisMonth > 0 ? 10 : 0;
  
  // Mock exams: need at least 2 for high confidence (max 25 points)
  confidenceScore += Math.min(mockExamScores.length / 2, 1) * 25;
  
  // Syllabus coverage: need data from at least 50% of areas (max 15 points)
  if (totalSyllabusAreas && totalSyllabusAreas > 0) {
    confidenceScore += Math.min((syllabusAreasWithData / totalSyllabusAreas) / 0.5, 1) * 15;
  }
  
  // Determine confidence level
  let confidenceLevel: ConfidenceIndicator['level'];
  let confidenceMessage: string;
  
  if (confidenceScore >= 70) {
    confidenceLevel = 'high';
    confidenceMessage = 'Score based on substantial learning data';
  } else if (confidenceScore >= 40) {
    confidenceLevel = 'medium';
    confidenceMessage = 'More activity will improve accuracy';
  } else {
    confidenceLevel = 'low';
    confidenceMessage = 'Limited data - complete more activities';
  }
  
  const confidence: ConfidenceIndicator = {
    level: confidenceLevel,
    percentage: Math.round(confidenceScore),
    message: confidenceMessage,
    dataPoints: confidenceDataPoints,
  };

  // Calculate weighted score with new weights
  const score = Math.round(
    lessonProgress * 0.15 +      // 15%
    quizPerformance * 0.25 +     // 25%
    syllabusMastery * 0.15 +     // 15%
    studyTimeRatio * 0.10 +      // 10%
    trend * 0.15 +               // 15%
    mockExamAvg * 0.20           // 20%
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
  
  if (quizPerformance < 70 && (quizScores.length > 0 || quizAttemptsWithDates?.length)) {
    recommendations.push('Review topics where you scored below 70%');
  }
  
  // Syllabus mastery recommendations
  if (syllabusAreaMastery && syllabusAreaMastery.length > 0) {
    const weakAreas = syllabusAreaMastery
      .filter(area => area.masteryPercentage < 70)
      .sort((a, b) => a.masteryPercentage - b.masteryPercentage);
    
    if (weakAreas.length > 0) {
      recommendations.push(`Focus on weak area: ${weakAreas[0].areaName}`);
    }
  }
  
  if (studyTimeRatio < 80) {
    const hoursNeeded = Math.ceil((recommendedHoursPerMonth * 0.8 - studyHoursThisMonth));
    if (hoursNeeded > 0) {
      recommendations.push(`Increase study time by ${hoursNeeded}+ hours this month`);
    }
  }
  
  if ((quizScores.length + (quizAttemptsWithDates?.length || 0)) < 5) {
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
      syllabusMastery: Math.round(syllabusMastery),
    },
    recommendations: recommendations.slice(0, 3), // Max 3 recommendations
    confidence,
  };
}

export const READINESS_DISCLAIMER = 
  "This score is an estimate based on your study activity and does not guarantee exam results. " +
  "Actual exam performance depends on many factors including exam conditions, stress management, " +
  "and the specific questions you receive. Use this as a guide, not a prediction.";
