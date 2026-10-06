'use client';

import { useEffect, useRef, useState } from 'react';
import {
  genderLabel,
  genders,
  reviewQuestions,
  type Gender,
  type ReviewQuestionKey,
} from '@/lib/content/review';
import { box, chip, hint, MiniStage, primary, question, quiet } from '@/components/mini/MiniStage';
import {
  useBackButton,
  useClosingGuard,
  useHaptics,
  useMiniAppUser,
  useTelegram,
} from '@/components/mini/telegram';

/*
 * The review, inside Telegram.
 *
 * The five questions are the owner's, read from lib/content/review.ts, and the
 * third one carries the sentence he asked for: what you needed, and what was
 * built. A client looking at an empty box almost always stalls on "what do I
 * even say", and naming the two halves of the answer is what unsticks them.
 *
 * The name arrives filled in from the account that opened the window, so for
 * most people this is three taps and a paragraph.
 *
 * Nothing here publishes anything. A review lands unpublished and the owner
 * approves it in the admin, exactly as one left through the site does — the
 * Mini App is a second door into the same room, not a shortcut past the lock.
 */

const STEPS = reviewQuestions;

/** The three that open a keyboard. The other two are things you tap. */
const TYPED: ReviewQuestionKey[] = ['name', 'company', 'text'];

export function MiniReviewForm() {
  const { app, inside } = useTelegram();
  const telegramUser = useMiniAppUser();
  const haptics = useHaptics();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [gender, setGender] = useState<Gender | ''>('');

  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const startedAt = useRef(Date.now());
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const prefilled = useRef(false);

  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const isTyped = TYPED.includes(current.key);

  useEffect(() => {
    if (!telegramUser || prefilled.current) return;
    prefilled.current = true;
    const full = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ').trim();
    if (full) setName((v) => v || full);
  }, [telegramUser]);

  /*
   * Focus follows the question, so a client can type the moment the next one
   * appears — but only where there is typing to do. On the stars and the two
   * photographs an opening keyboard would cover the thing being chosen.
   */
  useEffect(() => {
    if (isTyped) answer.current?.focus({ preventScroll: true });
  }, [step, isTyped]);

  function back() {
    setError('');
    setStep((i) => Math.max(0, i - 1));
  }

  useBackButton(step > 0 && !done, back);
  useClosingGuard(!done && (text.trim().length > 0 || rating > 0));

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
      haptics.bad();
      setError(problem);
      return;
    }
    setError('');
    if (last) {
      void send();
      return;
    }
    haptics.tap();
    setStep((i) => i + 1);
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
          initData: app?.initData ?? '',
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        issues?: Record<string, string>;
      };

      if (!response.ok) {
        const first = payload.issues
          ? (Object.keys(payload.issues)[0] as ReviewQuestionKey | undefined)
          : undefined;
        const at = first ? STEPS.findIndex((s) => s.key === first) : -1;
        if (at >= 0 && payload.issues && first) {
          setStep(at);
          setError(payload.issues[first]);
        }
        haptics.bad();
        setFormError(payload.error ?? 'Не получилось отправить. Попробуйте ещё раз.');
        return;
      }

      haptics.ok();
      setDone(true);
    } catch {
      haptics.bad();
      setFormError('Интернет пропал. Проверьте связь и нажмите ещё раз.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <MiniStage
        eyebrow="Отзыв"
        total={STEPS.length}
        shape="points"
        footer={
          inside && app ? (
            <button type="button" onClick={() => app.close()} className={primary}>
              Закрыть
            </button>
          ) : null
        }
      >
        <div className="review-step text-center">
          <p role="status" className={question}>
            Спасибо! Отзыв появится на сайте после проверки.
          </p>
        </div>
      </MiniStage>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        advance();
      }}
      noValidate
    >
      <MiniStage
        eyebrow="Отзыв"
        step={step}
        total={STEPS.length}
        shape="points"
        footer={
          <>
            {formError && (
              <p role="alert" className="mb-4 text-sm text-paper/80">
                {formError}
              </p>
            )}
            <button type="submit" disabled={sending} className={primary}>
              {last ? (sending ? 'Отправляю…' : 'Отправить отзыв') : 'Дальше'}
              <span aria-hidden>→</span>
            </button>
            <div className="mt-2 flex items-center justify-center gap-4">
              {current.key === 'company' && (
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setError('');
                    setStep((i) => i + 1);
                  }}
                  className={quiet}
                >
                  Пропустить
                </button>
              )}
              {step > 0 && (
                <button type="button" onClick={back} className={quiet}>
                  Назад
                </button>
              )}
            </div>
          </>
        }
      >
        <div key={step} className="review-step">
          <label htmlFor={`mini-review-${current.key}`} className="block">
            <span className={question}>{current.question}</span>
            {current.hint && <span className={hint}>{current.hint}</span>}
          </label>

          <div className="mt-6">
            {current.key === 'name' && (
              <input
                id="mini-review-name"
                ref={answer as React.RefObject<HTMLInputElement>}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
                autoComplete="name"
                enterKeyHint="next"
                placeholder={current.placeholder}
                className={box}
              />
            )}

            {current.key === 'company' && (
              <input
                id="mini-review-company"
                ref={answer as React.RefObject<HTMLInputElement>}
                value={company}
                onChange={(event) => {
                  setCompany(event.target.value);
                  setError('');
                }}
                autoComplete="organization"
                enterKeyHint="next"
                placeholder={current.placeholder}
                className={box}
              />
            )}

            {current.key === 'text' && (
              <textarea
                id="mini-review-text"
                ref={answer as React.RefObject<HTMLTextAreaElement>}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError('');
                }}
                rows={5}
                placeholder={current.placeholder}
                /* Enter breaks a line here, so the shortcut moves on instead. */
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    advance();
                  }
                }}
                className={`${box} min-h-40 resize-y`}
              />
            )}

            {current.key === 'rating' && (
              <fieldset>
                <legend className="sr-only">Оценка от 1 до 5</legend>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} из 5`}
                      aria-pressed={rating === value}
                      onClick={() => {
                        haptics.tap();
                        setRating(value);
                        setError('');
                      }}
                      className={`size-13 text-[2.25rem] leading-none transition-colors ${
                        value <= rating ? 'text-paper' : 'text-white/25'
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
                <div className="flex flex-wrap justify-center gap-2.5">
                  {genders.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={gender === value}
                      onClick={() => {
                        haptics.tap();
                        setGender(value);
                        setError('');
                      }}
                      className={chip(gender === value)}
                    >
                      {genderLabel[value]}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-5 text-[0.9375rem]">
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
      </MiniStage>
    </form>
  );
}
