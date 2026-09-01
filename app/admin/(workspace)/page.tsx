import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import LeadsRegister from '@/components/admin/LeadsRegister';
import { EmptyState, ResultNotice } from '@/components/admin/StateNotice';
import StatusPill from '@/components/admin/StatusPill';
import { fetchLeads, fetchSummary } from '@/lib/admin-api';
import { LEAD_STATUSES, type LeadStatus, type LeadSummary } from '@/lib/admin-api/types';

/*
 * Обзор — the command centre.
 *
 * Built from the operator's questions, in the order they ask them:
 *
 *   what needs me right now?  -> the primary block, largest thing on screen
 *   how much is in play?      -> four compact secondary figures
 *   where has work piled up?  -> the pipeline as a proportional register
 *   what came in last?        -> the newest briefs, one click from opening
 *
 * Deliberately NOT four equal tiles. Equal boxes assert that all four numbers
 * matter equally, which is the one thing a pipeline is never true of. The
 * unanswered count decides the day, so it gets the accent, the largest
 * numeral, and the only call to action on the screen.
 */

export const dynamic = 'force-dynamic';

/** Stages an operator still owes someone a reply on. */
const ACTIVE: LeadStatus[] = ['CONTACTED', 'DISCOVERY', 'PROPOSAL', 'IN_PROGRESS'];

function Primary({ summary }: { summary: LeadSummary }) {
  const untouched = summary.byStatus.NEW ?? 0;

  return (
    <section className="a-primary" aria-labelledby="ov-primary">
      <div>
        <h2 id="ov-primary" className="a-eyebrow" style={{ color: 'var(--accent)' }}>
          Ждут первого ответа
        </h2>
        <span className="a-primary-num">{untouched}</span>
      </div>

      {untouched > 0 ? (
        <div>
          <p className="text-[color:var(--ink-300)] mb-4 max-w-[34ch]">
            {untouched === 1
              ? 'Одна заявка ещё без ответа. Чем быстрее отвечаете, тем выше шанс.'
              : 'Заявки без ответа. Чем быстрее отвечаете, тем выше шанс.'}
          </p>
          <Link href="/admin/leads?status=NEW" className="a-btn" data-variant="solid">
            Открыть новые
            <ArrowRight size={15} aria-hidden strokeWidth={1.75} />
          </Link>
        </div>
      ) : (
        <p className="text-[color:var(--ink-400)] max-w-[34ch]">
          Все новые заявки разобраны. Ничего не ждёт вашего ответа.
        </p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="a-metric">
      <span className="a-metric-num">{value}</span>
      <span className="a-metric-label">{label}</span>
    </div>
  );
}

function Pipeline({ summary }: { summary: LeadSummary }) {
  return (
    <section className="a-panel" aria-labelledby="ov-pipeline">
      <div className="a-panel-head">
        <h2 id="ov-pipeline" className="a-panel-title">Воронка</h2>
        <span className="text-[length:var(--t-12)] text-[color:var(--ink-600)]">
          всего {summary.total}
        </span>
      </div>

      {LEAD_STATUSES.map((status) => {
        const count = summary.byStatus[status] ?? 0;
        const share = summary.total > 0 ? count / summary.total : 0;
        return (
          <Link key={status} href={`/admin/leads?status=${status}`} className="a-stage">
            <span><StatusPill status={status} /></span>
            <span className="a-stage-count">{count}</span>
            <span className="a-stage-bar" aria-hidden>
              <span
                className="a-stage-fill"
                data-open={status === 'NEW' && count > 0}
                style={{ transform: `scaleX(${share})` }}
              />
            </span>
          </Link>
        );
      })}
    </section>
  );
}

export default async function OverviewPage() {
  const [summary, recent] = await Promise.all([fetchSummary(), fetchLeads()]);

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  if (summary.status !== 'ok') {
    return (
      <>
        <header className="a-head">
          <div>
            <span className="a-eyebrow">{today}</span>
            <h1 className="a-title">Обзор</h1>
          </div>
        </header>
        <ResultNotice result={summary} />
      </>
    );
  }

  const s = summary.data;
  const inProgress = ACTIVE.reduce((sum, k) => sum + (s.byStatus[k] ?? 0), 0);

  return (
    <>
      <header className="a-head">
        <div>
          <span className="a-eyebrow">{today}</span>
          <h1 className="a-title">Обзор</h1>
        </div>
      </header>

      {s.total === 0 ? (
        <div className="a-panel">
          <EmptyState
            title="Заявок пока нет"
            body="Как только кто-то заполнит бриф на сайте, он появится здесь — с номером, контактами и описанием проекта."
          />
        </div>
      ) : (
        <>
          <div className="a-grid mb-8 lg:mb-12">
            <Primary summary={s} />
            <Metric label="Всего заявок" value={s.total} />
            <Metric label="В работе" value={inProgress} />
            <Metric label="Завершено" value={s.byStatus.COMPLETED ?? 0} />
            <Metric label="Отклонено" value={s.byStatus.DECLINED ?? 0} />
          </div>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
            <Pipeline summary={s} />

            <section className="a-panel" aria-labelledby="ov-recent">
              <div className="a-panel-head">
                <h2 id="ov-recent" className="a-panel-title">Последние заявки</h2>
                {recent.status === 'ok' && recent.data.count > 0 && (
                  <Link
                    href="/admin/leads"
                    className="text-[length:var(--t-12)] text-[color:var(--ink-400)] hover:text-[color:var(--accent)]"
                  >
                    Все заявки →
                  </Link>
                )}
              </div>

              {recent.status === 'ok' ? (
                <LeadsRegister rows={recent.data.results.slice(0, 6)} compact />
              ) : (
                <div className="p-6"><ResultNotice result={recent} /></div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
