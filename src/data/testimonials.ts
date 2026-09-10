/**
 * Student testimonials.
 *
 * Add an entry ONLY when the student has given written permission to publish
 * their words and their name as shown. Do not paraphrase, shorten in a way
 * that changes meaning, or write a quote on someone's behalf. The testimonial
 * section is hidden completely while this list is empty.
 */

export interface Testimonial {
  id: string;
  /** Name exactly as the student agreed to have it published. */
  name: string;
  /** Their job title or the exam they sat, if they agreed to it. */
  role?: string;
  quote: string;
  /** When the student gave the testimonial. */
  date: string;
  /** Set true only once written permission is on file. */
  approved: boolean;
}

export const TESTIMONIALS: Testimonial[] = [];

export const APPROVED_TESTIMONIALS = TESTIMONIALS.filter((t) => t.approved);
