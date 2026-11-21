'use client';

import { useEffect, useRef, useState } from 'react';
import * as kit from '@/components/forms/kit';
import {
  genders,
  reviewQuestions,
  type Gender,
  type ReviewQuestionKey as Key,
} from '@/lib/content/review';
import { fill, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

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
 * The five questions live in lib/content/review.ts: the Telegram Mini App asks
 * the same five, and the owner's invitation — what you needed, what was built —
 * has to read identically wherever a client meets it.
 *
 * Validation is the schema's own rules, checked here per step so a mistake
 * is caught on the screen that caused it, and worded in the page's language.
 * The server checks all of it again.
 */

type ReviewCopy = Dictionary['reviewForm'];

const steps = reviewQuestions;

export function ReviewForm({ lang, copy }: { lang: Locale; copy: ReviewCopy }) {
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
  const words = copy.questions[current.key] ?? current;

  /*
   * Focus follows the question, so the visitor can type the moment the next one
   * appears. `preventScroll` matters: without it the browser scrolls the field
   * into view, which on load throws the page past the opening and mid-form
   * slides the progress line up under the header.
   */
  useEffect(() => {
    answer.current?.focus({ preventScroll: true });
  }, [step]);

  /** The step's own rule, in the schema's limits. Empty string means it passed. */
  function check(): string {
    const errors = copy.errors;
    if (current.key === 'name') {
      const value = name.trim();
      if (value.length < 2) return errors.nameShort;
      if (value.length > 80) return errors.nameLong;
    }
    if (current.key === 'company' && company.trim().length > 120) return errors.companyLong;
    if (current.key === 'text') {
      const value = text.trim();
      if (value.length < 20) return errors.textShort;
      if (value.length > 1200) return errors.textLong;
    }
    if (current.key === 'rating' && rating < 1) return errors.rating;
    if (current.key === 'gender' && !gender) return errors.gender;
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
        // A server complaint belongs on the question that caused it. The
        // server words it in Russian; another language says the generic thing.
        const russian = lang === 'ru';
        const first = payload.issues ? (Object.keys(payload.issues)[0] as Key | undefined) : undefined;
        const at = first ? steps.findIndex((s) => s.key === first) : -1;
        if (at >= 0 && payload.issues) {
          setStep(at);
          setError(russian ? payload.issues[first as Key] : copy.errors.check);
        }
        setFormError((russian && payload.error) || copy.errors.failed);
        return;
      }
      setDone(true);
    } catch {
      setFormError(copy.errors.offline);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[70svh] flex-col items-center justify-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-[#0071e3] text-white">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5 10 17l9-10" />
          </svg>
        </span>
        <p role="status" className={`${kit.question} mx-auto mt-8 max-w-3xl`}>
          {copy.done}
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
      className="mx-auto flex min-h-[68svh] w-full max-w-2xl flex-col justify-center text-center"
    >
      <kit.Steps at={step} of={steps.length} />

      <div key={step} className="review-step mt-12 w-full">
        <label htmlFor={`review-${current.key}`} className="block">
          <span className={`${kit.question} block`}>{words.question}</span>
          {words.hint && <span className={`${kit.hint} mx-auto block max-w-xl`}>{words.hint}</span>}
        </label>

        <div className="mt-9 w-full text-left">
          {current.key === 'name' && (
            <input
              id="review-name"
              ref={answer as React.RefObject<HTMLInputElement>}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder={words.placeholder ?? current.placeholder}
              className={kit.field}
            />
          )}

          {current.key === 'company' && (
            <input
              id="review-company"
              ref={answer as React.RefObject<HTMLInputElement>}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="organization"
              placeholder={words.placeholder ?? current.placeholder}
              className={kit.field}
            />
          )}

          {current.key === 'text' && (
            <textarea
              id="review-text"
              ref={answer as React.RefObject<HTMLTextAreaElement>}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              placeholder={words.placeholder ?? current.placeholder}
              /* Enter breaks a line here, so the keyboard shortcut moves on. */
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  advance();
                }
              }}
              className={`${kit.field} min-h-[10rem] resize-y`}
            />
          )}

          {current.key === 'rating' && (
            <fieldset>
              <legend className="sr-only">{copy.ratingLegend}</legend>
              <div className="flex justify-center gap-3" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={fill(copy.ratingOf, { n: value })}
                    aria-pressed={rating === value}
                    onMouseEnter={() => setHover(value)}
                    onClick={() => {
                      setRating(value);
                      setError('');
                    }}
                    className={`size-14 text-[2.5rem] leading-none transition-[color,transform] active:scale-90 md:size-16 md:text-[3rem] ${
                      value <= (hover || rating) ? 'text-[#ff9f0a]' : 'text-wall-3'
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
              <legend className="sr-only">{copy.photoLegend}</legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {genders.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={gender === value}
                    onClick={() => {
                      setGender(value);
                      setError('');
                    }}
                    className={kit.tile(gender === value)}
                  >
                    {copy.genders[value]}
                    <kit.Tick on={gender === value} />
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        {error && (
          <p role="alert" className={kit.problem}>
            {error}
          </p>
        )}
      </div>

      {/* Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {copy.honeypot}
          <input ref={website} name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formError && (
        <p role="alert" className={kit.problem}>
          {formError}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <button type="submit" disabled={sending} className={kit.primary}>
          {last ? (sending ? copy.sending : copy.send) : copy.next}
        </button>

        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className={kit.back}
          >
            {copy.back}
          </button>
        )}

        {last && <p className={`${kit.fine} w-full`}>{copy.afterCheck}</p>}
      </div>
    </form>
  );
}
