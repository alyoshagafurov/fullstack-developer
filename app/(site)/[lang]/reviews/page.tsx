import type { Metadata } from 'next';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { getTestimonials } from '@/lib/cases';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.reviewsPage.metaTitle,
    description: t.reviewsPage.metaDescription,
    alternates: alternatesFor(lang, '/reviews'),
  };
}

/*
 * Every testimonial here was entered by the owner from the admin, or left
 * through the form and approved by him. None is generated.
 *
 * The page used to answer 404 while there was nothing on it. It is in the
 * navigation now, so it always answers: with no reviews yet it is simply the
 * invitation to leave the first one.
 */
export default async function ReviewsPage() {
  const { lang, t } = await getDictionary();
  const voices = await getTestimonials();

  return (
    <>
      <PageOpening
        eyebrow={t.reviewsPage.eyebrow}
        title={t.reviewsPage.title}
        cta={{ href: localePath(lang, '/reviews/new'), label: t.reviews.leave }}
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
