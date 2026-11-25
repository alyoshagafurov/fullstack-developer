'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BRIEF_SCREENS,
  budgetRanges,
  checkContact,
  contactMethods,
  priorities,
  type BriefCopy,
} from '@/lib/content/brief';
import { visibleText } from '@/lib/content/placeholders';
import { FORM_PLACEHOLDERS } from '@/lib/content/placeholders-forms';
import { localePath, type Locale } from '@/lib/i18n';
import { useBrief } from '@/components/brief/useBrief';
import * as kit from '@/components/forms/kit';

/*
 * The request form — five short screens, one thing at a time: what they
 * need, a few lines about it (optional), what matters most, a budget, and
 * only then a name and where to reply. The steps and checks live in useBrief
 * so the Telegram Mini App asks exactly the same; this file is only how it
 * looks on the site.
 *
 * What is shown comes from the page's dictionary; what is sent stays the
 * canonical value from lib/content/brief.ts, so an English visitor's "Online
 * store" reaches the owner, the bot and the schema as «Интернет-магазин».
 *
 * Blue belongs to the one button that moves the request on. A picked tile
 * fills with ink instead of taking a blue outline, the progress is ink, a field
 * being typed in takes an ink edge, and «Назад» is a plain link.
 */

/* kit.fieldSmall, with an ink edge on focus instead of kit's blue one. */
const field =
  'w-full rounded-[12px] border border-transparent bg-wall-2 px-4 py-3.5 text-left text-base leading-relaxed text-bone outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-bone-3 focus:border-bone focus:bg-wall focus:shadow-[0_0_0_4px_rgb(0_0_0/0.06)] md:px-5';

/* A choice: ink fill and a tick when picked, a give under the finger when pressed. */
const tile = (on: boolean) =>
  `relative flex min-h-14 w-full items-center justify-between gap-3 rounded-[14px] border px-5 py-3.5 text-left text-[1.0625rem] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
    on ? 'border-bone bg-bone text-wall' : 'border-seam-2 bg-wall text-bone hover:border-bone-3 active:bg-wall-2'
  }`;

/* kit.optional and kit.fine are #86868b, 3.6:1 on white — too faint for 13–14px text; #6e6e73 holds 5:1. */
const optional = 'text-sm font-normal text-bone-2';
const fine = 'text-[0.8125rem] leading-relaxed text-bone-2';

const back =
  'min-h-11 px-2 text-[1.0625rem] text-bone-2 underline-offset-4 transition-colors hover:text-bone hover:underline';

function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-150 ${
        on ? 'bg-wall text-bone' : 'border border-seam-2 text-transparent'
      }`}
    >
      <svg
        viewBox="0 0 12 12"
        className={`size-3 transition-transform duration-200 ease-out motion-reduce:transition-none ${on ? 'scale-100' : 'scale-50'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 6.2 5 8.5l4.5-5" />
      </svg>
    </span>
  );
}

function Choice({
  selected,
  label,
  note,
  onPick,
  className = '',
}: {
  selected: boolean;
  label: string;
  note?: string;
  onPick: () => void;
  className?: string;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onPick} className={`${tile(selected)} ${className}`}>
      <span className="min-w-0">
        <span className="block">{label}</span>
        {note && (
          <span className={`mt-0.5 block text-[0.9375rem] font-normal ${selected ? 'text-wall/70' : 'text-bone-2'}`}>
            {note}
          </span>
        )}
      </span>
      <Tick on={selected} />
    </button>
  );
}

/* Where the visitor is: one short bar per screen, and the count in words. */
function Progress({ at, of, word }: { at: number; of: number; word: string }) {
  const text = `${at + 1} ${word} ${of}`;
  return (
    <div className="mx-auto flex w-full max-w-xs items-center gap-3">
      <div
        className="flex flex-1 gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={of}
        aria-valuenow={at + 1}
        aria-valuetext={text}
      >
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= at ? 'bg-bone' : 'bg-wall-3'}`} />
        ))}
      </div>
      <span aria-hidden className="shrink-0 text-sm tabular-nums text-bone-2">
        {text}
      </span>
    </div>
  );
}

function Problem({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className={kit.problem}>
      {text}
    </p>
  );
}

/** Five in two columns: the odd one out takes the whole row. */
const lastAlone = (i: number, count: number, cols = 'col-span-2') => (i === count - 1 && count % 2 ? cols : '');

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
  const detailsField = useRef<HTMLTextAreaElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const contactField = useRef<HTMLInputElement>(null);
  const pickedMethod = useRef(false);

  const brief = useBrief({
    copy,
    serverWordsOk: lang === 'ru',
    // v3: the screens changed order on 2026-11-24; a draft saved in the old order is dropped.
    draftKey: 'aly-brief-v3',
    initial: initialType ? { projectType: initialType } : undefined,
    onSent: () => router.push(localePath(lang, '/start/thanks')),
  });
  const { step, last, values, set, errors } = brief;

  /*
   * Focus follows the screen, only where there is typing to do. `preventScroll`
   * matters: without it the browser scrolls the field into view, which mid-form
   * slides the progress line up under the header.
   */
  useEffect(() => {
    const quietly = { preventScroll: true };
    if (step === 1) detailsField.current?.focus(quietly);
    if (step === 4) {
      if (!values.name.trim()) nameField.current?.focus(quietly);
      else if (values.contactMethod && !values.contact.trim()) contactField.current?.focus(quietly);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on arriving at a screen only
  }, [step]);

  // Picking where to reply puts the cursor where the contact goes.
  useEffect(() => {
    if (!pickedMethod.current) return;
    pickedMethod.current = false;
    contactField.current?.focus({ preventScroll: true });
  }, [values.contactMethod]);

  const method = values.contactMethod as (typeof contactMethods)[number] | '';
  const phoneLike = method === 'WhatsApp' || method === 'Телефон';
  const heading = [copy.projectType, copy.details, copy.priority, copy.budget, copy.reply][step];
  /** The last screen has a way to reply and a contact that checks out: Enter may send. */
  const sendable = Boolean(method) && !checkContact(method, values.contact);
  const lastProject = visibleText(FORM_PLACEHOLDERS.lastProject[lang]);

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
      <Progress at={step} of={BRIEF_SCREENS} word={copy.of} />

      {/* the work speaks first: one quiet line before the question — left out on the live site until the project is named */}
      {lastProject && (
        <p className="mx-auto mt-8 inline-flex max-w-full items-center gap-2 self-center rounded-full border border-seam px-3.5 py-1.5 text-[0.8125rem] leading-5 text-bone-2">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-bone-3" />
          <span className="truncate">
            {copy.lastProject}: <span className="text-bone">{lastProject}</span>
          </span>
        </p>
      )}

      <div key={step} className="review-step mt-8 w-full text-center md:mt-10">
        <h2 className={kit.question}>{heading.question}</h2>
        <p className={`${kit.hint} mx-auto max-w-xl`}>{heading.hint}</p>

        <div className="mt-9 w-full text-left">
          {step === 0 && (
            <>
              <fieldset>
                <legend className="sr-only">{copy.projectType.question}</legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {brief.types.map((value, i) => (
                    <Choice
                      key={value}
                      selected={values.projectType === value}
                      label={copy.options[value]?.label ?? value}
                      onPick={() => set('projectType', value)}
                      className={lastAlone(i, brief.types.length, 'sm:col-span-2')}
                    />
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.projectType} />
            </>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="brief-details" className={kit.label}>
                  {copy.fields.details.label}
                  <span className={optional}>{copy.optional}</span>
                </label>
                <textarea
                  id="brief-details"
                  ref={detailsField}
                  rows={4}
                  value={values.details}
                  onChange={(event) => set('details', event.target.value)}
                  placeholder={copy.fields.details.placeholder}
                  className={`${field} min-h-[8rem] resize-y`}
                />
                <Problem text={errors.details} />
              </div>

              <div>
                <label htmlFor="brief-questions" className={kit.label}>
                  {copy.fields.questions.label}
                  <span className={optional}>{copy.optional}</span>
                </label>
                <textarea
                  id="brief-questions"
                  rows={2}
                  value={values.questions}
                  onChange={(event) => set('questions', event.target.value)}
                  placeholder={copy.fields.questions.placeholder}
                  className={`${field} resize-y`}
                />
                <Problem text={errors.questions} />
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <fieldset>
                <legend className="sr-only">{copy.priority.question}</legend>
                <div className="grid gap-2.5">
                  {priorities.map((value) => (
                    <Choice
                      key={value}
                      selected={values.priority === value}
                      label={copy.priorities[value].label}
                      note={copy.priorities[value].note}
                      onPick={() => set('priority', value)}
                    />
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.priority} />
            </>
          )}

          {step === 3 && (
            <>
              <fieldset>
                <legend className="sr-only">{copy.budget.question}</legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {budgetRanges.map((value) => (
                    <Choice
                      key={value}
                      selected={values.budget === value}
                      label={copy.budgets[value].label}
                      onPick={() => set('budget', value)}
                    />
                  ))}
                </div>
              </fieldset>
              <Problem text={errors.budget} />
            </>
          )}

          {step === 4 && (
            <div className="space-y-7">
              <div>
                <label htmlFor="brief-name" className={kit.label}>
                  {copy.name.label}
                </label>
                <input
                  id="brief-name"
                  ref={nameField}
                  autoComplete="name"
                  enterKeyHint={sendable ? 'send' : 'next'}
                  onKeyDown={(event) => {
                    // Enter here moves on to the contact rather than sending a request not yet finished.
                    if (event.key !== 'Enter' || event.nativeEvent.isComposing || sendable) return;
                    event.preventDefault();
                    if (method) contactField.current?.focus();
                    else event.currentTarget.blur();
                  }}
                  value={values.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder={copy.name.placeholder}
                  className={field}
                />
                <Problem text={errors.name} />
              </div>

              <fieldset>
                <legend className={kit.label}>{copy.contact.label}</legend>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {contactMethods.map((value, i) => (
                    <Choice
                      key={value}
                      selected={method === value}
                      label={copy.methods[value].label}
                      onPick={() => {
                        pickedMethod.current = true;
                        set('contactMethod', value);
                      }}
                      className={lastAlone(i, contactMethods.length, 'col-span-2 sm:col-span-1')}
                    />
                  ))}
                </div>
                <Problem text={errors.contactMethod} />
              </fieldset>

              {method && (
                <div className="review-step">
                  <label htmlFor="brief-contact" className="sr-only">
                    {copy.methods[method].label}
                  </label>
                  <input
                    id="brief-contact"
                    ref={contactField}
                    type={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'text'}
                    inputMode={method === 'Email' ? 'email' : phoneLike ? 'tel' : undefined}
                    autoComplete={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'off'}
                    value={values.contact}
                    onChange={(event) => set('contact', event.target.value)}
                    placeholder={copy.methods[method].placeholder}
                    className={field}
                  />
                  <Problem text={errors.contact} />
                </div>
              )}
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

      {/* The promise, once more, where they decide to send. */}
      {last && (
        <p className="mx-auto mt-10 max-w-md text-center text-[0.9375rem] leading-snug text-bone-2">{copy.promise}</p>
      )}

      <div className={`${last ? 'mt-5' : 'mt-10'} flex flex-wrap items-center justify-center gap-x-8 gap-y-4`}>
        <button type="submit" disabled={brief.sending} className={kit.primary}>
          {last ? (brief.sending ? copy.sending : copy.send) : copy.next}
        </button>

        {step > 0 && (
          <button type="button" onClick={brief.back} className={back}>
            {copy.back}
          </button>
        )}
      </div>

      {last && <p className={`${fine} mx-auto mt-6 max-w-md text-center`}>{copy.note}</p>}
    </form>
  );
}
