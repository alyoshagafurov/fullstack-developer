'use client';

import { useRef, useState, FormEvent } from 'react';
import { Send, Instagram, Mail, Phone, Check, Loader2 } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import Button from './Button';

const CHANNELS = [
  { icon: Send, label: 'Telegram', value: '@alishergafurovv', href: 'https://t.me/alishergafurovv' },
  { icon: Mail, label: 'Email', value: 'gafurovalyosha@gmail.com', href: 'mailto:gafurovalyosha@gmail.com' },
  { icon: Instagram, label: 'Instagram', value: '@alishergafurow', href: 'https://instagram.com/alishergafurow' },
  { icon: Phone, label: 'Телефон', value: '+992 918 79 32 31', href: 'tel:+992918793231' },
];

const BUDGETS = ['до 1000 сомони', '1000–3000 сомони', '3000–7000 сомони', 'более 7000 сомони'];
const TIMELINES = ['Срочно', '1–2 недели', 'В течение месяца', 'Пока просто изучаю'];

type State = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [state, setState] = useState<State>('idle');
  const [err, setErr] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr('');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if ((data.name || '').trim().length < 2 || (data.message || '').trim().length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
      setState('error');
      setErr('Заполните имя, корректный email и опишите проект (от 10 символов).');
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
      // Fallback: open a prefilled email so the message still reaches Alisher.
      if (json.fallback) {
        const subject = encodeURIComponent(`Заявка с сайта — ${data.name}`);
        const lines = [
          `Имя: ${data.name}`,
          `Email: ${data.email}`,
          data.company && `Компания: ${data.company}`,
          data.budget && `Бюджет: ${data.budget}`,
          data.timeline && `Сроки: ${data.timeline}`,
          '',
          data.message,
        ].filter(Boolean).join('\n');
        window.location.href = `mailto:gafurovalyosha@gmail.com?subject=${subject}&body=${encodeURIComponent(lines)}`;
        setState('success');
        form.reset();
        return;
      }
      throw new Error(json.error || 'error');
    } catch {
      setState('error');
      setErr('Не удалось отправить. Напишите напрямую в Telegram — отвечу быстро.');
    }
  };

  return (
    <section id="contact" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-start">
          {/* Left — pitch + channels */}
          <div>
            <div data-reveal="0" className="label mb-6">Контакт</div>
            <SplitText as="h2" className="display-tight text-ink text-[12vw] md:text-[4.4rem] max-w-xl">
              Есть проект?
              <br /><span className="text-dim">Давайте обсудим.</span>
            </SplitText>
            <p data-reveal="1" className="mt-7 text-ink-2 text-lg leading-relaxed max-w-md">
              Расскажите о задаче — предложу решение, сроки и стоимость. Обычно отвечаю в течение дня.
            </p>

            <div data-reveal="2" className="mt-10 grid sm:grid-cols-2 gap-3">
              {CHANNELS.map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" data-hover
                  className="glass !rounded-2xl p-4 flex items-center gap-3.5 group">
                  <span className="w-10 h-10 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink shrink-0">
                    <c.icon size={17} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0">
                    <span className="block label text-[10px] mb-0.5">{c.label}</span>
                    <span className="block text-ink text-[14px] truncate group-hover:text-white transition-colors">{c.value}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div data-reveal="1" className="glass p-6 md:p-9">
            {state === 'success' ? (
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center gap-5 py-10">
                <span className="w-16 h-16 rounded-full bg-white text-bg grid place-items-center"><Check size={30} /></span>
                <h3 className="display text-ink text-3xl">Заявка отправлена</h3>
                <p className="text-ink-2 max-w-xs leading-relaxed">Спасибо! Я свяжусь с вами в ближайшее время. Если нужно срочно — пишите в Telegram.</p>
                <button onClick={() => setState('idle')} data-hover className="text-ink-2 hover:text-ink text-sm link-underline mt-2">Отправить ещё одну</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                {/* honeypot */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field name="name" label="Имя *" placeholder="Как к вам обращаться" />
                  <Field name="email" label="Email *" type="email" placeholder="you@email.com" />
                </div>
                <Field name="company" label="Компания" placeholder="Необязательно" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select name="budget" label="Бюджет" options={BUDGETS} />
                  <Select name="timeline" label="Сроки" options={TIMELINES} />
                </div>

                <div>
                  <label className="label text-[10px] block mb-2">Опишите проект *</label>
                  <textarea
                    name="message" rows={4} placeholder="Что нужно сделать, какие цели, примеры сайтов..."
                    className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] placeholder:text-muted outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors resize-none"
                  />
                </div>

                {state === 'error' && <p className="text-[13px] text-white/80 bg-white/[0.06] border border-line rounded-lg px-3 py-2">{err}</p>}

                <Button type="submit" className="w-full !py-4" disabled={state === 'loading'} cursorLabel="Отправить">
                  {state === 'loading' ? (<><Loader2 size={17} className="animate-spin" /> Отправка…</>) : (<>Отправить заявку <span aria-hidden>→</span></>)}
                </Button>
                <p className="text-center text-[12px] text-muted">Нажимая «Отправить», вы соглашаетесь на обработку заявки.</p>
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

function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <div>
      <label className="label text-[10px] block mb-2">{label}</label>
      <select
        name={name} defaultValue=""
        className="w-full rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-ink text-[15px] outline-none focus:border-line-2 focus:bg-white/[0.04] transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled className="bg-card text-muted">Выберите…</option>
        {options.map((o) => <option key={o} value={o} className="bg-card text-ink">{o}</option>)}
      </select>
    </div>
  );
}
