// SM-2 Spaced Repetition Algorithm Implementation
// Based on the SuperMemo 2 algorithm by Piotr Wozniak

export interface FlashcardProgress {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_review: string | null;
}

export interface SM2Result {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: Date;
}

/**
 * Calculate the next review based on the SM-2 algorithm
 * @param quality - Rating from 0-5 (0-2 = fail, 3-5 = pass)
 *   0 - Complete blackout
 *   1 - Incorrect response; correct answer remembered
 *   2 - Incorrect response; correct answer seemed easy to recall
 *   3 - Correct response with serious difficulty
 *   4 - Correct response after hesitation
 *   5 - Perfect response
 * @param progress - Current progress data
 * @returns Updated progress data
 */
export function calculateNextReview(
  quality: number,
  progress: FlashcardProgress
): SM2Result {
  // Ensure quality is between 0 and 5
  quality = Math.max(0, Math.min(5, quality));
  
  let { ease_factor, interval_days, repetitions } = progress;
  
  // If quality < 3, start repetitions from the beginning
  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    // Calculate new ease factor
    ease_factor = Math.max(
      1.3,
      ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    
    // Calculate new interval
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    
    repetitions += 1;
  }
  
  // Calculate next review date
  const next_review = new Date();
  next_review.setDate(next_review.getDate() + interval_days);
  
  return {
    ease_factor: Number(ease_factor.toFixed(2)),
    interval_days,
    repetitions,
    next_review,
  };
}

/**
 * Convert quality rating (1-4 UI buttons) to SM-2 quality (0-5)
 * 1 = Again (0)
 * 2 = Hard (2)
 * 3 = Good (3)
 * 4 = Easy (5)
 */
export function uiRatingToSM2Quality(rating: 1 | 2 | 3 | 4): number {
  const mapping: Record<number, number> = {
    1: 0,  // Again -> Blackout
    2: 2,  // Hard -> Incorrect but remembered
    3: 3,  // Good -> Correct with difficulty
    4: 5,  // Easy -> Perfect
  };
  return mapping[rating];
}

/**
 * Get display text for interval
 */
export function formatInterval(days: number): string {
  if (days === 0) return "Now";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.round(days / 365);
  return years === 1 ? "1 year" : `${years} years`;
}

/**
 * Check if a card is due for review
 */
export function isDue(nextReview: string | Date): boolean {
  const reviewDate = new Date(nextReview);
  return reviewDate <= new Date();
}
