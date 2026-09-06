'use client';

import { useEffect, useRef, useState } from 'react';
import { genderLabel, genders, type Gender } from '@/lib/content/review';

/*
 * The form a client fills in to leave a review — one question at a time.
 *
 * It used to be five fields on one screen. A client arriving from a message
 * saw a form and stopped. Asked one thing at a time, the same five answers
 * take the same minute but never look like work, which is the whole reason a
 * stranger finishes a form they were not obliged to start.
 *
 * The question is the label and it is set large and bold; the box under it is
 * drawn as a box, because a hairline under a blank line is a convention people
 * who fill in forms all day recognise and nobody else does.
 *
 * Validation is the schema's own wording, checked here per step so a mistake
 * is caught on the screen that caused it. The server checks all of it again.
 */

type Key = 'name' | 'company' | 'text' | 'rating' | 'gender';

const steps: { key: Key; question: string; hint?: string }[] = [
  { key: 'name', question: 'Как вас зовут?' },
  { key: 'company', question: 'Из какой вы компании?', hint: 'Можно пропустить' },
  { key: 'text', question: 'Расскажите, как прошла работа', hint: 'Хотя бы пару предложений' },
  { key: 'rating', question: 'Сколько звёзд поставите?' },
  { key: 'gender', question: 'Какое фото поставить рядом?', hint: 'Одно из двух постоянных' },
];

/*
 * The answer box is a white surface on the band's pale grey, not a rectangle
 * drawn in outline. Figure and ground do the work a border was doing badly:
 * it reads as somewhere to write before it is read as anything else, which is
 * the one thing this element has to do.
 */
const box =
  'w-full rounded-2xl border border-line-2 bg-paper px-6 py-5 text-[1.125rem] leading-relaxed tracking-[-0.01em] text-ink shadow-[0_1px_2px_rgba(11,11,11,0.04)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-ink focus:shadow-[0_0_0_5px_rgba(11,11,11,0.06)] md:px-8 md:py-6 md:text-[1.375rem]';

const primary =
  'inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-[0.9375rem] font-semibold tracking-[0.02em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40';

/* The shortcut is real, so it is worth a word rather than a discovery. */
const kbd =
  'rounded-md border border-line-2 bg-paper px-2 py-1 font-medium text-ink-2 shadow-[0_1px_0_var(--color-line-2)]';

export function ReviewForm() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [gender, setGender] = useState<Gender | ''>('');

  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const startedAt = useRef(Date.now());
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const current = steps[step];
  const last = step === steps.length - 1;
  // Only the written answers have a keyboard shortcut worth advertising.
  const typed = current.key === 'name' || current.key === 'company' || current.key === 'text';

  /*
   * Focus follows the question, so the visitor can type the moment the next one
   * appears. `preventScroll` matters: without it the browser scrolls the field
   * into view, which on load throws the page past the opening and mid-form
   * slides the progress line up under the header.
   */
  useEffect(() => {
    answer.current?.focus({ preventScroll: true });
  }, [step]);

  /** The step's own rule, in the schema's words. Empty string means it passed. */
  function check(): string {
    if (current.key === 'name') {
      const value = name.trim();
      if (value.length < 2) return 'Как вас зовут?';
      if (value.length > 80) return 'Слишком длинное имя';
    }
    if (current.key === 'company' && company.trim().length > 120) return 'Слишком длинно';
    if (current.key === 'text') {
      const value = text.trim();
      if (value.length < 20) return 'Расскажите чуть подробнее — хотя бы пару предложений';
      if (value.length > 1200) return 'Слишком длинно — до 1200 знаков';
    }
    if (current.key === 'rating' && rating < 1) return 'Поставьте оценку';
    if (current.key === 'gender' && !gender) return 'Выберите фото';
    return '';
  }

  function advance() {
    const problem = check();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    if (last) void send();
    else setStep((i) => i + 1);
  }

  function back() {
    setError('');
    setStep((i) => Math.max(0, i - 1));
  }

  async function send() {
    setSending(true);
    setFormError('');
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          text,
          rating,
          gender,
          website: website.current?.value ?? '',
          startedAt: startedAt.current,
        }),
      });
      const payload = (await response.json()) as { error?: string; issues?: Record<string, string> };
      if (!response.ok) {
        // A server complaint belongs on the question that caused it.
        const first = payload.issues ? (Object.keys(payload.issues)[0] as Key | undefined) : undefined;
        const at = first ? steps.findIndex((s) => s.key === first) : -1;
        if (at >= 0 && payload.issues) {
          setStep(at);
          setError(payload.issues[first as Key]);
        }
        setFormError(payload.error ?? 'Не получилось отправить. Попробуйте ещё раз.');
        return;
      }
      setDone(true);
    } catch {
      setFormError('Интернет пропал. Проверьте связь и нажмите ещё раз.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[70svh] flex-col justify-center">
        <p
          role="status"
          className="max-w-3xl text-[clamp(1.875rem,4.8vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance"
        >
          Спасибо! Отзыв появится на сайте после проверки.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        advance();
      }}
      noValidate
      className="flex min-h-[70svh] flex-col justify-center"
    >
      {/* Where the visitor is, and how much is left. Hairline, like everything. */}
      <div className="mb-12 flex items-center gap-5">
        <span className="tabular text-[0.6875rem] tracking-[0.18em] text-ink-3 uppercase">
          {step + 1} / {steps.length}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line-2">
          <span
            className="block h-px bg-ink transition-[width] duration-500 ease-[var(--ease-studio)] motion-reduce:transition-none"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </span>
      </div>

      <div key={step} className="review-step">
        <label htmlFor={`review-${current.key}`} className="block">
          <span className="block max-w-4xl text-[clamp(1.875rem,4.8vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance">
            {current.question}
          </span>
          {current.hint && (
            <span className="mt-4 block text-[1.0625rem] leading-relaxed text-ink-2">
              {current.hint}
            </span>
          )}
        </label>

        <div className="mt-8 max-w-2xl">
          {current.key === 'name' && (
            <input
              id="review-name"
              ref={answer as React.RefObject<HTMLInputElement>}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Имя"
              className={box}
            />
          )}

          {current.key === 'company' && (
            <input
              id="review-company"
              ref={answer as React.RefObject<HTMLInputElement>}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="organization"
              placeholder="Название компании"
              className={box}
            />
          )}

          {current.key === 'text' && (
            <textarea
              id="review-text"
              ref={answer as React.RefObject<HTMLTextAreaElement>}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              placeholder="Что было сделано и как вам работалось"
              /* Enter breaks a line here, so the keyboard shortcut moves on. */
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  advance();
                }
              }}
              className={`${box} min-h-[10rem] resize-y`}
            />
          )}

          {current.key === 'rating' && (
            <fieldset>
              <legend className="sr-only">Оценка от 1 до 5</legend>
              <div className="flex gap-3" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} из 5`}
                    aria-pressed={rating === value}
                    onMouseEnter={() => setHover(value)}
                    onClick={() => {
                      setRating(value);
                      setError('');
                    }}
                    className={`size-14 text-[2.5rem] leading-none transition-colors md:size-16 md:text-[3rem] ${
                      value <= (hover || rating) ? 'text-ink' : 'text-line-2'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {current.key === 'gender' && (
            <fieldset>
              <legend className="sr-only">Фото рядом с отзывом</legend>
              <div className="flex flex-wrap gap-3">
                {genders.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={gender === value}
                    onClick={() => {
                      setGender(value);
                      setError('');
                    }}
                    className={`inline-flex min-h-14 items-center rounded-full border px-8 text-base transition-colors ${
                      gender === value
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                    }`}
                  >
                    {genderLabel[value]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>

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
          {last ? (sending ? 'Отправляю…' : 'Отправить отзыв') : 'Дальше'}
          <span aria-hidden>→</span>
        </button>

        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="text-sm text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Назад
          </button>
        )}

        {typed && (
          <p className="hidden items-center gap-2 text-xs text-ink-3 md:flex">
            <kbd className={kbd}>{current.key === 'text' ? '⌘ + ↵' : '↵'}</kbd>
            дальше
          </p>
        )}

        {last && <p className="text-xs text-ink-3">Отзыв появится после проверки.</p>}
      </div>
    </form>
  );
}
