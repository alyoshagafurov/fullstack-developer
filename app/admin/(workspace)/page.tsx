import Link from 'next/link';

import LeadsRegister from '@/components/admin/LeadsRegister';
import { ResultNotice } from '@/components/admin/StateNotice';
import StatusPill from '@/components/admin/StatusPill';
import { fetchLeads, fetchSummary } from '@/lib/admin-api';
import { LEAD_STATUSES, type LeadStatus, type LeadSummary } from '@/lib/admin-api/types';

/*
 * Обзор — the dashboard.
 *
 * Built from the operator's questions rather than from the available metrics:
 *
 *   how much is in play?      -> the total, held at display scale
 *   where has work piled up?  -> the pipeline as a proportional register
 *   what needs me today?      -> the newest briefs, ready to open
 *
 * Deliberately NOT seven identical tiles. Seven equal boxes give every stage
 * the same weight, which is exactly the information a pipeline is supposed to
 * destroy — the whole point is that the stages differ. So the total is set
 * once, large, and the stages are rows whose bars are readable against each
 * other at a glance.
 */

export const dynamic = 'force-dynamic';

function Stage({ status, count, total }: {
  status: LeadStatus;
  count: number;
  total: number;
}) {
  const share = total > 0 ? count / total : 0;
  // NEW is the only stage that means "nobody has touched this yet", so it is
  // the only one that earns the signal colour.
  const isOpen = status === 'NEW' && count > 0;

  return (
    <Link href={`/admin/leads?status=${status}`} className="a-stage">
      <span className="a-stage-name">
        <StatusPill status={status} />
      </span>
      <span className="a-stage-count">{count}</span>
      <span className="a-stage-bar" aria-hidden>
        <span
          className="a-stage-fill"
          data-open={isOpen}
          style={{ transform: `scaleX(${share})` }}
        />
      </span>
    </Link>
  );
}

function Ledger({ summary }: { summary: LeadSummary }) {
  const untouched = summary.byStatus.NEW ?? 0;

  return (
    <div className="a-ledger">
      <div>
        <p className="a-eyebrow mb-3">Всего заявок</p>
        <span className="a-total-num">{summary.total}</span>
        <p className="text-[13.5px] text-ink-2 mt-4 mb-0">
          {untouched > 0 ? (
            <>
              <span className="text-signal">{untouched}</span> ждут первого ответа
            </>
          ) : (
            'Новых без ответа нет'
          )}
        </p>
      </div>

      <div>
        <p className="a-eyebrow mb-2">Воронка</p>
        {LEAD_STATUSES.map((status) => (
          <Stage
            key={status}
            status={status}
            count={summary.byStatus[status] ?? 0}
            total={summary.total}
          />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [summary, recent] = await Promise.all([
    fetchSummary(),
    fetchLeads(),
  ]);

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <header className="a-head">
        <h1 className="a-title">Обзор</h1>
        <span className="a-eyebrow">{today}</span>
      </header>

      {summary.status === 'ok' ? (
        <section aria-labelledby="pipeline-heading" className="mb-12">
          <h2 id="pipeline-heading" className="sr-only">Состояние воронки</h2>
          <Ledger summary={summary.data} />
        </section>
      ) : (
        <div className="mb-12"><ResultNotice result={summary} /></div>
      )}

      <section aria-labelledby="recent-heading">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 id="recent-heading" className="a-eyebrow">Последние заявки</h2>
          {recent.status === 'ok' && recent.data.count > 0 && (
            <Link
              href="/admin/leads"
              className="a-back text-[13px] text-ink-2 hover:text-signal"
            >
              Все заявки →
            </Link>
          )}
        </div>

        <div className="a-panel">
          {recent.status === 'ok' ? (
            <LeadsRegister rows={recent.data.results.slice(0, 8)} compact />
          ) : (
            <div className="p-5"><ResultNotice result={recent} /></div>
          )}
        </div>
      </section>
    </>
  );
}
