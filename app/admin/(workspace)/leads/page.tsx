import Filters from '@/components/admin/Filters';
import LeadsRegister from '@/components/admin/LeadsRegister';
import Pagination from '@/components/admin/Pagination';
import { EmptyState, ResultNotice } from '@/components/admin/StateNotice';
import { fetchLeads } from '@/lib/admin-api';
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/admin-api/types';

/*
 * Заявки — the workspace.
 *
 * Entirely a server component. Search, filters, sorting and paging all live
 * in the query string, so this screen ships no client JavaScript of its own:
 * the form is a plain GET, the sort controls are links, the pages are links.
 * A register is read far more often than it is interacted with, and that is
 * what makes the trade worth it — it also means no debounce is needed,
 * because nothing fires until submit.
 */

export const dynamic = 'force-dynamic';

const SORTABLE = [
  { key: 'createdAt', label: 'Дате' },
  { key: 'reference', label: 'Номеру' },
  { key: 'name', label: 'Клиенту' },
  { key: 'status', label: 'Статусу' },
] as const;

export default async function LeadsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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
        <div>
          <span className="a-eyebrow">
            {result.status === 'ok'
              ? filtered ? `Найдено ${result.data.count}` : `Всего ${result.data.count}`
              : 'Реестр'}
          </span>
          <h1 className="a-title">Заявки</h1>
        </div>
      </header>

      <Filters active={{ q, status, projectType }} />

      {/* Sorting sits outside the register so it works for the folded mobile
          rows too, which have no column header to click. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-4">
        <span className="a-label mb-0">Сортировать по</span>
        {SORTABLE.map((column) => {
          const isActive = ordering === column.key || ordering === `-${column.key}`;
          const descending = ordering === `-${column.key}`;
          return (
            <a
              key={column.key}
              href={sortHref(column.key)}
              className="a-sort"
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
            {result.data.results.length === 0 ? (
              filtered ? (
                <EmptyState
                  title="Ничего не найдено"
                  body={
                    `Под ${status ? `статус «${STATUS_LABEL[status as LeadStatus]}»` : 'выбранные условия'}`
                    + `${q ? ` и запрос «${q}»` : ''} не подошла ни одна заявка. `
                    + 'Попробуйте смягчить фильтры.'
                  }
                  action={{ href: '/admin/leads', label: 'Сбросить фильтры' }}
                />
              ) : (
                <EmptyState
                  title="Заявок пока нет"
                  body="Как только кто-то заполнит бриф на сайте, он появится здесь — с номером, контактами и описанием проекта."
                />
              )
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
