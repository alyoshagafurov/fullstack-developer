'use client';

import { useState } from 'react';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import Button from './Button';
import { useI18n } from '@/lib/i18n';

/*
 * Request wizard — the low-friction way for a client to send a brief.
 * Three tap-only questions (task → budget → timeline) then just name + contact.
 * Everything lands in Alisher's Telegram as one structured message.
 */

type State = 'idle' | 'loading' | 'success' | 'error';

export default function RequestWizard() {
  const { t } = useI18n();
  const c = t.contact;
  const w = c.w;

  const [step, setStep] = useState(0);
  const [data, setData] = useState({ task: '', budget: '', timeline: '', name: '', contact: '', message: '' });
  const [state, setState] = useState<State>('idle');
  const [err, setErr] = useState('');

  const steps = [
    { q: w.q1, options: w.tasks, key: 'task' as const },
    { q: w.q2, options: c.budgets, key: 'budget' as const },
    { q: w.q3, options: c.timelines, key: 'timeline' as const },
  ];
  const total = steps.length + 1;

  const pick = (key: 'task' | 'budget' | 'timeline', value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    setTimeout(() => setStep((s) => s + 1), 160);
  };

  const submit = async () => {
    setErr('');
    if (data.name.trim().length < 2 || data.contact.trim().length < 3) {
      setState('error');
      setErr(c.errValidation);
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setState('success');
        return;
      }
      if (json.fallback) {
        const subject = encodeURIComponent(`Заявка с сайта — ${data.name}`);
        const lines = [
          `Имя: ${data.name}`,
          `Контакт: ${data.contact}`,
          data.task && `Задача: ${data.task}`,
          data.budget && `Бюджет: ${data.budget}`,
          data.timeline && `Сроки: ${data.timeline}`,
          '',
          data.message,
        ].filter(Boolean).join('\n');
        window.location.href = `mailto:gafurovalyosha@gmail.com?subject=${subject}&body=${encodeURIComponent(lines)}`;
        setState('success');
        return;
      }
      throw new Error(json.error || 'error');
    } catch {
      setState('error');
      setErr(c.errFail);
    }
  };

  const reset = () => {
    setData({ task: '', budget: '', timeline: '', name: '', contact: '', message: '' });
    setStep(0);
    setState('idle');
  };

  if (state === 'success') {
    return (
      <div className="glass p-6 md:p-9 min-h-[440px] flex flex-col items-center justify-center text-center gap-5">
        <span className="w-16 h-16 rounded-full bg-white text-bg grid place-items-center"><Check size={30} /></span>
        <h3 className="display text-ink text-3xl">{c.okTitle}</h3>
        <p className="text-ink-2 max-w-xs leading-relaxed">{c.okText}</p>
        <button onClick={reset} data-hover className="text-ink-2 hover:text-ink text-sm link-underline mt-2">{c.again}</button>
      </div>
    );
  }

  const cur = steps[step];

  return (
    <div className="glass p-6 md:p-9 min-h-[440px] flex flex-col">
      {/* progress */}
      <div className="flex items-center justify-between gap-4 mb-7">
        <span className="label text-[10px]">{w.step} {step + 1} {w.of} {total}</span>
        <div className="flex-1 h-px bg-line overflow-hidden rounded-full">
          <div className="h-full bg-white/70 transition-[width] duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} data-hover className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink text-[13px] transition-colors">
            <ArrowLeft size={14} /> {w.back}
          </button>
        )}
      </div>

      {cur ? (
        /* ── Tap-only question ── */
        <div className="flex-1 flex flex-col">
          <h3 className="display text-ink text-2xl md:text-3xl mb-2">{cur.q}</h3>
          {step === 0 && <p className="text-muted text-[13px] mb-6">{w.intro}</p>}
          <div className={`grid gap-2.5 ${step === 0 ? 'sm:grid-cols-2' : ''} ${step > 0 ? 'mt-4' : ''}`}>
            {cur.options.map((o) => {
              const active = data[cur.key] === o;
              return (
                <button
                  key={o}
                  onClick={() => pick(cur.key, o)}
                  data-hover
                  className={`text-left rounded-xl border px-5 py-4 text-[15px] transition-all duration-200 ${
                    active
                      ? 'bg-white text-bg border-white'
                      : 'border-line bg-white/[0.02] text-ink hover:bg-white/[0.06] hover:border-line-2'
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Final step: who are you ── */
        <div className="flex-1 flex flex-col">
          <h3 className="display text-ink text-2xl md:text-3xl mb-6">{w.q4}</h3>

          {/* honeypot */}
          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden
            onChange={(e) => setData((d) => ({ ...d, website: e.target.value } as any))} />

          <div className="space-y-4">
            <div>
              <label className="label text-[10px] block mb-2">{c.f.name}</label>
              <input
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                placeholder={c.f.namePh}
                className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] placeholder:text-muted outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors"
              />
            </div>
            <div>
              <label className="label text-[10px] block mb-2">{c.f.contact}</label>
              <input
                value={data.contact}
                onChange={(e) => setData((d) => ({ ...d, contact: e.target.value }))}
                placeholder={c.f.contactPh}
                className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] placeholder:text-muted outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors"
              />
            </div>
            <div>
              <label className="label text-[10px] block mb-2">{w.comment}</label>
              <textarea
                rows={3}
                value={data.message}
                onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
                placeholder={w.commentPh}
                className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] placeholder:text-muted outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors resize-none"
              />
            </div>
          </div>

          {state === 'error' && (
            <p className="mt-4 text-[13px] text-white/80 bg-white/[0.06] border border-line rounded-lg px-3 py-2">{err}</p>
          )}

          <div className="mt-6">
            <Button onClick={submit} disabled={state === 'loading'} className="w-full !py-4" cursorLabel={c.f.submit}>
              {state === 'loading' ? (<><Loader2 size={17} className="animate-spin" /> {c.f.sending}</>) : (<>{c.f.submit} <span aria-hidden>→</span></>)}
            </Button>
            <p className="mt-3 text-center text-[12px] text-muted">{c.f.consent}</p>
          </div>
        </div>
      )}
    </div>
  );
}
