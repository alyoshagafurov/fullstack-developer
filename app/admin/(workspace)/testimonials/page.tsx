import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { listTestimonials } from '@/lib/admin/queries';
import { toggleTestimonialPublished } from '@/app/admin/actions';
import { Toggle } from '@/components/admin/Toggle';

export const dynamic = 'force-dynamic';

/*
 * Testimonials.
 *
 * Only real ones ever land here: nothing on this screen generates a quote or a
 * face, and a testimonial with no photo gets a drawn monogram on the site
 * rather than an invented person. Three appear on the landing page and the rest
 * on /reviews, which stays a 404 until the first one is published.
 */
export default async function TestimonialsPage() {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const rows = await listTestimonials();
  const published = rows.filter((r) => r.published).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-3">Отзывы</p>
          <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">
            Что говорят
            <span className="tabular ml-4 text-ink-3">
              {published} из {rows.length}
            </span>
          </h1>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-xs font-medium tracking-[0.04em] text-paper"
        >
          Добавить отзыв
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="max-w-xl border-t border-line pt-10">
          <p className="text-sm leading-relaxed text-ink-2">
            Отзывов пока нет, и на сайте раздел не показывается. Добавляйте только настоящие: имя,
            компанию и текст с разрешения клиента. Придуманный отзыв считывается сразу и стоит
            дороже, чем его отсутствие.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_12rem_14rem] lg:items-start">
              <div className="min-w-0">
                <Link
                  href={`/admin/testimonials/${row.id}`}
                  className="block text-sm leading-relaxed transition-opacity hover:opacity-60"
                >
                  {row.text.length > 160 ? `${row.text.slice(0, 160)}…` : row.text}
                </Link>
                <p className="mt-2 text-xs text-ink-3">
                  {[row.name, row.role, row.company].filter(Boolean).join(', ')}
                </p>
              </div>

              <p className="text-xs text-ink-3">
                {row.case ? `Кейс: ${row.case.title}` : 'Без кейса'}
                {row.avatarUrl ? ' · с фото' : ' · монограмма'}
              </p>

              <Toggle id={row.id} published={row.published} action={toggleTestimonialPublished} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
