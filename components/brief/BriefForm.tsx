'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BRIEF_SCREENS, contactMethods, projectTypes, type BriefCopy } from '@/lib/content/brief';
import { localePath, type Locale } from '@/lib/i18n';
import { useBrief } from '@/components/brief/useBrief';

/*
 * The request form — four short screens, one thing at a time.
 *
 * The owner cut it from thirteen questions to what he actually needs to start:
 * a name, where to reply, what they need, and a few lines about it. The steps
 * and checks live in useBrief so the Telegram Mini App asks exactly the same;
 * this file is only how it looks on the site.
 *
 * What is shown comes from the page's dictionary; what is sent stays the
 * canonical value from lib/content/brief.ts, so an English visitor's "Online
 * store" reaches the owner, the bot and the schema as «Интернет-магазин».
 */

/*
 * The answer box is a white surface on the band's pale grey rather than a
 * rectangle drawn in outline: it reads as somewhere to write before it is read
 * as anything else, which is the one thing it has to do.
 */
const box =
  'w-full rounded-2xl text-left border border-line-2 bg-paper px-6 py-5 text-[1.125rem] leading-relaxed tracking-[-0.01em] text-ink shadow-[0_1px_2px_rgba(11,11,11,0.04)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-ink focus:shadow-[0_0_0_5px_rgba(11,11,11,0.06)] md:px-8 md:py-6 md:text-[1.375rem]';

const smallBox =
  'w-full rounded-2xl text-left border border-line-2 bg-paper px-5 py-4 text-base leading-relaxed text-ink shadow-[0_1px_2px_rgba(11,11,11,0.04)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-ink focus:shadow-[0_0_0_5px_rgba(11,11,11,0.06)] md:px-6';

const primary =
  'inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-[0.9375rem] font-semibold tracking-[0.02em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40';

const chip = (on: boolean) =>
  `inline-flex min-h-12 items-center rounded-full border px-5 text-[0.9375rem] transition-colors ${
    on ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-paper text-ink-2 hover:border-ink hover:text-ink'
  }`;

const quietButton =
  'text-sm text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline';

function Problem({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="mt-4 text-base">
      {text}
    </p>
  );
}

export function BriefForm({ lang, copy }: { lang: Locale; copy: BriefCopy }) {
  const router = useRouter();
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const brief = useBrief({
    copy,
    serverWordsOk: lang === 'ru',
    draftKey: 'aly-brief-v2',
    onSent: ({ ref, code }) => {
      // The code is shown once, on the next page. Only the number and code go
      // in the address — nothing the visitor typed about themselves.
      router.push(
        `${localePath(lang, '/start/thanks')}?ref=${encodeURIComponent(ref)}&code=${encodeURIComponent(code)}`,
      );
    },
  });
  const { step, last, values, set, errors } = brief;

  /*
   * Focus follows the screen. `preventScroll` matters: without it the browser
   * scrolls the field into view, which on load throws the page past the
   * opening and mid-form slides the progress line up under the header.
   */
  useEffect(() => {
    answer.current?.focus({ preventScroll: true });
  }, [step, values.contactMethod]);

  const method = values.contactMethod as (typeof contactMethods)[number] | '';
  const phoneLike = method === 'WhatsApp' || method === 'Телефон';
  const heading =
    step === 0 ? copy.name : step === 1 ? copy.contact : step === 2 ? copy.projectType : copy.details;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        brief.advance({}, website.current?.value ?? '');
      }}
      noValidate
      className="flex min-h-[70svh] flex-col items-center justify-center text-center"
    >
      <div className="mb-12 flex w-full max-w-2xl items-center gap-5">
        <span className="tabular text-[0.6875rem] tracking-[0.18em] text-ink-3 uppercase">
          {step + 1} / {BRIEF_SCREENS}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line-2">
          <span
            className="block h-px bg-ink transition-[width] duration-500 ease-[var(--ease-studio)] motion-reduce:transition-none"
            style={{ width: `${((step + 1) / BRIEF_SCREENS) * 100}%` }}
          />
        </span>
      </div>

      <div key={step} className="review-step w-full">
        <h2 className="mx-auto block max-w-4xl text-[clamp(1.875rem,4.8vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance">
          {heading.question}
        </h2>
        <p className="mx-auto mt-3 block max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
          {heading.hint}
        </p>

        <div className="mx-auto mt-7 w-full max-w-2xl">
          {step === 0 && (
            <>
              <label htmlFor="brief-name" className="sr-only">
                {copy.name.question}
              </label>
              <input
                id="brief-name"
                ref={answer as React.RefObject<HTMLInputElement>}
                autoComplete="name"
                value={values.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder={copy.name.placeholder}
                className={box}
              />
              <Problem text={errors.name} />
            </>
          )}

          {step === 1 && (
            <>
              <fieldset>
                <legend className="sr-only">{copy.contact.question}</legend>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {contactMethods.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={method === value}
                      onClick={() => set('contactMethod', value)}
                      className={chip(method === value)}
                    >
                      {copy.methods[value].label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.contactMethod} />

              {method && (
                <div className="review-step mt-6">
                  <label htmlFor="brief-contact" className="sr-only">
                    {copy.methods[method].label}
                  </label>
                  <input
                    id="brief-contact"
                    ref={answer as React.RefObject<HTMLInputElement>}
                    type={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'text'}
                    inputMode={method === 'Email' ? 'email' : phoneLike ? 'tel' : undefined}
                    autoComplete={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'off'}
                    value={values.contact}
                    onChange={(event) => set('contact', event.target.value)}
                    placeholder={copy.methods[method].placeholder}
                    className={box}
                  />
                  <Problem text={errors.contact} />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <fieldset>
                <legend className="sr-only">{copy.projectType.question}</legend>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {projectTypes.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={values.projectType === value}
                      onClick={() => set('projectType', value)}
                      className={chip(values.projectType === value)}
                    >
                      {copy.options[value]?.label ?? value}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.projectType} />
            </>
          )}

          {step === 3 && (
            <div className="space-y-6 text-left">
              <div>
                <label htmlFor="brief-details" className="label mb-3 block">
                  {copy.fields.details.label}
                </label>
                <textarea
                  id="brief-details"
                  ref={answer as React.RefObject<HTMLTextAreaElement>}
                  rows={4}
                  value={values.details}
                  onChange={(event) => set('details', event.target.value)}
                  placeholder={copy.fields.details.placeholder}
                  className={`${smallBox} min-h-[8rem] resize-y`}
                />
                <Problem text={errors.details} />
              </div>

              <div>
                <label htmlFor="brief-questions" className="label mb-3 flex items-baseline gap-2">
                  {copy.fields.questions.label}
                  <span className="tracking-normal text-ink-3 normal-case">{copy.optional}</span>
                </label>
                <textarea
                  id="brief-questions"
                  rows={2}
                  value={values.questions}
                  onChange={(event) => set('questions', event.target.value)}
                  placeholder={copy.fields.questions.placeholder}
                  className={`${smallBox} resize-y`}
                />
                <Problem text={errors.questions} />
              </div>

              <div>
                <label htmlFor="brief-budget" className="label mb-3 flex items-baseline gap-2">
                  {copy.fields.budget.label}
                  <span className="tracking-normal text-ink-3 normal-case">{copy.optional}</span>
                </label>
                <input
                  id="brief-budget"
                  value={values.budget}
                  onChange={(event) => set('budget', event.target.value)}
                  placeholder={copy.fields.budget.placeholder}
                  className={smallBox}
                />
                <Problem text={errors.budget} />
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

      {brief.formError && (
        <p role="alert" className="mt-8 text-sm">
          {brief.formError}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
        <button type="submit" disabled={brief.sending} className={primary}>
          {last ? (brief.sending ? copy.sending : copy.send) : copy.next}
          <span aria-hidden>→</span>
        </button>

        {step > 0 && (
          <button type="button" onClick={brief.back} className={quietButton}>
            {copy.back}
          </button>
        )}
      </div>

      {last && <p className="mt-6 max-w-md text-xs leading-relaxed text-ink-3">{copy.note}</p>}
    </form>
  );
}
