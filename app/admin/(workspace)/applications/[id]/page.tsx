import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getLead } from '@/lib/admin/queries';
import { statusLabel, type LeadStatusName } from '@/lib/content/finance';
import { LeadPanel } from './LeadPanel';

export const dynamic = 'force-dynamic';

/*
 * One lead, in full.
 *
 * Left: what the client wrote, unedited. Right: everything the owner does about
 * it. The split keeps the client's words separate from the owner's working
 * state, so it is always obvious which is which.
 */

const dt = (date: Date) =>
  date.toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const fields: { label: string; value: string | null }[] = [
    { label: 'Компания или проект', value: lead.company },
    { label: 'Тип проекта', value: lead.projectType },
    { label: 'Главная цель', value: lead.goal },
    { label: 'О проекте', value: lead.description },
    { label: 'Кто будет пользоваться', value: lead.audience },
    { label: 'Основные функции', value: lead.features },
    { label: 'Примеры, которые нравятся', value: lead.links },
    { label: 'Дополнительно', value: lead.extra },
    { label: 'Бюджет', value: lead.budget },
    { label: 'Срок', value: lead.timeline },
  ];

  const telegram = lead.contact?.replace(/^@/, '');

  return (
    <div className="space-y-10">
      <header>
        <Link href="/admin/applications" className="label mb-6 inline-block hover:text-ink">
          Заявки
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">{lead.name}</h1>
          <span className="tabular text-sm text-ink-3">{lead.ref}</span>
          <span className="text-sm text-ink-2">{statusLabel[lead.status as LeadStatusName]}</span>
        </div>
        <p className="mt-3 text-sm text-ink-3">
          Пришла {dt(lead.createdAt)}
          {lead.firstRepliedAt ? ` · отвечено ${dt(lead.firstRepliedAt)}` : ' · ещё без ответа'}
          {lead.source === 'telegram' ? ' · из Telegram' : ''}
        </p>
      </header>

      <div className="grid gap-12 border-t border-line pt-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="space-y-10">
          <section className="flex flex-wrap gap-3">
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex min-h-10 items-center rounded-full border border-line-2 px-4 text-xs transition-colors hover:border-ink"
            >
              {lead.email}
            </a>
            {telegram && (
              <a
                href={telegram.startsWith('+') ? `tel:${telegram}` : `https://t.me/${telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-full border border-line-2 px-4 text-xs transition-colors hover:border-ink"
              >
                {lead.contact}
              </a>
            )}
          </section>

          <dl className="space-y-8">
            {fields
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label}>
                  <dt className="label mb-3">{f.label}</dt>
                  <dd className="text-sm leading-relaxed whitespace-pre-line">{f.value}</dd>
                </div>
              ))}
          </dl>

          {lead.notes.length > 0 && (
            <section className="border-t border-line pt-8">
              <p className="label mb-5">Заметки</p>
              <ul className="space-y-5">
                {lead.notes.map((note) => (
                  <li key={note.id}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{note.body}</p>
                    <p className="mt-2 text-xs text-ink-3">{dt(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {lead.events.length > 0 && (
            <section className="border-t border-line pt-8">
              <p className="label mb-5">История</p>
              <ol className="space-y-3">
                {lead.events.map((event) => (
                  <li key={event.id} className="flex items-baseline gap-4 text-sm">
                    <span className="text-ink-3">
                      {event.from ? statusLabel[event.from as LeadStatusName] : '—'}
                    </span>
                    <span aria-hidden className="text-ink-3">
                      →
                    </span>
                    <span>{statusLabel[event.to as LeadStatusName]}</span>
                    <span className="ml-auto text-xs whitespace-nowrap text-ink-3">
                      {dt(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <LeadPanel
          leadId={lead.id}
          status={lead.status as LeadStatusName}
          dealAmount={lead.dealAmount ? Number(lead.dealAmount) : null}
          dealCurrency={lead.dealCurrency}
          payments={lead.payments.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            currency: p.currency,
            kind: p.kind,
            paidAt: p.paidAt ? p.paidAt.toISOString() : null,
            dueAt: p.dueAt ? p.dueAt.toISOString() : null,
            note: p.note,
          }))}
        />
      </div>
    </div>
  );
}
