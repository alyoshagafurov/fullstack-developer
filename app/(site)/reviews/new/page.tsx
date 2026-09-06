import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { ReviewForm } from '@/components/reviews/ReviewForm';

export const metadata: Metadata = {
  title: 'Оставить отзыв',
  description: 'Пять вопросов о работе: имя, компания, отзыв, оценка и подпись.',
  alternates: { canonical: '/reviews/new' },
};

/*
 * The page the owner sends clients to.
 *
 * The black opening says where they are; under it the form has the screen to
 * itself and asks one thing at a time. Nothing else is on this page on purpose:
 * a client who came to write a review should not be sold anything on the way.
 */
export default function NewReviewPage() {
  return (
    <>
      <PageOpening eyebrow="Отзывы" title="Оставить отзыв" cta={false} />

      <Band tone="ground" innerClassName="py-14 md:py-20">
        <ReviewForm />
      </Band>
    </>
  );
}
