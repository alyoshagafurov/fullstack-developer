'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

/*
 * Confirmation.
 *
 * Reachable only when the server confirmed storage and issued a reference —
 * there is no client-side path to this screen, so seeing it always means the
 * brief really is on the other side.
 *
 * It states the process, not a deadline: no "within 24 hours" anywhere, since
 * no real response-time commitment is configured as business data yet.
 */

export default function BriefSuccess({ reference, t }: { reference: string; t: Dict['brief'] }) {
  const steps = [t.ok.n1, t.ok.n2, t.ok.n3];

  return (
    <div className="max-w-xl">
      <span className="inline-grid place-items-center w-14 h-14 rounded-full border border-accent/50 bg-accent/[0.1] text-accent mb-9">
        <Check size={24} strokeWidth={2} />
      </span>

      <h1 className="display text-ink text-[9vw] sm:text-5xl md:text-[3.2rem] leading-[1.03] mb-5">
        {t.ok.title}
      </h1>
      <p className="text-ink-2 text-lg leading-relaxed mb-10">{t.ok.lead}</p>

      <div className="border-y border-line py-5 mb-10">
        <div className="label text-[10px] text-muted mb-2">{t.ok.refLabel}</div>
        <div className="font-mono text-ink text-xl tracking-[0.08em] tabular-nums">{reference}</div>
      </div>

      <div className="label text-[10px] text-accent mb-6">{t.ok.whatNext}</div>
      <ol className="space-y-5 mb-12">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-4">
            <span className="shrink-0 label text-[10px] text-muted tabular-nums pt-1">0{i + 1}</span>
            <span className="text-ink-2 text-[15px] leading-relaxed">{s}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3.5">
        <Link href="/work" data-hover className="btn btn-primary !rounded-xl">
          {t.ok.work} <span aria-hidden>→</span>
        </Link>
        <Link href="/" data-hover className="btn btn-ghost !rounded-xl">
          {t.ok.home}
        </Link>
      </div>
    </div>
  );
}
