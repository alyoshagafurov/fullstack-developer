import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getOverview } from '@/lib/admin/queries';
import { money, periods, statusLabel, type PeriodId } from '@/lib/content/finance';

export const dynamic = 'force-dynamic';

/*
 * Command Center.
 *
 * Built around one question: what needs me right now. "Ждут ответа" therefore
 * takes more of the screen than everything else, and the rest is arranged by
 * how often the owner will actually look at it. Deliberately not four identical
 * tiles in a row — that shape says every number matters equally, and here one
 * of them matters far more than the others.
 */

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const { period: raw } = await searchParams;
  const period = (periods.find((p) => p.id === raw)?.id ?? 'month') as PeriodId;
  const data = await getOverview(period);

  const peak = Math.max(1, ...data.funnel.map((f) => f.count));
  const chartPeak = Math.max(1, ...data.weekly.map((w) => w.count));
  const totalWeekly = data.weekly.reduce((sum, w) => sum + w.count, 0);

  return (
    <div className="space-y-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-3">Обзор</p>
          <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">Командный центр</h1>
        </div>
        <nav aria-label="Период" className="flex gap-1">
          {periods.map((p) => (
            <Link
              key={p.id}
              href={`/admin?period=${p.id}`}
              aria-current={p.id === period ? 'page' : undefined}
              className={`inline-flex min-h-9 items-center rounded-full px-4 text-xs transition-colors ${
                p.id === period ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* The one thing that is on fire, if anything is. */}
      <section className="grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <Link href="/admin/applications?status=NEW" className="group block">
          <p className="label mb-5">Ждут первого ответа</p>
          <p
            className={`tabular text-[clamp(4rem,13vw,9rem)] leading-[0.85] tracking-[-0.05em] transition-opacity group-hover:opacity-60 ${
              data.waiting === 0 ? 'text-ink-3' : ''
            }`}
          >
            {data.waiting}
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-2">
            {data.waiting === 0
              ? 'Все заявки отвечены. Пусто — это правильное состояние этого экрана.'
              : 'Заявки, которые никто ещё не тронул. Это единственное, что горит.'}
          </p>
        </Link>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 self-end">
          <Metric label="Новых за период" value={data.fresh} href="/admin/applications" />
          <Metric
            label="Активных проектов"
            value={data.active}
            href="/admin/applications?status=IN_PROGRESS"
          />
          <Metric
            label="Завершено"
            value={data.completed}
            href="/admin/applications?status=COMPLETED"
          />
          <Metric label="Конверсия" value={`${data.conversion}%`} />
        </dl>
      </section>

      {/* Money, grouped by currency and never summed across them. */}
      <section className="grid gap-10 border-t border-line pt-10 md:grid-cols-2 lg:grid-cols-4">
        <MoneyBlock title="Получено" rows={data.received} />
        <MoneyBlock title="Потрачено" rows={data.spent} />
        <MoneyBlock title="Ожидается" rows={data.expected} muted />
        <MoneyBlock title="Просрочено" rows={data.overdue} alarm />
      </section>

      {/* Funnel: bar length is the count, so the shape is the pipeline. */}
      <section className="border-t border-line pt-10">
        <p className="label mb-8">Воронка</p>
        <ol className="space-y-3">
          {data.funnel.map((step) => (
            <li key={step.status}>
              <Link
                href={`/admin/applications?status=${step.status}`}
                className="group flex items-center gap-5 py-1"
              >
                <span className="w-28 shrink-0 text-sm text-ink-2 transition-colors group-hover:text-ink">
                  {statusLabel[step.status]}
                </span>
                <span className="h-6 flex-1 bg-shelf">
                  <span
                    className="block h-6 bg-ink transition-[width] duration-500 ease-[var(--ease-studio)]"
                    style={{ width: `${(step.count / peak) * 100}%` }}
                  />
                </span>
                <span className="tabular w-10 shrink-0 text-right text-sm">{step.count}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Twelve weeks of arrivals. Hairlines, no axes, no gridlines. */}
      <section className="border-t border-line pt-10">
        <p className="label mb-8">Заявки, 12 недель</p>
        <div
          className="flex h-32 items-end gap-1.5"
          role="img"
          aria-label={`График заявок по неделям, всего ${totalWeekly}`}
        >
          {data.weekly.map((week) => (
            <div
              key={week.week}
              className="flex-1 bg-ink"
              style={{ height: `${Math.max(2, (week.count / chartPeak) * 100)}%` }}
              title={`${week.week}: ${week.count}`}
            />
          ))}
        </div>
        <p className="mt-3 flex justify-between text-[0.625rem] tracking-[0.14em] text-ink-3 uppercase">
          <span>12 недель назад</span>
          <span>эта неделя</span>
        </p>
      </section>

      <section className="border-t border-line pt-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <p className="label">Последние заявки</p>
          <Link href="/admin/applications" className="label transition-colors hover:text-ink">
            Все
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-2">
            Заявок пока нет. Как только придёт первая, она появится здесь.
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {data.recent.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/applications/${lead.id}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 transition-opacity hover:opacity-60 md:grid-cols-[7rem_1fr_10rem_8rem_6rem]"
                >
                  <span className="tabular text-xs text-ink-3">{lead.ref}</span>
                  <span className="min-w-0 truncate text-sm">{lead.name}</span>
                  <span className="hidden truncate text-sm text-ink-2 md:block">
                    {lead.projectType}
                  </span>
                  <span className="hidden truncate text-sm text-ink-3 md:block">{lead.budget}</span>
                  <span className="justify-self-end text-xs whitespace-nowrap text-ink-2">
                    {statusLabel[lead.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const body = (
    <>
      <dt className="label mb-3">{label}</dt>
      <dd className="tabular text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none tracking-[-0.04em]">
        {value}
      </dd>
    </>
  );
  return href ? (
    <Link href={href} className="block transition-opacity hover:opacity-60">
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  );
}

/**
 * Sums live under their own currency heading.
 *
 * The owner works in сомони, rubles and dollars and has set no rate between
 * them, so adding them into one figure would invent a number he never had.
 */
function MoneyBlock({
  title,
  rows,
  muted,
  alarm,
}: {
  title: string;
  rows: { currency: string; total: number }[];
  muted?: boolean;
  alarm?: boolean;
}) {
  return (
    <div>
      <p className="label mb-4">{title}</p>
      {rows.length === 0 ? (
        <p className="text-2xl text-ink-3">—</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row) => (
            <li
              key={row.currency}
              className={`tabular text-[clamp(1.125rem,2.2vw,1.5rem)] tracking-[-0.02em] ${
                alarm ? 'underline decoration-2 underline-offset-4' : muted ? 'text-ink-2' : ''
              }`}
            >
              {money(row.total, row.currency)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
