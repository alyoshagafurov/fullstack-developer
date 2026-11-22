'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BRIEF_SCREENS, contactMethods, projectTypes, type BriefCopy } from '@/lib/content/brief';
import { localePath, type Locale } from '@/lib/i18n';
import { useBrief } from '@/components/brief/useBrief';
import * as kit from '@/components/forms/kit';

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

function Problem({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className={kit.problem}>
      {text}
    </p>
  );
}

export function BriefForm({
  lang,
  copy,
  initialType,
}: {
  lang: Locale;
  copy: BriefCopy;
  /** A project type chosen before the form opened, e.g. a direction on the home page. */
  initialType?: string;
}) {
  const router = useRouter();
  const website = useRef<HTMLInputElement>(null);
  const answer = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const brief = useBrief({
    copy,
    serverWordsOk: lang === 'ru',
    draftKey: 'aly-brief-v2',
    initial: initialType ? { projectType: initialType } : undefined,
    onSent: () => router.push(localePath(lang, '/start/thanks')),
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
      data-form
      onSubmit={(event) => {
        event.preventDefault();
        brief.advance({}, website.current?.value ?? '');
      }}
      noValidate
      className="mx-auto flex min-h-[68svh] w-full max-w-2xl flex-col justify-center"
    >
      <kit.Steps at={step} of={BRIEF_SCREENS} />

      <div key={step} className="review-step mt-12 w-full text-center">
        <h2 className={kit.question}>{heading.question}</h2>
        <p className={`${kit.hint} mx-auto max-w-xl`}>{heading.hint}</p>

        <div className="mt-9 w-full text-left">
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
                className={kit.field}
              />
              <Problem text={errors.name} />
            </>
          )}

          {step === 1 && (
            <>
              <fieldset>
                <legend className="sr-only">{copy.contact.question}</legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {contactMethods.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={method === value}
                      onClick={() => set('contactMethod', value)}
                      className={kit.tile(method === value)}
                    >
                      {copy.methods[value].label}
                      <kit.Tick on={method === value} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.contactMethod} />

              {method && (
                <div className="review-step mt-5">
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
                    className={kit.field}
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
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {projectTypes.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={values.projectType === value}
                      onClick={() => set('projectType', value)}
                      className={kit.tile(values.projectType === value)}
                    >
                      {copy.options[value]?.label ?? value}
                      <kit.Tick on={values.projectType === value} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.projectType} />
            </>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="brief-details" className={kit.label}>
                  {copy.fields.details.label}
                </label>
                <textarea
                  id="brief-details"
                  ref={answer as React.RefObject<HTMLTextAreaElement>}
                  rows={4}
                  value={values.details}
                  onChange={(event) => set('details', event.target.value)}
                  placeholder={copy.fields.details.placeholder}
                  className={`${kit.fieldSmall} min-h-[8rem] resize-y`}
                />
                <Problem text={errors.details} />
              </div>

              <div>
                <label htmlFor="brief-questions" className={kit.label}>
                  {copy.fields.questions.label}
                  <span className={kit.optional}>{copy.optional}</span>
                </label>
                <textarea
                  id="brief-questions"
                  rows={2}
                  value={values.questions}
                  onChange={(event) => set('questions', event.target.value)}
                  placeholder={copy.fields.questions.placeholder}
                  className={`${kit.fieldSmall} resize-y`}
                />
                <Problem text={errors.questions} />
              </div>

              <div>
                <label htmlFor="brief-budget" className={kit.label}>
                  {copy.fields.budget.label}
                  <span className={kit.optional}>{copy.optional}</span>
                </label>
                <input
                  id="brief-budget"
                  value={values.budget}
                  onChange={(event) => set('budget', event.target.value)}
                  placeholder={copy.fields.budget.placeholder}
                  className={kit.fieldSmall}
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
        <p role="alert" className={`${kit.problem} text-center`}>
          {brief.formError}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <button type="submit" disabled={brief.sending} className={kit.primary}>
          {last ? (brief.sending ? copy.sending : copy.send) : copy.next}
        </button>

        {step > 0 && (
          <button type="button" onClick={brief.back} className={kit.back}>
            {copy.back}
          </button>
        )}
      </div>

      {last && <p className={`${kit.fine} mx-auto mt-6 max-w-md text-center`}>{copy.note}</p>}
    </form>
  );
}
