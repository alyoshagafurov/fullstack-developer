'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRIEF_SCREENS,
  briefCopyRu,
  budgetRanges,
  checkContact,
  contactMethods,
  priorities,
} from '@/lib/content/brief';
import { visibleText } from '@/lib/content/placeholders';
import { FORM_PLACEHOLDERS } from '@/lib/content/placeholders-forms';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { useBrief, type BriefSent } from '@/components/brief/useBrief';
import {
  box,
  Choice,
  hint,
  MiniStage,
  primary,
  problem,
  question,
  quiet,
  secondary,
} from '@/components/mini/MiniStage';
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
 * The same five screens the site asks — what they need, a few lines about it,
 * what matters most, a budget, then a name and where to reply — with the steps
 * and checks shared through useBrief and the words from lib/content/brief.ts.
 * What the Mini App adds is the signature: Telegram tells the server who
 * opened the window, so the lead is written already attached to a chat.
 *
 * What Telegram already knows arrives filled in on the last screen: the name
 * on the account, and Telegram with their @handle as the way to reach them.
 * Both stay editable.
 */

const copy = briefCopyRu;

/*
 * His face, cut from the street photo the site already uses: the picture is
 * tall, the circle is small, so it is drawn larger than the circle and moved
 * until the head sits in the middle. Numbers measured on the 1400×2489 file.
 */
function Portrait() {
  return (
    <span className="relative block size-28 overflow-hidden rounded-full bg-[#1c1c1e] ring-1 ring-white/15">
      <Image src="/me/avatar.webp" alt={site.name} width={480} height={480} sizes="112px" loading="eager" className="size-full object-cover" />
    </span>
  );
}

export function MiniBriefForm() {
  const { app, inside } = useTelegram();
  const telegramUser = useMiniAppUser();
  const haptics = useHaptics();
  const website = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState<BriefSent | null>(null);

  const brief = useBrief({
    copy,
    serverWordsOk: true,
    // v3: the screens changed order on 2026-11-24; a draft saved in the old order is dropped.
    draftKey: 'aly-mini-brief-v3',
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

  /*
   * Focus goes to a field the moment it appears, and only where there is
   * typing to do: over a row of choices an opening keyboard would cover them.
   * Each screen mounts after the previous one has slid away, so this happens
   * in the field's own ref rather than in an effect on `step`, which would
   * run while the old screen is still on stage.
   */
  const latest = useRef(values);
  useEffect(() => {
    latest.current = values;
  }, [values]);
  const pickedMethod = useRef(false);
  const contactField = useRef<HTMLInputElement | null>(null);
  const focusDetails = useCallback((el: HTMLTextAreaElement | null) => {
    el?.focus({ preventScroll: true });
  }, []);
  const focusName = useCallback((el: HTMLInputElement | null) => {
    if (el && !latest.current.name.trim()) el.focus({ preventScroll: true });
  }, []);
  const focusContact = useCallback((el: HTMLInputElement | null) => {
    contactField.current = el;
    if (!el) return;
    const v = latest.current;
    if (pickedMethod.current || (!v.contact.trim() && v.name.trim())) el.focus({ preventScroll: true });
    pickedMethod.current = false;
  }, []);

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
        footer={
          <>
            {/* The three before → after cases on the home page, not the whole archive. */}
            <button type="button" onClick={() => open(`${localePath('ru')}#work`)} className={secondary}>
              {copy.done.latest}
            </button>
            {inside && app && (
              <div className="mt-2 flex justify-center">
                <button type="button" onClick={() => app.close()} className={quiet}>
                  {copy.done.close}
                </button>
              </div>
            )}
          </>
        }
      >
        <div className="review-step flex flex-col items-center text-center">
          <Portrait />
          <div role="status" className="mt-8">
            <p className={question}>{copy.done.ready}</p>
            <p className={`${hint} mx-auto max-w-[19rem]`}>{copy.done.personal}</p>
          </div>
        </div>
      </MiniStage>
    );
  }

  const method = values.contactMethod as (typeof contactMethods)[number] | '';
  const phoneLike = method === 'WhatsApp' || method === 'Телефон';
  const heading = [copy.projectType, copy.details, copy.priority, copy.budget, copy.reply][step];
  /** The last screen has a way to reply and a contact that checks out: Enter may send. */
  const sendable = Boolean(method) && !checkContact(method, values.contact);
  const error = (text?: string) =>
    text ? (
      <p role="alert" className={problem}>
        {text}
      </p>
    ) : null;
  const fieldLabel = 'mb-2 flex items-baseline gap-2 text-[0.9375rem] font-medium text-white';
  const pick = (field: 'projectType' | 'priority' | 'budget' | 'contactMethod', value: string) => {
    haptics.tap();
    set(field, value);
  };

  // The work speaks first: one line, before the question, that he is building right now.
  // Left out on the live Mini App until the project is named.
  const lastProject = visibleText(FORM_PLACEHOLDERS.lastProject.ru);
  const strip = lastProject ? (
    <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[13px] leading-5 text-bone-3">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-white/50" />
      <span className="truncate">
        {copy.lastProject}: <span className="text-bone-2">{lastProject}</span>
      </span>
    </p>
  ) : null;

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
        strip={strip}
        footer={
          <>
            {brief.formError && (
              <p role="alert" className="mb-3 text-sm text-[#ff6961]">
                {brief.formError}
              </p>
            )}
            {/* The promise, once more, where they decide to send. */}
            {last && <p className="mb-2.5 text-center text-sm leading-snug text-bone-2">{copy.promise}</p>}
            <button type="submit" disabled={brief.sending} className={primary}>
              {last ? (brief.sending ? copy.sending : copy.send) : copy.next}
            </button>
            {step > 0 && (
              <div className="mt-1 flex justify-center">
                <button type="button" onClick={brief.back} className={quiet}>
                  {copy.back}
                </button>
              </div>
            )}
            {last && <p className="mt-2 text-center text-[0.6875rem] leading-snug text-bone-3">{copy.note}</p>}
          </>
        }
      >
        <div key={step} className="review-step">
          <h2 className={question}>{heading.question}</h2>
          <p className={hint}>{heading.hint}</p>

          <div className="mt-6">
            {step === 0 && (
              <>
                <fieldset>
                  <legend className="sr-only">{copy.projectType.question}</legend>
                  <div className="grid gap-2">
                    {brief.types.map((value) => (
                      <Choice
                        key={value}
                        selected={values.projectType === value}
                        label={copy.options[value]?.label ?? value}
                        onPick={() => pick('projectType', value)}
                      />
                    ))}
                  </div>
                </fieldset>
                {error(errors.projectType)}
              </>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="mini-details" className={fieldLabel}>
                    {copy.fields.details.label}
                    <span className="text-sm font-normal text-bone-3">{copy.optional}</span>
                  </label>
                  <textarea
                    id="mini-details"
                    ref={focusDetails}
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
                    <span className="text-sm font-normal text-bone-3">{copy.optional}</span>
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
              </div>
            )}

            {step === 2 && (
              <>
                <fieldset>
                  <legend className="sr-only">{copy.priority.question}</legend>
                  <div className="grid gap-2">
                    {priorities.map((value) => (
                      <Choice
                        key={value}
                        selected={values.priority === value}
                        label={copy.priorities[value].label}
                        note={copy.priorities[value].note}
                        onPick={() => pick('priority', value)}
                      />
                    ))}
                  </div>
                </fieldset>
                {error(errors.priority)}
              </>
            )}

            {step === 3 && (
              <>
                <fieldset>
                  <legend className="sr-only">{copy.budget.question}</legend>
                  <div className="grid gap-2">
                    {budgetRanges.map((value) => (
                      <Choice
                        key={value}
                        selected={values.budget === value}
                        label={copy.budgets[value].label}
                        onPick={() => pick('budget', value)}
                      />
                    ))}
                  </div>
                </fieldset>
                {error(errors.budget)}
              </>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="mini-name" className={fieldLabel}>
                    {copy.name.label}
                  </label>
                  <input
                    id="mini-name"
                    ref={focusName}
                    autoComplete="name"
                    // The name shares the screen with the contact: Enter sends only when that is done too.
                    enterKeyHint={sendable ? 'send' : 'next'}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' || event.nativeEvent.isComposing || sendable) return;
                      event.preventDefault();
                      if (method) contactField.current?.focus();
                      else event.currentTarget.blur();
                    }}
                    value={values.name}
                    onChange={(event) => set('name', event.target.value)}
                    placeholder={copy.name.placeholder}
                    className={box}
                  />
                  {error(errors.name)}
                </div>

                <fieldset>
                  <legend className={fieldLabel}>{copy.contact.label}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {contactMethods.map((value, i) => (
                      <Choice
                        key={value}
                        selected={method === value}
                        label={copy.methods[value].label}
                        onPick={() => {
                          pickedMethod.current = true;
                          pick('contactMethod', value);
                        }}
                        // Five in two columns: the odd one out takes the whole row.
                        className={i === contactMethods.length - 1 && contactMethods.length % 2 ? 'col-span-2' : ''}
                      />
                    ))}
                  </div>
                  {error(errors.contactMethod)}
                </fieldset>

                {method && (
                  <div className="review-step">
                    <label htmlFor="mini-contact" className="sr-only">
                      {copy.methods[method].label}
                    </label>
                    <input
                      // A new field per way of reaching them, so picking one puts the cursor in it.
                      key={method}
                      id="mini-contact"
                      ref={focusContact}
                      type={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'text'}
                      inputMode={method === 'Email' ? 'email' : phoneLike ? 'tel' : undefined}
                      autoComplete={method === 'Email' ? 'email' : phoneLike ? 'tel' : 'off'}
                      enterKeyHint="send"
                      value={values.contact}
                      onChange={(event) => set('contact', event.target.value)}
                      placeholder={copy.methods[method].placeholder}
                      className={box}
                    />
                    {error(errors.contact)}
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
      </MiniStage>
    </form>
  );
}
