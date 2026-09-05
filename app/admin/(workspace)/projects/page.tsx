import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { listCases } from '@/lib/admin/queries';
import { toggleCasePublished } from '@/app/admin/actions';
import { Toggle } from '@/components/admin/Toggle';

export const dynamic = 'force-dynamic';

/*
 * Cases.
 *
 * Publishing here reaches the live site immediately: the action revalidates the
 * landing page, the register and the case's own address. The vitrine on the
 * home page swaps from services to cases as soon as the first one goes live.
 */
export default async function ProjectsPage() {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const cases = await listCases();
  const published = cases.filter((c) => c.published).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-3">Кейсы</p>
          <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">
            Работы
            <span className="tabular ml-4 text-ink-3">
              {published} из {cases.length}
            </span>
          </h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-xs font-medium tracking-[0.04em] text-paper"
        >
          Добавить кейс
        </Link>
      </header>

      {cases.length === 0 ? (
        <div className="max-w-xl border-t border-line pt-10">
          <p className="text-sm leading-relaxed text-ink-2">
            Кейсов пока нет. Пока их ноль, витрина на главной показывает три ваши главные услуги —
            первый опубликованный кейс займёт её место автоматически.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {cases.map((row) => (
            <li key={row.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_12rem_14rem] lg:items-center">
              <div className="min-w-0">
                <Link
                  href={`/admin/projects/${row.id}`}
                  className="block truncate text-base transition-opacity hover:opacity-60"
                >
                  {row.title}
                </Link>
                <p className="truncate text-xs text-ink-3">
                  {[row.client, row.year].filter(Boolean).join(' · ')} · /work/{row.slug}
                </p>
              </div>

              <p className="text-xs text-ink-3">
                {row.featured ? 'В витрине' : 'Только в реестре'} · порядок {row.order}
              </p>

              <Toggle id={row.id} published={row.published} action={toggleCasePublished} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
