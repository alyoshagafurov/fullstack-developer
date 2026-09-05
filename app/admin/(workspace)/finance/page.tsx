import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getFinance } from '@/lib/admin/queries';
import { money, paymentKindLabel, periods, type PeriodId } from '@/lib/content/finance';
import { ExpenseForm } from './ExpenseForm';

export const dynamic = 'force-dynamic';

/*
 * Money.
 *
 * Income is what arrived, not what was agreed — the owner said so in answer
 * 13.5, and the difference matters when a project is half paid. Everything is
 * grouped by currency and never summed across currencies: he works in three and
 * has set no rate between them, so a single total would be a made-up number.
 */

const dm = (date: Date | null) => (date ? date.toLocaleDateString('ru-RU') : '—');

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const { period: raw } = await searchParams;
  const period = (periods.find((p) => p.id === raw)?.id ?? 'month') as PeriodId;
  const data = await getFinance(period);

  // Profit only makes sense inside one currency.
  const profit = data.received.map((row) => ({
    currency: row.currency,
    total: row.total - (data.spent.find((s) => s.currency === row.currency)?.total ?? 0),
  }));

  const categoryPeak = Math.max(1, ...data.byCategory.map((c) => c.total));

  return (
    <div className="space-y-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-3">Финансы</p>
          <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">Деньги</h1>
        </div>
        <nav aria-label="Период" className="flex gap-1">
          {periods.map((p) => (
            <Link
              key={p.id}
              href={`/admin/finance?period=${p.id}`}
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

      <section className="grid gap-10 border-t border-line pt-10 md:grid-cols-3">
        <Sums title="Получено" rows={data.received} big />
        <Sums title="Потрачено" rows={data.spent} />
        <Sums title="Прибыль" rows={profit} />
      </section>

      <section className="grid gap-12 border-t border-line pt-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="label mb-6">Ждём оплаты</p>
          {data.unpaid.length === 0 ? (
            <p className="text-sm text-ink-2">Долгов нет.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {data.unpaid.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/applications/${row.lead.id}`}
                      className="block truncate text-sm hover:opacity-60"
                    >
                      {row.lead.name}
                    </Link>
                    <p className="text-xs text-ink-3">
                      {row.lead.ref} · до {dm(row.dueAt)}
                    </p>
                  </div>
                  <span
                    className={`tabular shrink-0 text-sm ${
                      row.overdue ? 'underline decoration-2 underline-offset-4' : 'text-ink-2'
                    }`}
                  >
                    {money(row.amount, row.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="label mb-6">Расходы по категориям</p>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-ink-2">За период расходов нет.</p>
          ) : (
            <ul className="space-y-3">
              {data.byCategory
                .slice()
                .sort((a, b) => b.total - a.total)
                .map((row) => (
                  <li key={`${row.category}-${row.currency}`} className="flex items-center gap-4">
                    <span className="w-44 shrink-0 truncate text-xs text-ink-2">{row.category}</span>
                    <span className="h-4 flex-1 bg-shelf">
                      <span
                        className="block h-4 bg-ink"
                        style={{ width: `${(row.total / categoryPeak) * 100}%` }}
                      />
                    </span>
                    <span className="tabular shrink-0 text-xs">
                      {money(row.total, row.currency)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-12 border-t border-line pt-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <p className="label mb-6">Записать расход</p>
          <ExpenseForm />
        </div>

        <div className="space-y-10">
          <div>
            <p className="label mb-6">Последние поступления</p>
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-ink-2">Пока ничего не поступало.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {data.recentPayments.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/applications/${row.lead.id}`}
                        className="block truncate text-sm hover:opacity-60"
                      >
                        {row.lead.name}
                      </Link>
                      <p className="text-xs text-ink-3">
                        {paymentKindLabel[row.kind as keyof typeof paymentKindLabel]} ·{' '}
                        {dm(row.paidAt)}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-sm">
                      {money(row.amount, row.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="label mb-6">Последние расходы</p>
            {data.recentExpenses.length === 0 ? (
              <p className="text-sm text-ink-2">Расходов пока нет.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {data.recentExpenses.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{row.title}</p>
                      <p className="text-xs text-ink-3">
                        {row.category} · {dm(row.spentAt)}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-sm text-ink-2">
                      {money(row.amount, row.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Sums({
  title,
  rows,
  big,
}: {
  title: string;
  rows: { currency: string; total: number }[];
  big?: boolean;
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
              className={`tabular tracking-[-0.03em] ${
                big
                  ? 'text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none'
                  : 'text-[clamp(1.25rem,2.4vw,1.75rem)] text-ink-2'
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
