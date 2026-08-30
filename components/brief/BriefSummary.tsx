'use client';

import type { Dict } from '@/lib/i18n';
import type { ProjectBrief } from '@/lib/brief/schema';

/*
 * The last screen before sending: everything said, in the order it was said,
 * with a way back into any answer.
 *
 * A definition list on hairlines rather than a stack of cards — it should read
 * like a document being handed over, not a settings panel. Each Edit button
 * names its section for screen readers, so a list of seven "Edit" buttons is
 * still navigable out of context.
 */
export default function BriefSummary({
  data, t, onEdit,
}: {
  data: ProjectBrief;
  t: Dict['brief'];
  onEdit: (stepIndex: number) => void;
}) {
  const none = t.sum.none;

  const projectLabel = data.projectType
    ? data.projectType === 'other' && data.projectTypeOther
      ? `${t.types.other} — ${data.projectTypeOther}`
      : t.types[data.projectType]
    : none;

  const scope = [data.description, data.functionality].filter(Boolean).join('\n\n');
  const references = [data.existingUrl, data.referenceLinks, data.notes].filter(Boolean).join('\n');
  const contact = [
    data.name,
    data.company,
    data.email,
    data.telegram && `Telegram ${data.telegram}`,
    data.whatsapp && `WhatsApp ${data.whatsapp}`,
  ].filter(Boolean).join(' · ');

  const rows: { k: string; v: string; step: number; wrap?: boolean }[] = [
    { k: t.sum.project, v: projectLabel, step: 0 },
    { k: t.sum.goal, v: data.goal || none, step: 1, wrap: true },
    { k: t.sum.scope, v: scope || none, step: 2, wrap: true },
    { k: t.sum.references, v: references || none, step: 3, wrap: true },
    { k: t.sum.budget, v: data.budget ? t.budgets[data.budget] : none, step: 4 },
    { k: t.sum.timeline, v: data.timeline ? t.timelines[data.timeline] : none, step: 5 },
    { k: t.sum.contact, v: contact || none, step: 6, wrap: true },
  ];

  return (
    <dl className="border-t border-line">
      {rows.map((r) => (
        <div
          key={r.k}
          className="grid grid-cols-[1fr_auto] sm:grid-cols-[140px_1fr_auto] gap-x-6 gap-y-2
                     items-start border-b border-line py-5"
        >
          <dt className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-3 pt-1">
            {r.k}
          </dt>
          <dd
            className={`col-span-2 sm:col-span-1 text-body ${
              r.v === none ? 'text-ink-3' : 'text-ink'
            } ${r.wrap ? 'whitespace-pre-line break-words' : ''}`}
          >
            {r.v}
          </dd>
          <button
            type="button"
            onClick={() => onEdit(r.step)}
            className="row-start-1 col-start-2 sm:col-start-3 font-mono text-[0.625rem] uppercase
                       tracking-[0.16em] text-ink-3 hover:text-signal transition-colors
                       outline-none focus-visible:text-signal focus-visible:underline"
          >
            {t.edit}
            <span className="sr-only"> — {r.k}</span>
          </button>
        </div>
      ))}
    </dl>
  );
}
