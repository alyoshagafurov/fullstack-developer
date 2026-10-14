import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { alternatesFor } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.reviewsPage.newMetaTitle,
    description: t.reviewsPage.newMetaDescription,
    alternates: alternatesFor(lang, '/reviews/new'),
  };
}

/*
 * The page the owner sends clients to.
 *
 * The black opening says where they are; under it the form has the screen to
 * itself and asks one thing at a time. Nothing else is on this page on purpose:
 * a client who came to write a review should not be sold anything on the way,
 * which is why the floating request button sinks out of view here too.
 */
export default async function NewReviewPage() {
  const { lang, t } = await getDictionary();

  return (
    <>
      <PageOpening eyebrow={t.reviewsPage.eyebrow} title={t.reviewsPage.newTitle} stage={false} />

      <Band tone="ground" innerClassName="py-14 md:py-20">
        <ReviewForm lang={lang} copy={t.reviewForm} />
      </Band>
    </>
  );
}
