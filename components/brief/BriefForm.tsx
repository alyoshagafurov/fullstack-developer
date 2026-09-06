'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { budgets, consentLabel, projectTypes, timelines } from '@/lib/content/brief';

/*
 * The brief — one question to a screen.
 *
 * It used to be four steps of three or four fields. Four fields at once still
 * reads as a form, and a form is the thing people close. Asked one at a time,
 * the same thirteen answers take the same two minutes and never look like work.
 *
 * The wording is untouched: every question and every hint below is the owner's
 * own, in his order, moved from the old layout as it stood. The optional ones
 * say so and can be skipped in a click.
 *
 * The draft is kept in sessionStorage so a reload does not cost the visitor
 * their typing; it never leaves the browser. The checks here are a courtesy —
 * the server re-validates the whole body with the same schema.
 */

type Values = Record<string, string | boolean>;
type Kind = 'text' | 'email' | 'area' | 'chips' | 'list';

type Question = {
  key: string;
  question: string;
  hint?: string;
  kind: Kind;
  placeholder?: string;
  rows?: number;
  optional?: boolean;
  /** Minimum length for a written answer, when a word or two is not enough. */
  min?: number;
  options?: readonly { value: string; note?: string }[];
};

const QUESTIONS: Question[] = [
  {
    key: 'name',
    question: 'Как вас зовут',
    hint: 'Просто имя, этого достаточно.',
    kind: 'text',
    placeholder: 'Алишер',
  },
  {
    key: 'company',
    question: 'Компания или проект',
    hint: 'Если названия ещё нет — пропустите.',
    kind: 'text',
    optional: true,
  },
  {
    key: 'email',
    question: 'Почта',
    hint: 'Сюда пришлю ответ и предложение.',
    kind: 'email',
    placeholder: 'name@mail.com',
  },
  {
    key: 'contact',
    question: 'Telegram или WhatsApp',
    hint: 'Так отвечаю быстрее всего.',
    kind: 'text',
    placeholder: '@username или +992 900 00 00 00',
  },
  {
    key: 'projectType',
    question: 'Что нужно сделать',
    hint: 'Выберите, что ближе. Не уверены — берите похожее, на созвоне разберёмся.',
    kind: 'chips',
    options: projectTypes.map((value) => ({ value })),
  },
  {
    key: 'goal',
    question: 'Что должно измениться после запуска',
    hint: 'Например: «хочу принимать заказы через сайт, а не в переписке» или «клиенты меня не находят в интернете».',
    kind: 'area',
    rows: 3,
  },
  {
    key: 'description',
    question: 'Расскажите о проекте',
    hint: 'Своими словами: чем занимаетесь, кто ваши клиенты, что уже есть. Двух-трёх предложений хватит.',
    kind: 'area',
    rows: 4,
    min: 10,
  },
  {
    key: 'audience',
    question: 'Кто будет этим пользоваться',
    hint: 'Кто ваши клиенты: чем занимаются, из какого города, сколько им лет.',
    kind: 'area',
    rows: 3,
    optional: true,
  },
  {
    key: 'features',
    question: 'Что должно уметь',
    hint: 'Например: корзина и оплата картой, личный кабинет, запись на приём, отправка заявки в Telegram.',
    kind: 'area',
    rows: 4,
    optional: true,
  },
  {
    key: 'links',
    question: 'Что вам нравится',
    hint: 'Ссылки на сайты, которые по душе. Можно просто названия.',
    kind: 'area',
    rows: 3,
    optional: true,
  },
  {
    key: 'budget',
    question: 'Примерный бюджет',
    hint: 'Это ориентир, а не обязательство. Не знаете — выберите последний пункт.',
    kind: 'list',
    options: budgets,
  },
  {
    key: 'timeline',
    question: 'Когда хотелось бы запуститься',
    hint: 'Тоже ориентир.',
    kind: 'list',
    options: timelines,
  },
  {
    key: 'extra',
    question: 'Что-нибудь ещё',
    hint: 'Всё, что не влезло в поля выше.',
    kind: 'area',
    rows: 3,
    optional: true,
  },
];

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

/*
 * The answer box is a white surface on the band's pale grey rather than a
 * rectangle drawn in outline: it reads as somewhere to write before it is read
 * as anything else, which is the one thing it has to do.
 */
const box =
  'w-full rounded-2xl border border-line-2 bg-paper px-6 py-5 text-[1.125rem] leading-relaxed tracking-[-0.01em] text-ink shadow-[0_1px_2px_rgba(11,11,11,0.04)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-ink focus:shadow-[0_0_0_5px_rgba(11,11,11,0.06)] md:px-8 md:py-6 md:text-[1.375rem]';

const primary =
  'inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-[0.9375rem] font-semibold tracking-[0.02em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40';

export function BriefForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);

  const startedAt = useRef<number>(Date.now());
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const current = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;
  const typed = current.kind !== 'chips' && current.kind !== 'list';

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

  /*
   * `preventScroll` matters: without it the browser scrolls the field into
   * view, which on load throws the page past the opening and mid-form slides
   * the progress line up under the header.
   */
  useEffect(() => {
    answer.current?.focus({ preventScroll: true });
  }, [step]);

  const set = (field: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [field]: value }));
    setError('');
  };

  /** The question's own rule, in the wording the old form used. */
  function check(): string {
    if (current.optional) return '';
    const value = String(values[current.key] ?? '').trim();
    if (!value) return 'Без этого не получится';
    if (current.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Кажется, в адресе опечатка';
    }
    if (current.min && value.length < current.min) {
      return 'Пары слов мало — хотя бы одно предложение';
    }
    return '';
  }

  function advance() {
    const problem = check();
    if (problem) {
      setError(problem);
      return;
    }
    if (last) {
      if (values.consent !== true) {
        setError('Поставьте галочку, иначе я не смогу вам ответить');
        return;
      }
      void send();
      return;
    }
    setError('');
    setStep((i) => i + 1);
  }

  function back() {
    setError('');
    setStep((i) => Math.max(0, i - 1));
  }

  async function send() {
    setSending(true);
    setFormError('');
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...values,
          website: website.current?.value ?? '',
          startedAt: startedAt.current,
        }),
      });
      const payload = (await response.json()) as {
        ref?: string;
        code?: string;
        error?: string;
        issues?: Record<string, string>;
      };

      if (!response.ok) {
        // A server complaint belongs on the question that caused it.
        const first = payload.issues ? Object.keys(payload.issues)[0] : undefined;
        const at = first ? QUESTIONS.findIndex((q) => q.key === first) : -1;
        if (at >= 0 && payload.issues && first) {
          setStep(at);
          setError(payload.issues[first]);
        }
        setFormError(payload.error ?? 'Не получилось отправить. Попробуйте ещё раз.');
        setSending(false);
        return;
      }

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      // The code is shown once, on the next page; the draft is gone with it.
      router.push(
        `/start/thanks?ref=${encodeURIComponent(payload.ref ?? '')}&code=${encodeURIComponent(payload.code ?? '')}`,
      );
    } catch {
      setFormError('Интернет пропал. Проверьте связь и нажмите ещё раз.');
      setSending(false);
    }
  }

  const value = String(values[current.key] ?? '');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        advance();
      }}
      noValidate
      className="flex min-h-[70svh] flex-col justify-center"
    >
      <div className="mb-12 flex items-center gap-5">
        <span className="tabular text-[0.6875rem] tracking-[0.18em] text-ink-3 uppercase">
          {step + 1} / {QUESTIONS.length}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line-2">
          <span
            className="block h-px bg-ink transition-[width] duration-500 ease-[var(--ease-studio)] motion-reduce:transition-none"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </span>
      </div>

      <div key={step} className="review-step">
        <label htmlFor={`brief-${current.key}`} className="block">
          <span className="block max-w-4xl text-[clamp(1.875rem,4.8vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance">
            {current.question}
          </span>
          {current.hint && (
            <span className="mt-3 block max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
              {current.hint}
            </span>
          )}
        </label>

        <div className="mt-7 max-w-2xl">
          {(current.kind === 'text' || current.kind === 'email') && (
            <input
              id={`brief-${current.key}`}
              ref={answer as React.RefObject<HTMLInputElement>}
              type={current.kind === 'email' ? 'email' : 'text'}
              inputMode={current.kind === 'email' ? 'email' : undefined}
              autoComplete={
                current.key === 'name' ? 'name' : current.key === 'email' ? 'email' : 'off'
              }
              value={value}
              onChange={(event) => set(current.key, event.target.value)}
              placeholder={current.placeholder}
              className={box}
            />
          )}

          {current.kind === 'area' && (
            <textarea
              id={`brief-${current.key}`}
              ref={answer as React.RefObject<HTMLTextAreaElement>}
              rows={current.rows ?? 3}
              value={value}
              onChange={(event) => set(current.key, event.target.value)}
              /* Enter breaks a line here, so the keyboard shortcut moves on. */
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  advance();
                }
              }}
              className={`${box} min-h-[9rem] resize-y`}
            />
          )}

          {current.kind === 'chips' && (
            <fieldset>
              <legend className="sr-only">{current.question}</legend>
              <div className="flex flex-wrap gap-2.5">
                {current.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={value === option.value}
                    onClick={() => set(current.key, option.value)}
                    className={`inline-flex min-h-12 items-center rounded-full border px-5 text-[0.9375rem] transition-colors ${
                      value === option.value
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line-2 bg-paper text-ink-2 hover:border-ink hover:text-ink'
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {current.kind === 'list' && (
            <fieldset>
              <legend className="sr-only">{current.question}</legend>
              <div className="space-y-2">
                {current.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={value === option.value}
                    onClick={() => set(current.key, option.value)}
                    className={`flex min-h-13 w-full flex-wrap items-center justify-between gap-x-5 gap-y-0.5 rounded-xl border px-5 py-2.5 text-left transition-colors md:px-6 ${
                      value === option.value
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line-2 bg-paper hover:border-ink'
                    }`}
                  >
                    <span className="text-base font-medium">{option.value}</span>
                    {option.note && (
                      <span
                        className={`text-sm ${value === option.value ? 'text-paper/60' : 'text-ink-3'}`}
                      >
                        {option.note}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        {last && (
          <label className="mt-10 flex max-w-2xl cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0"
              checked={values.consent === true}
              onChange={(event) => set('consent', event.target.checked)}
            />
            <span className="text-ink-2">{consentLabel}</span>
          </label>
        )}

        {error && (
          <p role="alert" className="mt-6 border-l-2 border-ink pl-4 text-base">
            {error}
          </p>
        )}
      </div>

      {/* Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Не заполняйте это поле
          <input ref={website} name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formError && (
        <p role="alert" className="mt-8 border-l-2 border-ink pl-4 text-sm">
          {formError}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
        <button type="submit" disabled={sending} className={primary}>
          {last ? (sending ? 'Отправляю…' : 'Отправить заявку') : 'Дальше'}
          <span aria-hidden>→</span>
        </button>

        {current.optional && !last && (
          <button
            type="button"
            onClick={() => {
              setError('');
              setStep((i) => i + 1);
            }}
            className="text-sm text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Пропустить
          </button>
        )}

        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="text-sm text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Назад
          </button>
        )}
      </div>
    </form>
  );
}
