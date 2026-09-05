'use client';

import Panel from '@/components/ui/Panel';
import type { Dict } from '@/lib/i18n';
import type { ProjectBrief } from '@/lib/brief/schema';

/*
 * The last screen before sending: everything said, in the order it was said,
 * with a way back into any answer.
 *
 * A definition list on hairlines inside one panel rather than a stack of
 * cards — it should read like a document being handed over, not a settings
 * panel. Each Edit button names its section for screen readers, so a list of
 * seven "Edit" buttons is still navigable out of context.
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
    <Panel>
      <dl className="m-0">
        {rows.map((r, index) => (
          <div
            key={r.k}
            className={`grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 px-5 py-5 sm:grid-cols-[140px_1fr_auto] md:px-6 ${
              index > 0 ? 'border-t border-edge' : ''
            }`}
          >
            <dt className="label pt-1">{r.k}</dt>
            <dd
              className={`col-span-2 m-0 text-[15px] leading-[1.6] sm:col-span-1 ${
                r.v === none ? 'text-ink-3' : 'text-ink'
              } ${r.wrap ? 'whitespace-pre-line break-words' : ''}`}
            >
              {r.v}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              className="lnk col-start-2 row-start-1 min-h-[28px] text-[11px] uppercase tracking-[0.16em]
                         text-ink-3 hover:text-ink sm:col-start-3"
            >
              {t.edit}
              <span className="sr-only"> — {r.k}</span>
            </button>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
