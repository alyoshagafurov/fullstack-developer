import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import type { TestimonialRow } from '@/lib/cases';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { fill, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * What clients said, directly after the work they are talking about.
 *
 * The band renders even with nothing published: the owner sends clients to
 * this anchor, so the invitation to leave a review has to be here on the first
 * day too.
 */
export async function Reviews({ items, total }: { items: TestimonialRow[]; total: number }) {
  const { lang, t } = await getDictionary();
  return (
    <Band tone="ground" id="reviews" innerClassName="py-24 md:py-32">
      <div data-reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display-2 uppercase">{t.reviews.title}</h2>
        {total > items.length && (
          <Link
            href={localePath(lang, '/reviews')}
            className="inline-flex min-h-11 items-center text-[0.6875rem] tracking-[0.18em] uppercase transition-opacity hover:opacity-60"
          >
            {fill(t.reviews.all, { n: total })}
          </Link>
        )}
      </div>

      {items.length > 0 && (
        <div data-reveal="group" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((voice) => (
            <ReviewCard key={voice.id} voice={voice} />
          ))}
        </div>
      )}

      <div
        data-reveal
        className={`flex flex-wrap items-center gap-x-8 gap-y-6 ${
          items.length > 0 ? 'mt-20 border-t border-line pt-12 md:mt-24' : ''
        }`}
      >
        <p className="label">{t.reviews.workedWithMe}</p>
        <CTA href={localePath(lang, '/reviews/new')}>{t.reviews.leave}</CTA>
      </div>
    </Band>
  );
}
