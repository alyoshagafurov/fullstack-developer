'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { budgets, consentLabel, projectTypes, timelines } from '@/lib/content/brief';

/*
 * The brief.
 *
 * Four short steps rather than one long page: the owner asks for twelve things,
 * and twelve fields at once is where people close the tab. The draft is kept in
 * sessionStorage so a reload or a mis-tap does not cost the visitor their
 * typing; it never leaves the browser.
 *
 * The checks here are a courtesy. The server re-validates the whole body with
 * the same schema, so nothing depends on this file being honest.
 */

type Values = Record<string, string | boolean>;

const STEPS = [
  { id: 'about', title: 'О вас', required: ['name', 'email', 'contact'] },
  { id: 'project', title: 'Проект', required: ['projectType', 'goal', 'description'] },
  { id: 'shape', title: 'Детали', required: [] as string[] },
  { id: 'frame', title: 'Рамки', required: ['budget', 'timeline', 'consent'] },
] as const;

const DRAFT_KEY = 'aly-brief-draft';

const EMPTY: Values = {
  name: '',
  company: '',
  email: '',
  contact: '',
  projectType: '',
  goal: '',
  description: '',
  audience: '',
  features: '',
  links: '',
  budget: '',
  timeline: '',
  extra: '',
  consent: false,
  website: '',
};

const inputClass =
  'w-full border-b border-line bg-transparent pb-3 text-base outline-none transition-colors ' +
  'placeholder:text-ink-3 focus:border-ink';

export function BriefForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const heading = useRef<HTMLHeadingElement>(null);

  // Restore a draft, if the visitor was here a moment ago.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setValues({ ...EMPTY, ...(JSON.parse(raw) as Values) });
    } catch {
      // A blocked or full sessionStorage is not a reason to fail the form.
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values]);

  const set = (field: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: '' } : e));
  };

  const current = STEPS[step];
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    const required: readonly string[] = current.required;

    for (const field of required) {
      const value = values[field];
      if (field === 'consent') {
        if (value !== true) next[field] = 'Без согласия я не смогу с вами связаться';
      } else if (!String(value).trim()) {
        next[field] = 'Заполните это поле';
      }
    }

    if (required.includes('email') && String(values.email).trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))) {
        next.email = 'Проверьте адрес почты';
      }
    }
    if (required.includes('description')) {
      const text = String(values.description).trim();
      if (text && text.length < 10) next.description = 'Пары слов мало — расскажите чуть подробнее';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    heading.current?.focus();
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    heading.current?.focus();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateStep()) return;

    setSending(true);
    setFormError('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, startedAt: startedAt.current }),
      });
      const payload = (await response.json()) as {
        ref?: string;
        error?: string;
        issues?: Record<string, string>;
      };

      if (!response.ok) {
        if (payload.issues) setErrors(payload.issues);
        setFormError(payload.error ?? 'Не получилось отправить заявку');
        setSending(false);
        return;
      }

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/start/thanks?ref=${encodeURIComponent(payload.ref ?? '')}`);
    } catch {
      setFormError('Сеть недоступна. Попробуйте ещё раз или напишите в Telegram.');
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl">
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <p className="label">
            Шаг {step + 1} из {STEPS.length}
          </p>
          <p className="label">{current.title}</p>
        </div>
        <div className="h-px w-full bg-line">
          <div
            className="h-px bg-ink transition-[width] duration-500 ease-[var(--ease-studio)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 ref={heading} tabIndex={-1} className="sr-only">
        {current.title}
      </h2>

      {step === 0 && (
        <div className="space-y-8">
          <Field label="Как вас зовут" error={errors.name}>
            <input
              className={inputClass}
              value={String(values.name)}
              onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Компания или проект" hint="если есть" error={errors.company}>
            <input
              className={inputClass}
              value={String(values.company)}
              onChange={(e) => set('company', e.target.value)}
              autoComplete="organization"
            />
          </Field>
          <Field label="Почта" error={errors.email}>
            <input
              type="email"
              inputMode="email"
              className={inputClass}
              value={String(values.email)}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Telegram или WhatsApp" error={errors.contact}>
            <input
              className={inputClass}
              value={String(values.contact)}
              onChange={(e) => set('contact', e.target.value)}
              placeholder="@username или +992 …"
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <fieldset>
            <legend className="label mb-4">Что нужно сделать</legend>
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('projectType', type)}
                  aria-pressed={values.projectType === type}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
                    values.projectType === type
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line text-ink-2 hover:border-ink hover:text-ink'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.projectType && (
              <p className="mt-2 text-sm text-ink">{errors.projectType}</p>
            )}
          </fieldset>

          <Field label="Главная цель" hint="что должно измениться после запуска" error={errors.goal}>
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.goal)}
              onChange={(e) => set('goal', e.target.value)}
            />
          </Field>
          <Field label="Кратко о проекте" error={errors.description}>
            <textarea
              rows={5}
              className={inputClass}
              value={String(values.description)}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <Field label="Кто будет пользоваться" hint="необязательно" error={errors.audience}>
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.audience)}
              onChange={(e) => set('audience', e.target.value)}
            />
          </Field>
          <Field label="Основные функции" hint="необязательно" error={errors.features}>
            <textarea
              rows={4}
              className={inputClass}
              value={String(values.features)}
              onChange={(e) => set('features', e.target.value)}
            />
          </Field>
          <Field label="Примеры, которые нравятся" hint="ссылки, необязательно" error={errors.links}>
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.links)}
              onChange={(e) => set('links', e.target.value)}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <fieldset>
            <legend className="label mb-4">Примерный бюджет</legend>
            <div className="space-y-2">
              {budgets.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => set('budget', band.value)}
                  aria-pressed={values.budget === band.value}
                  className={`flex min-h-14 w-full items-center justify-between gap-4 border-b px-1 text-left transition-colors ${
                    values.budget === band.value ? 'border-ink' : 'border-line hover:border-ink-3'
                  }`}
                >
                  <span className="text-sm">{band.value}</span>
                  <span className="text-xs text-ink-3">{band.note}</span>
                </button>
              ))}
            </div>
            {errors.budget && <p className="mt-2 text-sm text-ink">{errors.budget}</p>}
          </fieldset>

          <fieldset>
            <legend className="label mb-4">Желаемый срок</legend>
            <div className="space-y-2">
              {timelines.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => set('timeline', band.value)}
                  aria-pressed={values.timeline === band.value}
                  className={`flex min-h-14 w-full items-center justify-between gap-4 border-b px-1 text-left transition-colors ${
                    values.timeline === band.value ? 'border-ink' : 'border-line hover:border-ink-3'
                  }`}
                >
                  <span className="text-sm">{band.value}</span>
                  <span className="text-xs text-ink-3">{band.note}</span>
                </button>
              ))}
            </div>
            {errors.timeline && <p className="mt-2 text-sm text-ink">{errors.timeline}</p>}
          </fieldset>

          <Field label="Дополнительные пожелания" hint="необязательно" error={errors.extra}>
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.extra)}
              onChange={(e) => set('extra', e.target.value)}
            />
          </Field>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                checked={values.consent === true}
                onChange={(e) => set('consent', e.target.checked)}
                className="mt-1 size-4 shrink-0"
              />
              <span className="text-ink-2">{consentLabel}</span>
            </label>
            {errors.consent && <p className="mt-2 text-sm text-ink">{errors.consent}</p>}
          </div>
        </div>
      )}

      {/* Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Не заполняйте это поле
          <input
            tabIndex={-1}
            autoComplete="off"
            value={String(values.website)}
            onChange={(e) => set('website', e.target.value)}
          />
        </label>
      </div>

      {formError && (
        <p role="alert" className="mt-10 border-l-2 border-ink pl-4 text-sm leading-relaxed">
          {formError}
        </p>
      )}

      <div className="mt-14 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-12 items-center rounded-full border border-line-2 px-6 text-[0.8125rem] font-medium tracking-[0.04em] transition-colors hover:border-ink"
          >
            Назад
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-[0.8125rem] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-2"
          >
            Дальше
          </button>
        ) : (
          <button
            type="submit"
            disabled={sending}
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-[0.8125rem] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
          >
            {sending ? 'Отправляю…' : 'Отправить заявку'}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-4 flex items-baseline gap-3">
        {label}
        {hint && <span className="text-ink-3 normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-2 block text-sm text-ink">{error}</span>}
    </label>
  );
}
