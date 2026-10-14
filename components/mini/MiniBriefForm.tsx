'use client';

import { useEffect, useRef, useState } from 'react';
import { BRIEF_SCREENS, briefCopyRu, contactMethods, projectTypes } from '@/lib/content/brief';
import { useBrief, type BriefSent } from '@/components/brief/useBrief';
import { box, chip, hint, MiniStage, primary, question, quiet } from '@/components/mini/MiniStage';
import {
  useBackButton,
  useClosingGuard,
  useHaptics,
  useMiniAppUser,
  useTelegram,
} from '@/components/mini/telegram';

/*
 * The request form, inside Telegram.
 *
 * The same four screens the site asks — name, where to reply, what they need,
 * a few lines about it — with the steps and checks shared through useBrief and
 * the words from lib/content/brief.ts. What the Mini App adds is the
 * signature: Telegram tells the server who opened the window, so the lead is
 * written already attached to a chat.
 *
 * What Telegram already knows arrives filled in: the name on the account, and
 * Telegram with their @handle as the way to reach them. Both stay editable.
 */

const copy = briefCopyRu;

export function MiniBriefForm() {
  const { app, inside } = useTelegram();
  const telegramUser = useMiniAppUser();
  const haptics = useHaptics();
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [sent, setSent] = useState<BriefSent | null>(null);

  const brief = useBrief({
    copy,
    serverWordsOk: true,
    draftKey: 'aly-mini-brief-v2',
    onSent: (result) => {
      haptics.ok();
      setSent(result);
    },
  });
  const { step, last, values, set, errors } = brief;

  /*
   * `initDataUnsafe` is unsigned, which is exactly why it is used here and
   * nowhere else: the worst it can do is put the wrong name in a box the
   * person is looking at and can correct.
   */
  useEffect(() => {
    if (!telegramUser) return;
    const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ').trim();
    const handle = telegramUser.username ? `@${telegramUser.username}` : '';
    brief.prefill({
      name,
      ...(handle ? { contactMethod: 'Telegram', contact: handle } : {}),
    });
    // Once, when Telegram has told us who this is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramUser]);

  // Only where there is something to type: over a row of choices an opening
  // keyboard would cover the choices.
  useEffect(() => {
    if (step === 0 || step === 3 || (step === 1 && values.contactMethod)) {
      answer.current?.focus({ preventScroll: true });
    }
  }, [step, values.contactMethod]);

  useBackButton(step > 0 && !sent, brief.back);
  useClosingGuard(!sent && brief.dirty);

  /** Site pages open in Telegram's own browser, so the Mini App stays put. */
  const open = (path: string) => {
    const url = `${window.location.origin}${path}`;
    if (inside && app) app.openLink(url);
    else window.location.href = url;
  };

  if (sent) {
    return (
      <MiniStage
        eyebrow="Заявка"
        total={BRIEF_SCREENS}
        shape="dodeca"
        footer={
          <>
            <button type="button" onClick={() => open('/ru/prices')} className={primary}>
              {copy.done.prices}
              <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              onClick={() => open('/ru/work')}
              className="mt-2.5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-[0.9375rem] font-medium text-paper transition-colors hover:border-white"
            >
              {copy.done.work}
            </button>
          </>
        }
      >
        <div className="review-step text-center">
          <p role="status" className={question}>
            {copy.done.title}
          </p>
          <p className={`${hint} mx-auto max-w-sm`}>{copy.done.message}</p>

          {sent.ref && (
            <dl className="mx-auto mt-8 grid max-w-sm gap-2 text-left">
              <div className="rounded-2xl border border-white/15 px-5 py-3.5">
                <dt className="text-[0.625rem] tracking-[0.18em] text-paper/45 uppercase">
                  {copy.done.refLabel}
                </dt>
                <dd className="tabular mt-1 font-semibold">{sent.ref}</dd>
              </div>
              {sent.code && (
                <div className="rounded-2xl border border-white/15 px-5 py-3.5">
                  <dt className="text-[0.625rem] tracking-[0.18em] text-paper/45 uppercase">
                    {copy.done.codeLabel}
                  </dt>
                  <dd className="tabular mt-1 text-xs break-all text-paper/80">{sent.code}</dd>
                </div>
              )}
            </dl>
          )}
          {inside && <p className="mt-4 text-xs text-paper/45">{copy.done.trackChat}</p>}
        </div>
      </MiniStage>
    );
  }

  const method = values.contactMethod as (typeof contactMethods)[number] | '';
  const phoneLike = method === 'WhatsApp' || method === 'Телефон';
  const heading =
    step === 0 ? copy.name : step === 1 ? copy.contact : step === 2 ? copy.projectType : copy.details;
  const error = (text?: string) =>
    text ? (
      <p role="alert" className="mt-4 text-[0.9375rem]">
        {text}
      </p>
    ) : null;
  const fieldLabel = 'mb-2 flex items-baseline gap-2 text-[0.6875rem] tracking-[0.16em] text-paper/55 uppercase';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const moved = brief.advance({ initData: app?.initData ?? '' }, website.current?.value ?? '');
        if (moved) haptics.tap();
        else haptics.bad();
      }}
      noValidate
    >
      <MiniStage
        eyebrow="Заявка"
        step={step}
        total={BRIEF_SCREENS}
        shape="dodeca"
        footer={
          <>
            {brief.formError && (
              <p role="alert" className="mb-4 text-sm text-paper/80">
                {brief.formError}
              </p>
            )}
            <button type="submit" disabled={brief.sending} className={primary}>
              {last ? (brief.sending ? copy.sending : copy.send) : copy.next}
              <span aria-hidden>→</span>
            </button>
            {step > 0 && (
              <div className="mt-2 flex justify-center">
                <button type="button" onClick={brief.back} className={quiet}>
                  {copy.back}
                </button>
              </div>
            )}
            {last && <p className="mt-3 text-center text-[0.6875rem] text-paper/40">{copy.note}</p>}
          </>
        }
      >
        <div key={step} className="review-step">
          <h2 className={question}>{heading.question}</h2>
          <p className={hint}>{heading.hint}</p>

          <div className="mt-6">
            {step === 0 && (
              <>
                <label htmlFor="mini-name" className="sr-only">
                  {copy.name.question}
                </label>
                <input
                  id="mini-name"
                  ref={answer as React.RefObject<HTMLInputElement>}
                  autoComplete="name"
                  enterKeyHint="next"
                  value={values.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder={copy.name.placeholder}
                  className={box}
                />
                {error(errors.name)}
              </>
            )}

            {step === 1 && (
              <>
                <fieldset>
                  <legend className="sr-only">{copy.contact.question}</legend>
                  <div className="flex flex-wrap gap-2">
                    {contactMethods.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={method === value}
                        onClick={() => {
                          haptics.tap();
                          set('contactMethod', value);
                        }}
                        className={chip(method === value)}
                      >
                        {copy.methods[value].label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {error(errors.contactMethod)}
                {method && (
                  <div className="review-step mt-5">
                    <label htmlFor="mini-contact" className="sr-only">
                      {copy.methods[method].label}
                    </label>
                    <input
                      id="mini-contact"
                      ref={answer as React.RefObject<HTMLInputElement>}
                      type={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'text'}
                      inputMode={method === 'Email' ? 'email' : phoneLike ? 'tel' : undefined}
                      autoComplete={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'off'}
                      enterKeyHint="next"
                      value={values.contact}
                      onChange={(event) => set('contact', event.target.value)}
                      placeholder={copy.methods[method].placeholder}
                      className={box}
                    />
                    {error(errors.contact)}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <fieldset>
                  <legend className="sr-only">{copy.projectType.question}</legend>
                  <div className="flex flex-wrap gap-2">
                    {projectTypes.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={values.projectType === value}
                        onClick={() => {
                          haptics.tap();
                          set('projectType', value);
                        }}
                        className={chip(values.projectType === value)}
                      >
                        {copy.options[value]?.label ?? value}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {error(errors.projectType)}
              </>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="mini-details" className={fieldLabel}>
                    {copy.fields.details.label}
                  </label>
                  <textarea
                    id="mini-details"
                    ref={answer as React.RefObject<HTMLTextAreaElement>}
                    rows={4}
                    value={values.details}
                    onChange={(event) => set('details', event.target.value)}
                    placeholder={copy.fields.details.placeholder}
                    className={`${box} min-h-28 resize-y`}
                  />
                  {error(errors.details)}
                </div>
                <div>
                  <label htmlFor="mini-questions" className={fieldLabel}>
                    {copy.fields.questions.label}
                    <span className="tracking-normal normal-case">· {copy.optional}</span>
                  </label>
                  <textarea
                    id="mini-questions"
                    rows={2}
                    value={values.questions}
                    onChange={(event) => set('questions', event.target.value)}
                    placeholder={copy.fields.questions.placeholder}
                    className={`${box} resize-y`}
                  />
                  {error(errors.questions)}
                </div>
                <div>
                  <label htmlFor="mini-budget" className={fieldLabel}>
                    {copy.fields.budget.label}
                    <span className="tracking-normal normal-case">· {copy.optional}</span>
                  </label>
                  <input
                    id="mini-budget"
                    enterKeyHint="send"
                    value={values.budget}
                    onChange={(event) => set('budget', event.target.value)}
                    placeholder={copy.fields.budget.placeholder}
                    className={box}
                  />
                  {error(errors.budget)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden from people, irresistible to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            {copy.honeypot}
            <input ref={website} name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </MiniStage>
    </form>
  );
}
