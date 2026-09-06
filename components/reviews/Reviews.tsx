import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import type { TestimonialRow } from '@/lib/cases';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewForm } from '@/components/reviews/ReviewForm';

/*
 * The last band before the footer: what clients said, and the place to say it.
 *
 * The owner sends clients here, so the form is always present — even on the
 * day there is nothing above it yet. Published reviews come first, three of
 * them, with the rest on /reviews.
 */
export function Reviews({ items, total }: { items: TestimonialRow[]; total: number }) {
  return (
    <Band tone="ground" id="reviews" innerClassName="py-24 md:py-32">
      {items.length > 0 && (
        <>
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

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((voice) => (
              <ReviewCard key={voice.id} voice={voice} />
            ))}
          </div>
        </>
      )}

      <div className={items.length > 0 ? 'mt-24 border-t border-line pt-16 md:mt-32 md:pt-20' : ''}>
        <p className="label mb-6">Работали со мной?</p>
        <h2 className="display-3 mb-12 max-w-2xl">Оставить отзыв</h2>
        <ReviewForm />
      </div>
    </Band>
  );
}
