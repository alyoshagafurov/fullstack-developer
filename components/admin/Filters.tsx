import Link from 'next/link';

import {
  LEAD_STATUSES, PROJECT_TYPE_LABEL, STATUS_LABEL,
} from '@/lib/admin-api/types';

/*
 * Search and filters.
 *
 * A plain GET form. No client component, no state hook, no JavaScript at
 * all: the browser serialises the fields into the query string, the server
 * reads them, the page re-renders. The filters therefore survive a reload,
 * work in a shared link, and cost the bundle nothing — which also removes
 * any need to debounce, since nothing fires until submit.
 *
 * Pagination resets on submit because `page` is not among the fields — a
 * filtered result set has different pages, and staying on page 4 of a
 * three-page result is a bug users blame on themselves.
 */

export interface ActiveFilters {
  q: string;
  status: string;
  projectType: string;
}

export default function Filters({ active }: { active: ActiveFilters }) {
  const hasAny = Boolean(active.q || active.status || active.projectType);

  return (
    <form method="get" action="/admin/leads" role="search" className="mb-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <div>
          <label htmlFor="f-q" className="a-label">Поиск</label>
          <input
            id="f-q"
            name="q"
            type="search"
            defaultValue={active.q}
            placeholder="Номер, имя или email"
            className="a-field"
          />
        </div>

        <div>
          <label htmlFor="f-status" className="a-label">Статус</label>
          <select id="f-status" name="status" defaultValue={active.status} className="a-field">
            <option value="">Все статусы</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABEL[status]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-type" className="a-label">Тип проекта</label>
          <select id="f-type" name="projectType" defaultValue={active.projectType} className="a-field">
            <option value="">Любой тип</option>
            {Object.entries(PROJECT_TYPE_LABEL).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className="a-btn" data-variant="solid">Применить</button>
          {hasAny && <Link href="/admin/leads" className="a-btn" data-variant="quiet">Сбросить</Link>}
        </div>
      </div>
    </form>
  );
}
