'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { budgets, consentLabel, projectTypes, timelines } from '@/lib/content/brief';

/*
 * The brief.
 *
 * Written for someone who is not a developer. Every field says what to put in
 * it and gives a real example, every step says why it is being asked, and the
 * optional ones say out loud that they can be skipped. The earlier version had
 * labels like "Главная цель" with nothing under them, which is fine if you have
 * filled in a brief before and a dead end if you have not.
 *
 * Four short steps rather than one long page: twelve fields at once is where
 * people close the tab. The draft is kept in sessionStorage so a reload does
 * not cost the visitor their typing; it never leaves the browser.
 *
 * The checks here are a courtesy. The server re-validates the whole body with
 * the same schema, so nothing depends on this file being honest.
 */

type Values = Record<string, string | boolean>;

const STEPS = [
  {
    id: 'about',
    title: 'О вас',
    why: 'Чтобы я знал, как к вам обращаться и куда прислать ответ.',
    required: ['name', 'email', 'contact'],
  },
  {
    id: 'project',
    title: 'Задача',
    why: 'Самая важная часть. Технические слова не нужны — расскажите обычными.',
    required: ['projectType', 'goal', 'description'],
  },
  {
    id: 'shape',
    title: 'Детали',
    why: 'Всё здесь можно пропустить. Заполните только то, на что ответ уже есть.',
    required: [] as string[],
  },
  {
    id: 'frame',
    title: 'Сроки и бюджет',
    why: 'Чтобы я сразу честно сказал, реально это или нет.',
    required: ['budget', 'timeline', 'consent'],
  },
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
  'w-full border-b border-line-2 bg-transparent pb-3 text-base outline-none transition-colors ' +
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

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    const required: readonly string[] = current.required;

    for (const field of required) {
      const value = values[field];
      if (field === 'consent') {
        if (value !== true) next[field] = 'Поставьте галочку, иначе я не смогу вам ответить';
      } else if (!String(value).trim()) {
        next[field] = 'Без этого не получится';
      }
    }

    if (required.includes('email') && String(values.email).trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))) {
        next.email = 'Кажется, в адресе опечатка';
      }
    }
    if (required.includes('description')) {
      const text = String(values.description).trim();
      if (text && text.length < 10) next.description = 'Пары слов мало — хотя бы одно предложение';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        setFormError(payload.error ?? 'Не получилось отправить. Попробуйте ещё раз.');
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
      setFormError('Интернет пропал. Проверьте связь и нажмите ещё раз.');
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl">
      {/* Where am I, how much is left, and why am I being asked this. */}
      <div className="mb-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-sm">
            <span className="font-semibold">
              Шаг {step + 1} из {STEPS.length}
            </span>
            <span className="ml-3 text-ink-3">{current.title}</span>
          </p>
          <p className="text-xs text-ink-3">Меньше двух минут</p>
        </div>

        <div className="flex gap-1.5">
          {STEPS.map((s, index) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                index <= step ? 'bg-ink' : 'bg-line'
              }`}
            />
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-2">{current.why}</p>
      </div>

      <h2 ref={heading} tabIndex={-1} className="sr-only">
        {current.title}
      </h2>

      {step === 0 && (
        <div className="space-y-10">
          <Field label="Как вас зовут" hint="Просто имя, этого достаточно." error={errors.name}>
            <input
              className={inputClass}
              value={String(values.name)}
              onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
              placeholder="Алишер"
            />
          </Field>

          <Field
            label="Компания или проект"
            optional
            hint="Если названия ещё нет — пропустите."
            error={errors.company}
          >
            <input
              className={inputClass}
              value={String(values.company)}
              onChange={(e) => set('company', e.target.value)}
              autoComplete="organization"
            />
          </Field>

          <Field label="Почта" hint="Сюда пришлю ответ и предложение." error={errors.email}>
            <input
              type="email"
              inputMode="email"
              className={inputClass}
              value={String(values.email)}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
              placeholder="name@mail.com"
            />
          </Field>

          <Field
            label="Telegram или WhatsApp"
            hint="Так отвечаю быстрее всего."
            error={errors.contact}
          >
            <input
              className={inputClass}
              value={String(values.contact)}
              onChange={(e) => set('contact', e.target.value)}
              placeholder="@username или +992 900 00 00 00"
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-10">
          <fieldset>
            <Legend
              label="Что нужно сделать"
              hint="Выберите, что ближе. Не уверены — берите похожее, на созвоне разберёмся."
            />
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
                      : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.projectType && <p className="mt-3 text-sm text-ink">{errors.projectType}</p>}
          </fieldset>

          <Field
            label="Что должно измениться после запуска"
            hint="Например: «хочу принимать заказы через сайт, а не в переписке» или «клиенты меня не находят в интернете»."
            error={errors.goal}
          >
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.goal)}
              onChange={(e) => set('goal', e.target.value)}
            />
          </Field>

          <Field
            label="Расскажите о проекте"
            hint="Своими словами: чем занимаетесь, кто ваши клиенты, что уже есть. Двух-трёх предложений хватит."
            error={errors.description}
          >
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
        <div className="space-y-10">
          <Field
            label="Кто будет этим пользоваться"
            optional
            hint="Кто ваши клиенты: чем занимаются, из какого города, сколько им лет."
            error={errors.audience}
          >
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.audience)}
              onChange={(e) => set('audience', e.target.value)}
            />
          </Field>

          <Field
            label="Что должно уметь"
            optional
            hint="Например: корзина и оплата картой, личный кабинет, запись на приём, отправка заявки в Telegram."
            error={errors.features}
          >
            <textarea
              rows={4}
              className={inputClass}
              value={String(values.features)}
              onChange={(e) => set('features', e.target.value)}
            />
          </Field>

          <Field
            label="Что вам нравится"
            optional
            hint="Ссылки на сайты, которые по душе. Можно просто названия."
            error={errors.links}
          >
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
        <div className="space-y-10">
          <fieldset>
            <Legend
              label="Примерный бюджет"
              hint="Это ориентир, а не обязательство. Не знаете — выберите последний пункт."
            />
            <div className="space-y-2">
              {budgets.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => set('budget', band.value)}
                  aria-pressed={values.budget === band.value}
                  className={`flex min-h-14 w-full items-center justify-between gap-4 border px-4 text-left transition-colors ${
                    values.budget === band.value
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line hover:border-ink'
                  }`}
                >
                  <span className="text-sm">{band.value}</span>
                  <span
                    className={`text-xs ${values.budget === band.value ? 'text-paper/60' : 'text-ink-3'}`}
                  >
                    {band.note}
                  </span>
                </button>
              ))}
            </div>
            {errors.budget && <p className="mt-3 text-sm text-ink">{errors.budget}</p>}
          </fieldset>

          <fieldset>
            <Legend label="Когда хотелось бы запуститься" hint="Тоже ориентир." />
            <div className="space-y-2">
              {timelines.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => set('timeline', band.value)}
                  aria-pressed={values.timeline === band.value}
                  className={`flex min-h-14 w-full items-center justify-between gap-4 border px-4 text-left transition-colors ${
                    values.timeline === band.value
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line hover:border-ink'
                  }`}
                >
                  <span className="text-sm">{band.value}</span>
                  <span
                    className={`text-xs ${values.timeline === band.value ? 'text-paper/60' : 'text-ink-3'}`}
                  >
                    {band.note}
                  </span>
                </button>
              ))}
            </div>
            {errors.timeline && <p className="mt-3 text-sm text-ink">{errors.timeline}</p>}
          </fieldset>

          <Field
            label="Что-нибудь ещё"
            optional
            hint="Всё, что не влезло в поля выше."
            error={errors.extra}
          >
            <textarea
              rows={3}
              className={inputClass}
              value={String(values.extra)}
              onChange={(e) => set('extra', e.target.value)}
            />
          </Field>

          <div className="border-t border-line pt-8">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                checked={values.consent === true}
                onChange={(e) => set('consent', e.target.checked)}
                className="mt-0.5 size-5 shrink-0"
              />
              <span className="text-ink-2">{consentLabel}</span>
            </label>
            {errors.consent && <p className="mt-3 text-sm text-ink">{errors.consent}</p>}
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

      <div className="mt-14 flex flex-wrap items-center gap-4">
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-14 items-center rounded-full border border-line-2 px-7 text-sm font-medium transition-colors hover:border-ink"
          >
            Назад
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-sm font-semibold text-paper transition-colors hover:bg-ink-2"
          >
            Дальше
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={sending}
            className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-sm font-semibold text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
          >
            {sending ? 'Отправляю…' : 'Отправить заявку'}
            {!sending && (
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

function Legend({ label, hint }: { label: string; hint?: string }) {
  return (
    <legend className="mb-5">
      <span className="block text-base font-semibold">{label}</span>
      {hint && <span className="mt-2 block text-sm leading-relaxed text-ink-3">{hint}</span>}
    </legend>
  );
}

function Field({
  label,
  hint,
  optional,
  error,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex flex-wrap items-baseline gap-x-3">
        <span className="text-base font-semibold">{label}</span>
        {optional && <span className="text-xs text-ink-3">можно пропустить</span>}
      </span>
      {hint && <span className="mb-5 block text-sm leading-relaxed text-ink-3">{hint}</span>}
      {children}
      {error && <span className="mt-3 block text-sm text-ink">{error}</span>}
    </label>
  );
}
