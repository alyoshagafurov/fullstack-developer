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
 * The brief reads as a document — the client's own words at a comfortable
 * measure, in the order they answered them — with the operator's controls in
 * a separate rail. That separation is the whole layout idea: what the client
 * said is a record and cannot be edited; what the operator decides is
 * mutable. Mixing them into one form would blur which is which.
 *
 * `internalNote` is rendered only inside the rail, visually quarantined, and
 * only reaches this component because Django returned it to an authenticated
 * session holding `view_projectlead`.
 */

export const dynamic = 'force-dynamic';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Prose({ title, value }: { title: string; value: string }) {
  const empty = !value?.trim();
  return (
    <section className="a-block">
      <h2 className="a-block-title">{title}</h2>
      <p className="a-prose" data-empty={empty}>
        {empty ? 'Не заполнено' : value}
      </p>
    </section>
  );
}

function Contacts({ lead }: { lead: LeadDetail }) {
  const telegram = lead.telegram.replace(/^@/, '');
  return (
    <section className="a-block">
      <h2 className="a-block-title">Контакты</h2>
      <dl className="a-dl">
        <dt>Имя</dt>
        <dd className="text-ink">{lead.name || '—'}</dd>

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

export default async function LeadDetailPage(
  props: {
    params: Promise<{ reference: string }>;
  }
) {
  const params = await props.params;
  const reference = decodeURIComponent(params.reference);
  const [result, me] = await Promise.all([fetchLead(reference), fetchCurrentUser()]);

  if (result.status !== 'ok') {
    return (
      <>
        <header className="a-head">
          <h1 className="a-title">Заявка</h1>
          <Link href="/admin/leads" className="a-eyebrow a-back hover:text-ink-2">← К списку</Link>
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
        <div>
          <Link href="/admin/leads" className="a-eyebrow a-back hover:text-ink-2 mb-1">
            ← К списку
          </Link>
          <h1 className="a-title tabular-nums">{lead.reference}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <StatusPill status={lead.status} />
          <span className="a-eyebrow">{formatDateTime(lead.createdAt)}</span>
        </div>
      </header>

      <div className="a-detail">
        <div>
          <section className="a-block">
            <h2 className="a-block-title">Проект</h2>
            <dl className="a-dl">
              <dt>Тип</dt>
              <dd className="text-ink">
                {projectType}
                {lead.projectType === 'other' && lead.projectTypeOther
                  && ` — ${lead.projectTypeOther}`}
              </dd>

              <dt>Бюджет</dt>
              <dd>{BUDGET_LABEL[lead.budget] ?? lead.budget}</dd>

              <dt>Сроки</dt>
              <dd>{TIMELINE_LABEL[lead.timeline] ?? lead.timeline}</dd>

              <dt>Язык брифа</dt>
              <dd>{lead.locale.toUpperCase()}</dd>
            </dl>
          </section>

          <Contacts lead={lead} />

          <Prose title="Цель" value={lead.goal} />
          <Prose title="Описание" value={lead.description} />
          <Prose title="Функциональность" value={lead.functionality} />

          <section className="a-block">
            <h2 className="a-block-title">Референсы</h2>
            <dl className="a-dl">
              <dt>Текущий сайт</dt>
              <dd>
                {lead.existingUrl ? (
                  <a href={lead.existingUrl} target="_blank" rel="noopener noreferrer">
                    {lead.existingUrl}
                  </a>
                ) : '—'}
              </dd>
              <dt>Ссылки</dt>
              <dd className="whitespace-pre-wrap">{lead.referenceLinks || '—'}</dd>
            </dl>
          </section>

          <Prose title="Комментарий клиента" value={lead.notes} />

          <section className="a-block">
            <h2 className="a-block-title">Служебное</h2>
            <dl className="a-dl">
              <dt>Заполнение брифа</dt>
              <dd>{formatDateTime(lead.startedAt)} → {formatDateTime(lead.completedAt)}</dd>
              <dt>Обновлено</dt>
              <dd>{formatDateTime(lead.updatedAt)}</dd>
            </dl>
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
