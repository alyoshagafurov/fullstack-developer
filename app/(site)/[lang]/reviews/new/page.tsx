import type { Metadata } from 'next';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { alternatesFor } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/* Leaving a review: the same one-question-per-screen form, in the dark room. */

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.reviewsPage.newMetaTitle,
    description: t.reviewsPage.newMetaDescription,
    alternates: alternatesFor(lang, '/reviews/new'),
  };
}

export default async function NewReviewPage() {
  const { lang, t } = await getDictionary();

  return (
    <section className="relative min-h-[100svh] bg-wall">
      <div className="hall flex min-h-[100svh] flex-col justify-center pt-28 pb-16 md:pt-32">
        <p className="mb-8 text-center text-[1.0625rem] font-medium text-bone-2">{t.reviewsPage.newTitle}</p>
        <ReviewForm lang={lang} copy={t.reviewForm} />
      </div>
    </section>
  );
}
