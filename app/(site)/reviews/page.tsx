import type { Metadata } from 'next';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { getTestimonials } from '@/lib/cases';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Отзывы',
  description: 'Что говорят клиенты о работе.',
  alternates: { canonical: '/reviews' },
};

/*
 * Every testimonial here was entered by the owner from the admin, or left
 * through the form and approved by him. None is generated.
 *
 * The page used to answer 404 while there was nothing on it. It is in the
 * navigation now, so it always answers: with no reviews yet it is simply the
 * invitation to leave the first one.
 */
export default async function ReviewsPage() {
  const voices = await getTestimonials();

  return (
    <>
      <PageOpening
        eyebrow="Отзывы"
        title="Что говорят клиенты"
        ctaHref="/reviews/new"
        ctaLabel="Оставить отзыв"
      />

      {voices.length > 0 && (
        <Band tone="ground" innerClassName="py-16 md:py-24">
          <div data-reveal="group" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {voices.map((voice) => (
              <ReviewCard key={voice.id} voice={voice} />
            ))}
          </div>
        </Band>
      )}

      <Invite />
    </>
  );
}
