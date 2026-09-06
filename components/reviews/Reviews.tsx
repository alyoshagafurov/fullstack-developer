import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import type { TestimonialRow } from '@/lib/cases';
import { ReviewCard } from '@/components/reviews/ReviewCard';

/*
 * What clients said, directly after the work they are talking about.
 *
 * The form used to stand here. A form in the middle of a landing page asks a
 * visitor who came to read to start writing, and it pushed the rest of the
 * page down for the many to serve the few. The button now carries the few who
 * do have something to say to a page that asks them one question at a time.
 *
 * The band renders even with nothing published: the owner sends clients to
 * this anchor, so the invitation has to be here on the first day too.
 */
export function Reviews({ items, total }: { items: TestimonialRow[]; total: number }) {
  return (
    <Band tone="ground" id="reviews" innerClassName="py-24 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display-2 uppercase">Отзывы</h2>
        {total > items.length && (
          <Link
            href="/reviews"
            className="text-[0.6875rem] tracking-[0.18em] uppercase transition-opacity hover:opacity-60"
          >
            Все {total}
          </Link>
        )}
      </div>

      {items.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((voice) => (
            <ReviewCard key={voice.id} voice={voice} />
          ))}
        </div>
      )}

      <div
        className={`flex flex-wrap items-center gap-x-8 gap-y-6 ${
          items.length > 0 ? 'mt-20 border-t border-line pt-12 md:mt-24' : ''
        }`}
      >
        <p className="label">Работали со мной?</p>
        <CTA href="/reviews/new">Оставить отзыв</CTA>
      </div>
    </Band>
  );
}
