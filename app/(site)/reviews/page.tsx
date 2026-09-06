import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
 * Every testimonial here was entered by the owner from the admin. None is
 * generated, and the page does not exist at all until there is at least one:
 * an empty "what clients say" is worse than no section.
 */
export default async function ReviewsPage() {
  const voices = await getTestimonials();
  if (voices.length === 0) notFound();

  return (
    <>
      <PageOpening eyebrow="Отзывы" title="Что говорят клиенты" />

      <Band tone="ground" innerClassName="py-16 md:py-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {voices.map((voice) => (
            <ReviewCard key={voice.id} voice={voice} />
          ))}
        </div>
      </Band>

      <Band tone="ground" innerClassName="py-24 md:py-32">
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.03em]">
          {site.contactInvite}
        </p>
        <CTA href="/start" className="mt-10">
          {site.heroCta}
        </CTA>
      </Band>
    </>
  );
}
