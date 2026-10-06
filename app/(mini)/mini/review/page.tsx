import { MiniReviewForm } from '@/components/mini/MiniReviewForm';

/*
 * Where the bot's «Оставить отзыв» button lands.
 *
 * A client who came to say how the work went should not be sold anything on the
 * way. That is true of /reviews/new on the site and more true here: this window
 * opens over a conversation the owner is already having with them.
 */
export default function MiniReviewPage() {
  return <MiniReviewForm />;
}
