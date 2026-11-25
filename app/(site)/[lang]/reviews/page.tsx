import type { Metadata } from 'next';
import Link from 'next/link';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/site/Closing';
import { ArrowIcon } from '@/components/museum/Icons';
import { getTestimonials } from '@/lib/cases';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { JsonLd } from '@/lib/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbs } from '@/lib/seo/schema';

/*
 * Every review, unedited, hung like notes left in a visitors' book: the words
 * in thin type, the name in the curator's hand under each. This is the page
 * people come to read, so the text is the exhibit.
 */
export const revalidate = 300;

/* The reviews stay plain text: no Review or rating markup, which Google treats as self-serving on a business's own site. */
export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return pageMetadata({ lang, t, path: '/reviews', title: t.reviewsPage.metaTitle, description: t.reviewsPage.metaDescription });
}

export default async function ReviewsPage() {
  const { lang, t } = await getDictionary();
  const voices = await getTestimonials();

  return (
    <>
      <JsonLd
        data={{ '@context': 'https://schema.org', ...breadcrumbs(lang, t, [{ name: t.nav.reviews, path: '/reviews' }]) }}
      />
      <HallHead title={t.reviewsPage.title} script={t.home.voicesNote} note={t.reviews.workedWithMe}>
        <Link href={localePath(lang, '/reviews/new')} className="btn-line group">
          {t.reviews.leave}
          <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </HallHead>

      {voices.length > 0 && (
        <section className="hall pb-28 md:pb-40" aria-label={t.reviewsPage.title}>
          <ul className="columns-1 gap-x-14 md:columns-2 xl:columns-3">
            {voices.map((voice) => {
              const who = [voice.role, voice.company].filter(Boolean).join(', ');
              const textLang = /[а-яё]/i.test(voice.text) ? 'ru' : 'en';
              return (
                <li key={voice.id} data-fade className="mb-16 break-inside-avoid border-t border-seam pt-8">
                  <blockquote lang={textLang} className="text-[1.0625rem] leading-relaxed font-light text-bone md:text-lg">
                    {voice.text}
                  </blockquote>
                  <p className="mt-6 text-base font-semibold">{voice.name}</p>
                  {who && <p className="wall-label mt-2">{who}</p>}
                  {voice.caseSlug && (
                    <Link href={localePath(lang, `/work/${voice.caseSlug}`)} className="link-quiet mt-3 inline-block text-sm">
                      {t.reviews.projectLink}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Closing lang={lang} t={t} />
    </>
  );
}
