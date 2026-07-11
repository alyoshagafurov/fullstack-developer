'use client';

import { useRef, useState, FormEvent } from 'react';
import { Send, Instagram, Mail, Phone, Check, Loader2 } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import Button from './Button';
import { useI18n } from '@/lib/i18n';

const CHANNEL_ICONS = [Send, Mail, Instagram, Phone];

type State = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [state, setState] = useState<State>('idle');
  const [err, setErr] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr('');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if ((data.name || '').trim().length < 2 || (data.contact || '').trim().length < 3 || (data.message || '').trim().length < 10) {
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
        form.reset();
        return;
      }
      if (json.fallback) {
        const subject = encodeURIComponent(`Заявка с сайта — ${data.name}`);
        const lines = [
          `Имя: ${data.name}`, `Контакт: ${data.contact}`,
          data.budget && `Бюджет: ${data.budget}`,
          data.timeline && `Сроки: ${data.timeline}`,
          '', data.message,
        ].filter(Boolean).join('\n');
        window.location.href = `mailto:gafurovalyosha@gmail.com?subject=${subject}&body=${encodeURIComponent(lines)}`;
        setState('success');
        form.reset();
        return;
      }
      throw new Error(json.error || 'error');
    } catch {
      setState('error');
      setErr(c.errFail);
    }
  };

  return (
    <section id="contact" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-start">
          {/* Left — pitch + channels */}
          <div>
            <div data-reveal="0" className="label mb-6">{c.eyebrow}</div>
            <SplitText as="h2" className="display-tight text-ink text-[12vw] md:text-[4.4rem] max-w-xl">
              {c.title1}
              <br /><span className="text-dim">{c.title2}</span>
            </SplitText>
            <p data-reveal="1" className="mt-7 text-ink-2 text-lg leading-relaxed max-w-md">{c.sub}</p>

            <div data-reveal="2" className="mt-10 grid sm:grid-cols-2 gap-3">
              {c.channels.map((ch, i) => {
                const Icon = CHANNEL_ICONS[i] ?? Send;
                return (
                  <a key={ch.label} href={ch.href} target="_blank" rel="noopener noreferrer" data-hover
                    className="glass !rounded-2xl p-4 flex items-center gap-3.5 group">
                    <span className="w-10 h-10 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink shrink-0">
                      <Icon size={17} strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0">
                      <span className="block label text-[10px] mb-0.5">{ch.label}</span>
                      <span className="block text-ink text-[14px] truncate group-hover:text-white transition-colors">{ch.value}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right — form */}
          <div data-reveal="1" className="glass p-6 md:p-9">
            {state === 'success' ? (
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center gap-5 py-10">
                <span className="w-16 h-16 rounded-full bg-white text-bg grid place-items-center"><Check size={30} /></span>
                <h3 className="display text-ink text-3xl">{c.okTitle}</h3>
                <p className="text-ink-2 max-w-xs leading-relaxed">{c.okText}</p>
                <button onClick={() => setState('idle')} data-hover className="text-ink-2 hover:text-ink text-sm link-underline mt-2">{c.again}</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field name="name" label={c.f.name} placeholder={c.f.namePh} />
                  <Field name="contact" label={c.f.contact} placeholder={c.f.contactPh} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select name="budget" label={c.f.budget} options={c.budgets} placeholder={c.f.select} />
                  <Select name="timeline" label={c.f.timeline} options={c.timelines} placeholder={c.f.select} />
                </div>

                <div>
                  <label className="label text-[10px] block mb-2">{c.f.message}</label>
                  <textarea
                    name="message" rows={4} placeholder={c.f.messagePh}
                    className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] placeholder:text-muted outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors resize-none"
                  />
                </div>

                {state === 'error' && <p className="text-[13px] text-white/80 bg-white/[0.06] border border-line rounded-lg px-3 py-2">{err}</p>}

                <Button type="submit" className="w-full !py-4" disabled={state === 'loading'} cursorLabel={c.f.submit}>
                  {state === 'loading' ? (<><Loader2 size={17} className="animate-spin" /> {c.f.sending}</>) : (<>{c.f.submit} <span aria-hidden>→</span></>)}
                </Button>
                <p className="text-center text-[12px] text-muted">{c.f.consent}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ name, label, type = 'text', placeholder }: { name: string; label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="label text-[10px] block mb-2">{label}</label>
      <input
        name={name} type={type} placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] placeholder:text-muted outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors"
      />
    </div>
  );
}

function Select({ name, label, options, placeholder }: { name: string; label: string; options: string[]; placeholder: string }) {
  return (
    <div>
      <label className="label text-[10px] block mb-2">{label}</label>
      <select
        name={name} defaultValue=""
        className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled className="bg-card text-muted">{placeholder}</option>
        {options.map((o) => <option key={o} value={o} className="bg-card text-ink">{o}</option>)}
      </select>
    </div>
  );
}
