import Link from 'next/link';

import StatusPill from '@/components/admin/StatusPill';
import {
  BUDGET_LABEL, PROJECT_TYPE_LABEL, TIMELINE_LABEL, type LeadRow,
} from '@/lib/admin-api/types';

/*
 * The register.
 *
 * Rows, not a table. Each lead is one link separated from the next by a
 * hairline; there are no cell borders, because a grid of boxes makes the eye
 * work at every intersection instead of running down a column.
 *
 * The same markup serves both breakpoints — the grid template changes, not
 * the DOM. Below 900 the row folds to two lines (reference + status, then
 * name and meta); above it, five columns under a sticky header.
 *
 * Weight is not shared equally between the columns. Reference and name are
 * the identity and stay dominant; email is secondary; budget and timeline
 * are compact metadata; status stays instantly scannable; the date is the
 * quietest thing in the row. At 768 the two metadata columns drop out — they
 * are the least useful when scanning — and everything else survives.
 *
 * An absent optional value renders as an em dash, never as an empty cell.
 */

/** Optional values render as an intentional dash, never blank or "undefined". */
const NONE = '—';

function label(map: Record<string, string>, code: string): string {
  if (!code) return NONE;
  // Unknown codes fall through to the raw stored value rather than a blank —
  // an operator seeing `r1k_2k5` learns more than one seeing nothing.
  return map[code] ?? code;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function LeadsRegister({
  rows,
  compact = false,
}: {
  rows: LeadRow[];
  /** Overview uses the compact form: no column header. */
  compact?: boolean;
}) {
  return (
    <>
      {!compact && (
        <div className="a-row-head" aria-hidden>
          <span>Номер</span>
          <span>Клиент</span>
          <span>Проект</span>
          <span className="a-col-meta">Бюджет</span>
          <span className="a-col-meta">Сроки</span>
          <span>Статус</span>
          <span>Дата</span>
        </div>
      )}

      <ul className="list-none m-0 p-0">
        {rows.map((row) => (
          <li key={row.reference}>
            <Link
              href={`/admin/leads/${row.reference}`}
              className="a-row"
              data-compact={compact || undefined}
            >
              <span className="a-ref">{row.reference}</span>

              {/* Identity: name dominant, email secondary beneath it. The
                  title attribute keeps the full address reachable when the
                  column truncates a long one. */}
              <span className="min-w-0 a-hide-sm">
                <span className="a-row-name">{row.name || NONE}</span>
                <span className="a-row-sub block" title={row.email || undefined}>
                  {row.email || NONE}
                </span>
              </span>

              <span className="a-row-meta a-hide-sm">
                {label(PROJECT_TYPE_LABEL, row.projectType)}
              </span>

              <span className="a-row-meta a-hide-sm a-col-meta" title={row.budget || undefined}>
                {label(BUDGET_LABEL, row.budget)}
              </span>
              <span className="a-row-meta a-hide-sm a-col-meta" title={row.timeline || undefined}>
                {label(TIMELINE_LABEL, row.timeline)}
              </span>

              <span className="a-hide-sm"><StatusPill status={row.status} /></span>
              <span className="a-row-date a-hide-sm">{formatDate(row.createdAt)}</span>

              {/* Below 900: status rides the first line, the rest folds under
                  it. Email is included because it is how you reply. */}
              <span className="a-hide-lg justify-self-end"><StatusPill status={row.status} /></span>
              <span className="a-hide-lg col-span-2 min-w-0">
                <span className="a-row-name">{row.name || NONE}</span>
                <span className="a-row-sub block" title={row.email || undefined}>
                  {row.email || NONE}
                </span>
                <span className="a-row-sub block">
                  {label(PROJECT_TYPE_LABEL, row.projectType)}
                  {row.budget ? ` · ${label(BUDGET_LABEL, row.budget)}` : ''}
                  {' · '}{formatDate(row.createdAt)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
