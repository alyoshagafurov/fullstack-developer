'use client';

import { useRef } from 'react';
import { Check } from 'lucide-react';
import { useReveal } from './useReveal';
import Button from './Button';
import { useI18n } from '@/lib/i18n';
import { useMoney } from '@/lib/currency';
import { TARIFFS } from '@/lib/pricing';

/*
 * Pricing (full — lives on /pricing): range statement, tariff plans, a per-
 * service price table and a "price depends on the task" block. Every amount is
 * converted from somoni to the active language's currency in real time.
 */
export default function Pricing() {
  const { t } = useI18n();
  const p = t.pricing;
  const money = useMoney();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="pricing" ref={ref} className="relative py-24 md:py-36">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        {/* ── Range ── */}
        <div className="text-center">
          <div data-reveal="0" className="label mb-8">{p.eyebrow}</div>
          <div data-reveal="1" className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
            <div className="flex items-baseline gap-3">
              <span className="label text-[10px]">{p.from}</span>
              <span className="display font-light text-ink text-4xl md:text-6xl tabular-nums">{money(700)}</span>
            </div>
            <span className="hidden sm:block text-dim text-4xl font-light">/</span>
            <div className="flex items-baseline gap-3">
              <span className="label text-[10px]">{p.to}</span>
              <span className="display font-light text-ink text-4xl md:text-6xl tabular-nums">{money(30000)}</span>
            </div>
          </div>
        </div>

        {/* ── Tariffs ── */}
        <div className="mt-20 md:mt-28">
          <div className="text-center mb-12 md:mb-16">
            <div data-reveal="0" className="label mb-4">{p.tariffsTitle}</div>
            <p data-reveal="1" className="text-ink-2 text-lg max-w-xl mx-auto leading-relaxed">{p.tariffsSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {TARIFFS.map((tf, i) => {
              const d = p.tariffs[i];
              if (!d) return null;
              return (
                <div key={tf.id} data-reveal={String(i)} className={`glass p-8 md:p-9 flex flex-col ${tf.popular ? 'md:-mt-4 md:pb-12 border-line-2 !bg-white/[0.05]' : ''}`}>
                  {tf.popular && (
                    <div className="self-start mb-6 inline-flex items-center rounded-full bg-white text-bg text-[11px] font-semibold tracking-wide px-3 py-1">{p.popular}</div>
                  )}
                  <div className="label mb-4">{d.name}</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="label text-[10px]">{p.from}</span>
                    <span className="display text-ink text-4xl md:text-5xl tabular-nums">{money(tf.price)}</span>
                  </div>
                  <p className="text-ink-2 text-[15px] leading-relaxed mb-8">{d.tagline}</p>

                  <div className="flex-1 space-y-3.5 mb-8">
                    {d.features.map((f) => (
                      <div key={f} className="flex items-start gap-3 text-ink-2 text-[14px]">
                        <Check size={16} className="mt-0.5 text-ink shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <Button href="https://t.me/alishergafurovv" external variant={tf.popular ? 'primary' : 'ghost'} cursorLabel={p.order} className="w-full">
                    {p.order} <span aria-hidden>→</span>
                  </Button>
                  <div className="mt-4 text-center label text-[10px]">{d.deadline}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Per-service table ── */}
        <div className="mt-24 md:mt-32">
          <div data-reveal="0" className="label text-center mb-10">{p.tableTitle}</div>
          <div className="hidden md:grid md:grid-cols-[3rem_1fr_12rem_12rem] md:gap-6 label text-[10px] pb-5 px-3">
            <span>№</span><span>{p.th.service}</span><span>{p.from}</span><span>{p.to}</span>
          </div>
          <div className="border-t border-line">
            {p.services.map((s) => (
              <div key={s.n} data-hover className="border-b border-line py-5 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors md:grid md:grid-cols-[3rem_1fr_12rem_12rem] md:gap-6 md:items-center">
                <div className="flex items-center gap-4 md:contents">
                  <span className="label text-[10px] text-muted tabular-nums">{s.n}</span>
                  <h3 className="flex-1 uppercase tracking-[0.1em] text-ink text-[12.5px] md:text-[13px]">{s.name}</h3>
                </div>
                <div className="mt-3 md:mt-0 flex items-center gap-6 md:contents text-[13px] tabular-nums">
                  <span><span className="text-muted md:hidden mr-1.5">{p.from}</span><span className="text-ink-2">{money(s.from)}</span></span>
                  <span><span className="text-muted md:hidden mr-1.5">{p.to}</span><span className="text-ink-2">{money(s.to)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Depends on the task ── */}
        <div className="mt-24 md:mt-32 max-w-2xl mx-auto text-center">
          <div data-reveal="0" className="label mb-8">{p.dependsTitle}</div>
          <p data-reveal="1" className="text-ink text-xl md:text-2xl leading-snug font-light">{p.dependsText}</p>

          <div data-reveal="2" className="mt-12 inline-flex flex-col items-start text-left">
            <div className="label mb-5">{p.factorsTitle}</div>
            <ul className="space-y-3">
              {p.factors.map((f) => (
                <li key={f} className="flex items-center gap-4 text-ink-2 text-[15px] md:text-base">
                  <span className="w-6 h-px bg-white/40 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal="0" className="mt-16 pt-12 border-t border-line">
            <div className="label mb-6">{p.writeTitle}</div>
            <p className="text-ink-2 text-lg md:text-xl leading-relaxed max-w-md mx-auto mb-9">{p.writeText}</p>
            <div className="flex justify-center">
              <Button href="https://t.me/alishergafurovv" external cursorLabel={p.ctaTg}>{p.ctaTg} <span aria-hidden>→</span></Button>
            </div>
            <div className="label text-[10px] mt-8">{p.noPressure}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
