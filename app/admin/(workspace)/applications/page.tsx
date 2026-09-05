import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { listLeads } from '@/lib/admin/queries';
import { leadStatuses, statusLabel, type LeadStatusName } from '@/lib/content/finance';
import { projectTypes } from '@/lib/content/brief';

export const dynamic = 'force-dynamic';

/*
 * The register.
 *
 * Filters live in the address bar, so a view the owner uses often is a link he
 * can keep. Paging is done on the server: the browser never receives rows it is
 * not showing, and these rows are clients' contact details.
 *
 * No bulk actions on purpose. There are tens of leads, not thousands, and a
 * mis-click that restatuses twenty of them has no undo.
 */

type Search = { q?: string; status?: string; type?: string; page?: string };

function href(params: Search, patch: Partial<Search>): string {
  const next = new URLSearchParams();
  const merged = { ...params, ...patch };
  for (const [key, value] of Object.entries(merged)) {
    if (value && value !== 'all') next.set(key, value);
  }
  const query = next.toString();
  return query ? `/admin/applications?${query}` : '/admin/applications';
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const params = await searchParams;
  const { rows, total, page, pages } = await listLeads({
    q: params.q,
    status: params.status,
    type: params.type,
    page: Number(params.page) || 1,
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="label mb-3">Заявки</p>
        <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">
          Реестр
          <span className="tabular ml-4 text-ink-3">{total}</span>
        </h1>
      </header>

      {/* Search is a plain GET form: it works without JavaScript and the result
          is a shareable address. */}
      <form method="get" className="flex flex-wrap items-end gap-4 border-t border-line pt-8">
        <label className="min-w-52 flex-1">
          <span className="label mb-3 block">Поиск</span>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="имя, почта, компания, номер"
            className="w-full border-b border-line bg-transparent pb-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <label>
          <span className="label mb-3 block">Статус</span>
          <select
            name="status"
            defaultValue={params.status ?? 'all'}
            className="min-h-9 border-b border-line bg-transparent pb-2 text-sm outline-none focus:border-ink"
          >
            <option value="all">Любой</option>
            {leadStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="label mb-3 block">Тип</span>
          <select
            name="type"
            defaultValue={params.type ?? 'all'}
            className="min-h-9 max-w-48 border-b border-line bg-transparent pb-2 text-sm outline-none focus:border-ink"
          >
            <option value="all">Любой</option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-xs font-medium tracking-[0.04em] text-paper"
        >
          Показать
        </button>

        {(params.q || params.status || params.type) && (
          <Link href="/admin/applications" className="label min-h-10 leading-10 hover:text-ink">
            Сбросить
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="border-t border-line pt-10 text-sm leading-relaxed text-ink-2">
          {total === 0 && !params.q
            ? 'Заявок пока нет. Первая появится здесь сразу после отправки формы на сайте.'
            : 'По этим условиям ничего не нашлось. Попробуйте сбросить фильтры.'}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-line border-y border-line">
            <li className="label hidden py-3 lg:grid lg:grid-cols-[7rem_1fr_12rem_9rem_8rem_7rem] lg:gap-4">
              <span>Номер</span>
              <span>Клиент</span>
              <span>Проект</span>
              <span>Бюджет</span>
              <span>Дата</span>
              <span className="text-right">Статус</span>
            </li>

            {rows.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/applications/${lead.id}`}
                  className="grid gap-1 py-4 transition-opacity hover:opacity-60 lg:grid-cols-[7rem_1fr_12rem_9rem_8rem_7rem] lg:items-center lg:gap-4"
                >
                  <span className="tabular text-xs text-ink-3">{lead.ref}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{lead.name}</span>
                    <span className="block truncate text-xs text-ink-3">
                      {lead.company || lead.email}
                    </span>
                  </span>
                  <span className="truncate text-sm text-ink-2">{lead.projectType}</span>
                  <span className="truncate text-sm text-ink-3">{lead.budget}</span>
                  <span className="tabular text-xs text-ink-3">
                    {lead.createdAt.toLocaleDateString('ru-RU')}
                  </span>
                  <span className="text-xs lg:text-right">
                    {!lead.firstRepliedAt && lead.status === 'NEW' && (
                      <span aria-hidden className="mr-2 inline-block size-1.5 rounded-full bg-ink" />
                    )}
                    {statusLabel[lead.status as LeadStatusName]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Страницы" className="flex items-center gap-4">
              {page > 1 && (
                <Link
                  href={href(params, { page: String(page - 1) })}
                  className="label hover:text-ink"
                >
                  Назад
                </Link>
              )}
              <span className="tabular text-xs text-ink-3">
                {page} из {pages}
              </span>
              {page < pages && (
                <Link
                  href={href(params, { page: String(page + 1) })}
                  className="label hover:text-ink"
                >
                  Дальше
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
