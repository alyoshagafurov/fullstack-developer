import Filters from '@/components/admin/Filters';
import LeadsRegister from '@/components/admin/LeadsRegister';
import Pagination from '@/components/admin/Pagination';
import { ResultNotice } from '@/components/admin/StateNotice';
import { fetchLeads } from '@/lib/admin-api';
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/admin-api/types';

/*
 * Заявки — the register.
 *
 * Entirely a server component. Search, filters, sorting and paging all live
 * in the query string, so this screen ships no client JavaScript of its own:
 * the form is a plain GET, the sort controls are links, the pages are links.
 * A CRM list is read far more often than it is interacted with, and that is
 * what makes the trade worth it.
 */

export const dynamic = 'force-dynamic';

const SORTABLE = [
  { key: 'reference', label: 'Номер' },
  { key: 'name', label: 'Клиент' },
  { key: 'status', label: 'Статус' },
  { key: 'createdAt', label: 'Дата' },
] as const;

export default async function LeadsPage(
  props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  const one = (key: string): string => {
    const value = searchParams[key];
    return typeof value === 'string' ? value : '';
  };

  const page = Math.max(1, Number.parseInt(one('page') || '1', 10) || 1);
  const rawStatus = one('status');
  const status = (LEAD_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : '';
  const projectType = one('projectType');
  const q = one('q').slice(0, 120);
  const ordering = one('ordering') || '-createdAt';

  const result = await fetchLeads({ page, status, q, ordering, projectType });

  // Carried onto every sort and page link so a filtered view stays filtered.
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (status) params.status = status;
  if (projectType) params.projectType = projectType;
  if (ordering !== '-createdAt') params.ordering = ordering;

  const sortHref = (key: string) => {
    const next = new URLSearchParams(params);
    // Clicking the active column flips it; clicking another starts descending,
    // which is what "newest / highest first" means for every column here.
    next.set('ordering', ordering === `-${key}` ? key : `-${key}`);
    return `/admin/leads?${next.toString()}`;
  };

  const filtered = Boolean(q || status || projectType);

  return (
    <>
      <header className="a-head">
        <h1 className="a-title">Заявки</h1>
        {result.status === 'ok' && (
          <span className="a-eyebrow">
            {filtered ? `Найдено: ${result.data.count}` : `Всего: ${result.data.count}`}
          </span>
        )}
      </header>

      <Filters active={{ q, status, projectType }} />

      {/* Sorting sits outside the table so it works for the mobile blocks too,
          which have no header row to click. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
        <span className="a-label mb-0">Сортировка</span>
        {SORTABLE.map((column) => {
          const isActive = ordering === column.key || ordering === `-${column.key}`;
          const descending = ordering === `-${column.key}`;
          return (
            <a
              key={column.key}
              href={sortHref(column.key)}
              className="a-sort text-[12.5px] text-ink-3"
              data-active={isActive}
              aria-label={`Сортировать по «${column.label}»${
                isActive ? (descending ? ', сейчас по убыванию' : ', сейчас по возрастанию') : ''
              }`}
            >
              {column.label}
              {isActive && <span aria-hidden>{descending ? '↓' : '↑'}</span>}
            </a>
          );
        })}
      </div>

      {result.status === 'ok' ? (
        <>
          <div className="a-panel">
            {result.data.results.length === 0 && filtered ? (
              <p className="a-empty">
                Ничего не найдено
                {status && ` со статусом «${STATUS_LABEL[status as LeadStatus]}»`}
                {q && ` по запросу «${q}»`}.
              </p>
            ) : (
              <LeadsRegister rows={result.data.results} />
            )}
          </div>
          <Pagination page={page} count={result.data.count} params={params} />
        </>
      ) : (
        <ResultNotice result={result} />
      )}
    </>
  );
}
