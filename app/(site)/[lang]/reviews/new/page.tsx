import type { Metadata } from 'next';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { getDictionary } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo/metadata';

/* Leaving a review: the same one-question-per-screen form, in the dark room. */

/*
 * Kept out of the index: it is a form for people he has already worked with,
 * and a searcher landing on it would find five questions and nothing else.
 * Links on it are still followed, and it is no longer in the sitemap.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return pageMetadata({
    lang,
    t,
    path: '/reviews/new',
    title: t.reviewsPage.newMetaTitle,
    description: t.reviewsPage.newMetaDescription,
    robots: { index: false, follow: true },
  });
}

export default async function NewReviewPage() {
  const { lang, t } = await getDictionary();

  return (
    <section className="relative min-h-[100svh] bg-wall">
      <div className="hall flex min-h-[100svh] flex-col justify-center pt-28 pb-16 md:pt-32">
        {/* the page's one heading, quiet over the form */}
        <h1 className="mb-8 text-center text-[1.0625rem] font-medium text-bone-2">{t.reviewsPage.newTitle}</h1>
        <ReviewForm lang={lang} copy={t.reviewForm} />
      </div>
    </section>
  );
}
