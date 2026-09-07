import type { Metadata } from 'next';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { CTA } from '@/components/ui/CTA';
import { PillLink } from '@/components/ui/Pill';
import { getTestimonials } from '@/lib/cases';
import { site } from '@/lib/content/site';

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

      <Band tone="ground" innerClassName="py-24 md:py-32">
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.03em]">
          {site.contactInvite}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <CTA href="/start">{site.heroCta}</CTA>
          <PillLink href="/reviews/new" variant="outline">
            Оставить отзыв
          </PillLink>
        </div>
      </Band>
    </>
  );
}
