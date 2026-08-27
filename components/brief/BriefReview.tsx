'use client';

import { Pencil } from 'lucide-react';
import type { Dict } from '@/lib/i18n';
import type { BriefData } from '@/lib/brief/schema';

/*
 * The last screen before sending: everything the visitor said, in the order
 * they said it, with a way back into any answer.
 *
 * Deliberately a definition list on hairlines rather than a stack of cards —
 * it should read like a document being handed over, not a settings panel.
 */

type Props = {
  data: BriefData;
  t: Dict['brief'];
  /** Jump back to the step that owns this answer. */
  onEdit: (stepIndex: number) => void;
};

export default function BriefReview({ data, t, onEdit }: Props) {
  const none = t.sum.none;
  const listOr = (items: string[]) => (items.length ? items.join(' · ') : none);

  const typeLabel = data.projectType
    ? data.projectType === 'other' && data.projectTypeOther
      ? `${t.types.other} — ${data.projectTypeOther}`
      : t.types[data.projectType]
    : none;

  const links = [data.existingUrl, data.referenceUrls].filter(Boolean).join('\n');

  const rows: { k: string; v: string; step: number; wrap?: boolean }[] = [
    { k: t.sum.type, v: typeLabel, step: 0 },
    { k: t.sum.project, v: data.projectName || none, step: 1 },
    { k: t.f.descriptionL, v: data.description || none, step: 1, wrap: true },
    { k: t.sum.problem, v: data.problem || none, step: 2, wrap: true },
    { k: t.sum.needs, v: listOr(data.needs.map((n) => t.needs[n])), step: 3 },
    {
      k: t.sum.features,
      v: listOr([...data.features.map((f) => t.features[f]), data.featuresOther].filter(Boolean) as string[]),
      step: 4,
    },
    { k: t.sum.links, v: links || none, step: 5, wrap: true },
    { k: t.sum.budget, v: data.budget ? t.budgets[data.budget] : none, step: 6 },
    { k: t.sum.timeline, v: data.timeline ? t.timelines[data.timeline] : none, step: 7 },
    {
      k: t.sum.contact,
      v: [data.name, data.email, data.messenger, data.source ? t.sources[data.source] : '']
        .filter(Boolean).join(' · ') || none,
      step: 8,
      wrap: true,
    },
    { k: t.sum.notes, v: data.notes || none, step: 8, wrap: true },
  ];

  return (
    <dl className="border-t border-line">
      {rows.map((r) => (
        <div
          key={r.k + r.step}
          className="group grid grid-cols-[1fr_auto] sm:grid-cols-[160px_1fr_auto] gap-x-5 gap-y-1 items-start border-b border-line py-4"
        >
          <dt className="label text-[10px] text-muted pt-1 col-span-1 sm:col-auto">{r.k}</dt>
          <dd
            className={`col-span-2 sm:col-span-1 text-[15px] leading-relaxed ${
              r.v === none ? 'text-muted' : 'text-ink'
            } ${r.wrap ? 'whitespace-pre-line break-words' : ''}`}
          >
            {r.v}
          </dd>
          <button
            type="button"
            data-hover
            onClick={() => onEdit(r.step)}
            className="row-start-1 col-start-2 sm:col-start-3 inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-accent transition-colors outline-none focus-visible:text-accent focus-visible:underline"
          >
            <Pencil size={12} />
            <span className="sr-only sm:not-sr-only">{t.edit}</span>
            <span className="sr-only">— {r.k}</span>
          </button>
        </div>
      ))}
    </dl>
  );
}
