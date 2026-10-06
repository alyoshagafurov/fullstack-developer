'use client';

import { useEffect, useRef, useState } from 'react';
import { briefQuestions, consentLabel } from '@/lib/content/brief';
import {
  box,
  chip,
  hint,
  MiniStage,
  primary,
  question,
  quiet,
  row,
} from '@/components/mini/MiniStage';
import {
  useBackButton,
  useClosingGuard,
  useHaptics,
  useMiniAppUser,
  useTelegram,
} from '@/components/mini/telegram';

/*
 * The brief, inside Telegram.
 *
 * The same thirteen questions the site asks, in the owner's words, read from
 * lib/content/brief.ts — this file is only the chrome around them. What the
 * Mini App adds is the signature: Telegram tells the server who opened the
 * window, so the lead is written already attached to a chat and the client
 * never has to quote a reference number to ask how it is going.
 *
 * Two answers are already known, so they arrive filled in rather than asked
 * from nothing: the name on the account, and the handle as a way to reach them.
 * Both stay editable, because Telegram's idea of someone's name is often not
 * the one they would give a stranger.
 *
 * Consent is asked for and read off the checkbox. The in-bot dialogue sends
 * `consent: true` whatever the client did, which is the kind of shortcut that
 * turns a legal statement into a lie; this does not copy it.
 */

type Values = Record<string, string | boolean>;

const QUESTIONS = briefQuestions;
const DRAFT_KEY = 'aly-mini-brief';

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

type Sent = { ref: string; code: string };

export function MiniBriefForm() {
  const { app, inside } = useTelegram();
  const telegramUser = useMiniAppUser();
  const haptics = useHaptics();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);

  const startedAt = useRef(Date.now());
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  /** So a draft restored from the last visit is not overwritten by Telegram. */
  const prefilled = useRef(false);

  const current = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;
  const typed = current.kind === 'text' || current.kind === 'email' || current.kind === 'area';

  /* A reload inside Telegram should not cost someone their typing. */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        setValues({ ...EMPTY, ...(JSON.parse(raw) as Values) });
        prefilled.current = true;
      }
    } catch {
      // Blocked or full storage is not a reason to fail a form.
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
   * What Telegram already knows, filled in once and only into empty fields.
   *
   * `initDataUnsafe` is unsigned, which is exactly why it is used here and
   * nowhere else: the worst it can do is put the wrong name in a box the person
   * is looking at and can correct.
   */
  useEffect(() => {
    if (!telegramUser || prefilled.current) return;
    prefilled.current = true;

    const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ').trim();
    const handle = telegramUser.username ? `@${telegramUser.username}` : '';

    setValues((v) => ({ ...v, name: v.name || name, contact: v.contact || handle }));
  }, [telegramUser]);

  useEffect(() => {
    // Only where there is something to type: on a list of choices an opening
    // keyboard would cover the choices.
    if (typed) answer.current?.focus({ preventScroll: true });
  }, [step, typed]);

  function back() {
    setError('');
    setStep((i) => Math.max(0, i - 1));
  }

  useBackButton(step > 0 && !sent, back);
  useClosingGuard(!sent && Object.values(values).some((v) => v !== '' && v !== false));

  const set = (field: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [field]: value }));
    setError('');
  };

  /** The question's own rule, in the wording the site's form uses. */
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
      haptics.bad();
      setError(problem);
      return;
    }
    if (last) {
      if (values.consent !== true) {
        haptics.bad();
        setError('Поставьте галочку, иначе я не смогу вам ответить');
        return;
      }
      void send();
      return;
    }
    haptics.tap();
    setError('');
    setStep((i) => i + 1);
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
          // The raw signed string, exactly as Telegram handed it over.
          initData: app?.initData ?? '',
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
        haptics.bad();
        setFormError(payload.error ?? 'Не получилось отправить. Попробуйте ещё раз.');
        setSending(false);
        return;
      }

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      haptics.ok();
      setSent({ ref: payload.ref ?? '', code: payload.code ?? '' });
    } catch {
      haptics.bad();
      setFormError('Интернет пропал. Проверьте связь и нажмите ещё раз.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <MiniStage
        eyebrow="Заявка"
        total={QUESTIONS.length}
        shape="dodeca"
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
            Получил вашу заявку, скоро свяжусь с вами.
          </p>
          {sent.ref && (
            <dl className="mx-auto mt-8 max-w-sm space-y-3 text-left">
              <div className="rounded-2xl border border-white/20 px-5 py-4">
                <dt className="text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">
                  Номер заявки
                </dt>
                <dd className="tabular mt-1.5 text-lg font-semibold">{sent.ref}</dd>
              </div>
              {sent.code && (
                <div className="rounded-2xl border border-white/20 px-5 py-4">
                  <dt className="text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">
                    Код для проверки статуса
                  </dt>
                  <dd className="tabular mt-1.5 text-sm break-all">{sent.code}</dd>
                </div>
              )}
            </dl>
          )}
          <p className={hint}>
            {inside
              ? 'Номер и код я отправил вам в чат — окно можно спокойно закрывать.'
              : 'Сохраните номер и код: по ним можно спросить бота о статусе.'}
          </p>
        </div>
      </MiniStage>
    );
  }

  const value = String(values[current.key] ?? '');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        advance();
      }}
      noValidate
    >
      <MiniStage
        eyebrow="Заявка"
        step={step}
        total={QUESTIONS.length}
        shape="dodeca"
        footer={
          <>
            {formError && (
              <p role="alert" className="mb-4 text-sm text-paper/80">
                {formError}
              </p>
            )}
            <button type="submit" disabled={sending} className={primary}>
              {last ? (sending ? 'Отправляю…' : 'Отправить заявку') : 'Дальше'}
              <span aria-hidden>→</span>
            </button>
            <div className="mt-2 flex items-center justify-center gap-4">
              {current.optional && !last && (
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
          <label htmlFor={`mini-${current.key}`} className="block">
            <span className={question}>{current.question}</span>
            {current.hint && <span className={hint}>{current.hint}</span>}
          </label>

          <div className="mt-6">
            {(current.kind === 'text' || current.kind === 'email') && (
              <input
                id={`mini-${current.key}`}
                ref={answer as React.RefObject<HTMLInputElement>}
                type={current.kind === 'email' ? 'email' : 'text'}
                inputMode={current.kind === 'email' ? 'email' : undefined}
                enterKeyHint={last ? 'send' : 'next'}
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
                id={`mini-${current.key}`}
                ref={answer as React.RefObject<HTMLTextAreaElement>}
                rows={current.rows ?? 3}
                value={value}
                onChange={(event) => set(current.key, event.target.value)}
                placeholder={current.placeholder}
                /* Enter breaks a line here, so the shortcut moves on instead. */
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    advance();
                  }
                }}
                className={`${box} min-h-32 resize-y`}
              />
            )}

            {current.kind === 'chips' && (
              <fieldset>
                <legend className="sr-only">{current.question}</legend>
                <div className="flex flex-wrap gap-2">
                  {current.options?.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={value === option.value}
                      onClick={() => {
                        haptics.tap();
                        set(current.key, option.value);
                      }}
                      className={chip(value === option.value)}
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
                      onClick={() => {
                        haptics.tap();
                        set(current.key, option.value);
                      }}
                      className={row(value === option.value)}
                    >
                      <span className="text-[0.9375rem] font-medium">{option.value}</span>
                      {option.note && (
                        <span
                          className={`text-xs ${
                            value === option.value ? 'text-ink/60' : 'text-paper/45'
                          }`}
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
            <label className="mt-7 flex cursor-pointer items-start gap-3 text-left text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-white"
                checked={values.consent === true}
                onChange={(event) => set('consent', event.target.checked)}
              />
              <span className="text-paper/70">{consentLabel}</span>
            </label>
          )}

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
