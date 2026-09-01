import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import OperatorRail from '@/components/admin/OperatorRail';
import { ResultNotice } from '@/components/admin/StateNotice';
import StatusPill from '@/components/admin/StatusPill';
import { fetchCurrentUser, fetchLead } from '@/lib/admin-api';
import {
  BUDGET_LABEL, PROJECT_TYPE_LABEL, TIMELINE_LABEL, type LeadDetail,
} from '@/lib/admin-api/types';

/*
 * The lead.
 *
 * An editorial hierarchy rather than a stack of equal cards. The client's
 * goal is set large in the serif because it is the one sentence that decides
 * whether this project is worth pursuing; the description follows at reading
 * measure; contacts and commercial terms are compact definition lists; and
 * the provenance timestamps are genuinely small, because they are reference
 * material nobody reads twice.
 *
 * The operator's controls live in a separate rail. That separation is the
 * layout idea: what the client said is a record and cannot be edited; what
 * the operator decides is mutable. One form containing both would blur which
 * is which.
 *
 * `internalNote` is rendered only inside the rail and only reaches this
 * component because Django returned it to an authenticated session holding
 * `view_projectlead`.
 */

export const dynamic = 'force-dynamic';

function dt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function Prose({ title, value }: { title: string; value: string }) {
  const empty = !value?.trim();
  return (
    <section className="a-section">
      <h2 className="a-section-title">{title}</h2>
      <p className="a-prose" data-empty={empty}>{empty ? 'Не заполнено' : value}</p>
    </section>
  );
}

function Contacts({ lead }: { lead: LeadDetail }) {
  const telegram = lead.telegram.replace(/^@/, '');
  return (
    <section className="a-section">
      <h2 className="a-section-title">Клиент</h2>
      <dl className="a-dl">
        <dt>Имя</dt>
        <dd className="text-[color:var(--ink-50)] text-[length:var(--t-16)]">{lead.name || '—'}</dd>

        {lead.company && (<><dt>Компания</dt><dd>{lead.company}</dd></>)}

        <dt>Email</dt>
        <dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd>

        {lead.telegram && (
          <>
            <dt>Telegram</dt>
            <dd>
              <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer">
                @{telegram}
              </a>
            </dd>
          </>
        )}

        {lead.whatsapp && (<><dt>WhatsApp</dt><dd>{lead.whatsapp}</dd></>)}

        <dt>Согласие на связь</dt>
        <dd>{lead.consent ? 'Дано' : 'Нет'}</dd>
      </dl>
    </section>
  );
}

export default async function LeadDetailPage(props: {
  params: Promise<{ reference: string }>;
}) {
  const params = await props.params;
  const reference = decodeURIComponent(params.reference);
  const [result, me] = await Promise.all([fetchLead(reference), fetchCurrentUser()]);

  if (result.status !== 'ok') {
    return (
      <>
        <header className="a-head">
          <div>
            <Link href="/admin/leads" className="a-back">
              <ArrowLeft size={14} aria-hidden strokeWidth={1.75} /> К списку
            </Link>
            <h1 className="a-title">Заявка</h1>
          </div>
        </header>
        <ResultNotice result={result} reference={reference} />
      </>
    );
  }

  const lead = result.data;
  // Both must hold: the role may change leads, AND this deployment is the
  // writer. During the read-only phase the second is false for everyone.
  const canChange = me.status === 'ok'
    && me.data.user.permissions.changeLeads
    && me.data.writesEnabled;
  const readOnlyPhase = me.status === 'ok' && !me.data.writesEnabled;

  const projectType = PROJECT_TYPE_LABEL[lead.projectType] ?? lead.projectType;

  return (
    <>
      <header className="a-head">
        <div className="min-w-0">
          <Link href="/admin/leads" className="a-back">
            <ArrowLeft size={14} aria-hidden strokeWidth={1.75} /> К списку
          </Link>
          <h1 className="a-title tabular-nums">{lead.reference}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <StatusPill status={lead.status} />
          <span className="a-eyebrow mb-0">{dt(lead.createdAt)}</span>
        </div>
      </header>

      <div className="a-detail">
        <div className="min-w-0">
          {/* The goal, set as the lead-in. It is the sentence that decides
              whether this project is worth a reply. */}
          <section className="a-section">
            <h2 className="a-section-title">Цель</h2>
            {lead.goal?.trim()
              ? <p className="a-lead-in">{lead.goal}</p>
              : <p className="a-prose" data-empty>Не заполнено</p>}
          </section>

          <Prose title="Описание" value={lead.description} />
          <Prose title="Функциональность" value={lead.functionality} />

          <section className="a-section">
            <h2 className="a-section-title">Проект</h2>
            <dl className="a-dl">
              <dt>Тип</dt>
              <dd className="text-[color:var(--ink-50)]">
                {projectType}
                {lead.projectType === 'other' && lead.projectTypeOther && ` — ${lead.projectTypeOther}`}
              </dd>
              <dt>Бюджет</dt>
              <dd>{BUDGET_LABEL[lead.budget] ?? lead.budget}</dd>
              <dt>Сроки</dt>
              <dd>{TIMELINE_LABEL[lead.timeline] ?? lead.timeline}</dd>
            </dl>
          </section>

          <Contacts lead={lead} />

          <section className="a-section">
            <h2 className="a-section-title">Референсы</h2>
            <dl className="a-dl">
              <dt>Текущий сайт</dt>
              <dd>
                {lead.existingUrl
                  ? <a href={lead.existingUrl} target="_blank" rel="noopener noreferrer">{lead.existingUrl}</a>
                  : '—'}
              </dd>
              <dt>Ссылки</dt>
              <dd className="whitespace-pre-wrap">{lead.referenceLinks || '—'}</dd>
            </dl>
          </section>

          <Prose title="Комментарий клиента" value={lead.notes} />

          {/* Provenance. Deliberately the smallest type on the screen. */}
          <section className="a-section">
            <h2 className="a-section-title">Служебное</h2>
            <div className="a-meta-grid">
              <div>
                <span className="a-meta-k">Язык брифа</span>
                <span className="a-meta-v">{lead.locale.toUpperCase()}</span>
              </div>
              <div>
                <span className="a-meta-k">Начат</span>
                <span className="a-meta-v">{dt(lead.startedAt)}</span>
              </div>
              <div>
                <span className="a-meta-k">Завершён</span>
                <span className="a-meta-v">{dt(lead.completedAt)}</span>
              </div>
              <div>
                <span className="a-meta-k">Создан</span>
                <span className="a-meta-v">{dt(lead.createdAt)}</span>
              </div>
              <div>
                <span className="a-meta-k">Обновлён</span>
                <span className="a-meta-v">{dt(lead.updatedAt)}</span>
              </div>
            </div>
          </section>
        </div>

        <OperatorRail
          reference={lead.reference}
          status={lead.status}
          internalNote={lead.internalNote ?? ''}
          canChange={canChange}
          readOnlyPhase={readOnlyPhase}
        />
      </div>
    </>
  );
}
