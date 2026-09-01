import Link from 'next/link';

import StatusPill from '@/components/admin/StatusPill';
import {
  BUDGET_LABEL, PROJECT_TYPE_LABEL, TIMELINE_LABEL, type LeadRow,
} from '@/lib/admin-api/types';

/*
 * The register.
 *
 * Two renderings of the same rows, not one squeezed into the other. Above
 * 768 it is a real table — columns an operator scans vertically. Below it,
 * each lead becomes a block with the reference and status on one line and the
 * details beneath, because a seven-column table on a 375px screen is a table
 * nobody reads.
 *
 * Both are plain links to the detail page. There is no row-level action menu
 * and nothing destructive: leads cannot be deleted, here or anywhere.
 */

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  });
}

function label(map: Record<string, string>, code: string): string {
  return map[code] ?? code ?? '—';
}

/** A lead row carries no budget or timeline — those come from the detail. */
export interface RegisterRow extends LeadRow {
  budget?: string;
  timeline?: string;
}

export default function LeadsRegister({
  rows,
  compact = false,
}: {
  rows: RegisterRow[];
  compact?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="a-empty">
        Заявок нет. Как только кто-то заполнит бриф, он появится здесь.
      </p>
    );
  }

  return (
    <>
      {/* ── Table, 768 and up ── */}
      <div className="a-scroll hidden md:block">
        <table className="a-table">
          <caption className="sr-only">Список заявок</caption>
          <thead>
            <tr>
              <th scope="col">Номер</th>
              <th scope="col">Клиент</th>
              <th scope="col">Проект</th>
              {!compact && <th scope="col">Бюджет</th>}
              {!compact && <th scope="col">Сроки</th>}
              <th scope="col">Статус</th>
              <th scope="col">Дата</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.reference}>
                <td>
                  <Link href={`/admin/leads/${row.reference}`} className="a-ref">
                    {row.reference}
                  </Link>
                </td>
                <td className="text-ink">{row.name || '—'}</td>
                <td className="text-ink-2">{label(PROJECT_TYPE_LABEL, row.projectType)}</td>
                {!compact && (
                  <td className="text-ink-2">{label(BUDGET_LABEL, row.budget ?? '')}</td>
                )}
                {!compact && (
                  <td className="text-ink-2">{label(TIMELINE_LABEL, row.timeline ?? '')}</td>
                )}
                <td><StatusPill status={row.status} /></td>
                <td className="text-ink-3 whitespace-nowrap">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Blocks, below 768 ── */}
      <ul className="md:hidden list-none m-0 p-0">
        {rows.map((row) => (
          <li key={row.reference}>
            <Link href={`/admin/leads/${row.reference}`} className="a-card">
              <span className="a-card-top">
                <span className="a-ref">{row.reference}</span>
                <StatusPill status={row.status} />
              </span>
              <span className="block text-ink text-[14px]">{row.name || '—'}</span>
              <span className="block text-ink-3 text-[12.5px] mt-[2px]">
                {label(PROJECT_TYPE_LABEL, row.projectType)} · {formatDate(row.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
