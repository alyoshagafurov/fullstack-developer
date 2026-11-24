/*
 * A screenshot of the chat with a client, shown under that client's review on
 * the home page. Empty by default, and no database change is needed to add one:
 *
 *   1. Put the image in public/reviews/ (a .webp about 720px wide is plenty).
 *   2. Add a line below, keyed by the review's id from the admin, or by the
 *      client's name exactly as the review shows it:
 *
 *        'Maftuna': '/reviews/maftuna.webp',
 *
 * Only real screenshots, with the client's consent: blur phone numbers and
 * anything private before uploading.
 */
export const REVIEW_SHOTS: Record<string, string> = {};

/** The screenshot for one review, or null when there is none. */
export function reviewShot(review: { id: string; name: string }): string | null {
  return REVIEW_SHOTS[review.id] ?? REVIEW_SHOTS[review.name] ?? null;
}
