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
    <section className="form-room relative isolate min-h-[100svh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,rgb(255_236_204/0.1),transparent_55%)]"
      />
      <div className="hall flex min-h-[100svh] flex-col justify-center pt-28 pb-16 md:pt-32">
        <p className="script mb-6 text-center text-[clamp(1.5rem,2.6vw,2.25rem)]">{t.reviewsPage.newTitle}</p>
        <ReviewForm lang={lang} copy={t.reviewForm} />
      </div>
    </section>
  );
}
