'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import Footer from './Footer';
import Button from './Button';
import { useI18n } from '@/lib/i18n';
import type { ProjectMeta } from '@/lib/projects';

export default function CaseView({ project: p, next }: { project: ProjectMeta; next: ProjectMeta }) {
  const { t } = useI18n();
  const c = t.cases[p.slug];
  const nextC = t.cases[next.slug];
  const ui = t.caseUI;
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  if (!c) return null;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[130]">
        <div className="mx-auto max-w-wide px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" data-hover className="inline-flex items-center gap-2 text-ink-2 hover:text-ink text-[13px] transition-colors">
            <ArrowLeft size={16} /> {ui.back}
          </Link>
          <Link href="/#contact" data-hover className="btn btn-primary !py-2.5 !px-5 !text-[13px] !rounded-xl">{ui.discuss}</Link>
        </div>
      </header>

      <main id="main" ref={ref} className="relative pt-32 md:pt-40 pb-8">
        <div className="mx-auto max-w-content px-6 md:px-10">
          <div data-reveal="0" className="flex items-center gap-3 label mb-8">
            <span>{p.index}</span><span className="w-6 h-px bg-white/30" />
            <span>{c.category}</span><span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{p.year}</span>
          </div>

          <SplitText as="h1" trigger="load" delay={0.1} className="display-tight text-ink text-[12vw] md:text-[5.5rem] max-w-4xl">
            {c.title}
          </SplitText>

          <p data-reveal="1" className="mt-8 text-ink-2 text-xl leading-relaxed max-w-2xl">{c.summary}</p>

          <div data-reveal="2" className="mt-9 flex flex-wrap items-center gap-3">
            {p.liveUrl && (
              <Button href={p.liveUrl} external cursorLabel={ui.openSite}>
                {ui.openSite} <ArrowUpRight size={17} />
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              {c.stack.map((s) => (
                <span key={s} className="text-[12px] text-ink-2 border border-line rounded-full px-3.5 py-2">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* cover — real screenshot of the live project */}
        <div data-reveal="0" className="mx-auto max-w-wide px-6 md:px-10 mt-14 md:mt-20">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-line aspect-[16/10] md:aspect-[16/9]">
            <Image src={p.cover} alt={c.title} fill priority className="object-cover object-top" sizes="100vw" />
          </div>
        </div>

        {/* body */}
        <div className="mx-auto max-w-content px-6 md:px-10 mt-20 md:mt-28 grid md:grid-cols-2 gap-12 md:gap-16">
          <div data-reveal="1">
            <div className="label mb-5">{ui.problem}</div>
            <p className="text-ink text-lg md:text-xl leading-relaxed">{c.problem}</p>
          </div>
          <div data-reveal="2">
            <div className="label mb-5">{ui.solution}</div>
            <p className="text-ink-2 text-lg md:text-xl leading-relaxed">{c.solution}</p>
          </div>
        </div>

        {/* result */}
        <div className="mx-auto max-w-content px-6 md:px-10 mt-20 md:mt-28">
          <div data-reveal="0" className="glass rounded-3xl p-10 md:p-16 flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
            <div>
              <div className="label mb-4">{ui.result}</div>
              <div className="display text-ink text-6xl md:text-8xl tabular-nums leading-none">{c.result.value}</div>
            </div>
            <p className="text-ink-2 text-xl md:text-2xl leading-snug max-w-md">{c.result.label}</p>
          </div>
        </div>

        {/* features */}
        <div className="mx-auto max-w-content px-6 md:px-10 mt-20 md:mt-28">
          <div data-reveal="0" className="label mb-8">{ui.done}</div>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
            {c.features.map((f, i) => (
              <div key={f} data-reveal={String(i % 2)} className="flex items-start gap-4 border-t border-line pt-5">
                <span className="mt-0.5 w-6 h-6 rounded-full border border-line grid place-items-center shrink-0"><Check size={13} /></span>
                <span className="text-ink text-[15px] md:text-base leading-relaxed">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* next */}
        <div className="mx-auto max-w-wide px-6 md:px-10 mt-24 md:mt-32">
          <Link href={`/work/${next.slug}`} data-cursor={ui.discuss} className="group glass rounded-3xl p-8 md:p-12 flex items-center justify-between gap-6">
            <div>
              <div className="label mb-3">{ui.next}</div>
              <div className="display text-ink text-3xl md:text-5xl">{nextC?.title}</div>
            </div>
            <span className="w-14 h-14 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all duration-500 shrink-0">
              <ArrowUpRight size={22} />
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
