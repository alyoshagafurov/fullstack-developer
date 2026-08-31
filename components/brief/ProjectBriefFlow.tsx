'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/ui/Shell';
import Action from '@/components/ui/Action';
import Logo from '@/components/ui/Logo';
import { Choice, Field } from './BriefControls';
import BriefSummary from './BriefSummary';
import { useI18n } from '@/lib/i18n';
import {
  ProjectBrief, STEPS, ANSWER_STEPS, LIMITS, emptyBrief,
  PROJECT_TYPES, BUDGETS, TIMELINES, ProjectType, Budget, Timeline,
} from '@/lib/brief/schema';
import { validateStep, validateAll, FieldErrors, ErrorKey } from '@/lib/brief/validate';
import { submitBrief, newSubmissionId, BriefSubmitResult } from '@/lib/brief/submit';

/*
 * Start a project.
 *
 * One question per screen, answers held in a single ProjectBrief object, and a
 * draft mirrored into sessionStorage so a refresh never costs the visitor
 * their work. Validation runs per step on Continue and once more over
 * everything before submitting, so nobody is told about a mistake on a screen
 * they have not reached.
 *
 * Submission goes through lib/brief/submit — the one boundary Phase 6
 * replaces. Its outcomes stay distinct here: fields to fix, a backend that is
 * not wired up yet, and the network failing. There is no client-side success
 * path: the confirmation only renders when the server returns a real
 * reference, so it can never claim a brief was saved when it was not.
 */

const DRAFT_KEY = 'aly-brief-v2';

type Draft = { data: ProjectBrief; step: number; startedAt: string; submissionId?: string };

/** Steps where typing is the point — focus the field, not the heading. */
const TEXT_FIRST = new Set(['goal', 'scope', 'references', 'contact']);

export default function ProjectBriefFlow() {
  const { t, lang } = useI18n();
  const b = t.brief;

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<ProjectBrief>(emptyBrief);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<BriefSubmitResult | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [returnToReview, setReturnToReview] = useState(false);

  const startedAt = useRef(new Date().toISOString());
  /* Stable for the life of this brief, including across a refresh — a retry
     must reuse it so the server treats it as the same submission. */
  const submissionId = useRef(newSubmissionId());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);
  const hp = useRef('');

  const current = STEPS[step];
  const isReview = current.id === 'review';
  const reduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Draft: restore once, then mirror ─────────────────────────────── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d?.data) {
          setData({ ...emptyBrief(), ...d.data });
          setStep(Math.min(Math.max(d.step ?? 0, 0), STEPS.length - 1));
          if (d.startedAt) startedAt.current = d.startedAt;
          if (d.submissionId) submissionId.current = d.submissionId;
        }
      }
    } catch {
      /* private mode, quota, corrupt JSON — start fresh, never crash */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || reference) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        data, step, startedAt: startedAt.current, submissionId: submissionId.current,
      }));
    } catch {
      /* the draft is a convenience, not a requirement */
    }
  }, [data, step, hydrated, reference]);

  /* ── Focus on step change (never on first paint) ──────────────────── */
  useEffect(() => {
    if (!hydrated) return;
    if (firstRender.current) { firstRender.current = false; return; }
    if (TEXT_FIRST.has(current.id)) {
      const first = formRef.current?.querySelector<HTMLElement>('input:not([tabindex="-1"]), textarea');
      if (first) { first.focus(); return; }
    }
    headingRef.current?.focus();
  }, [step, hydrated, current.id]);

  const set = useCallback(<K extends keyof ProjectBrief>(key: K, value: ProjectBrief[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const err = (key: keyof ProjectBrief): string | undefined => {
    const k = errors[key] as ErrorKey | undefined;
    return k ? b.err[k] : undefined;
  };

  const goTo = (index: number, opts: { fromReview?: boolean } = {}) => {
    setOutcome(null);
    setReturnToReview(!!opts.fromReview);
    setStep(Math.min(Math.max(index, 0), STEPS.length - 1));
  };

  const advance = () => {
    if (returnToReview) { setReturnToReview(false); setStep(STEPS.length - 1); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const next = () => {
    const stepErrors = validateStep(current.id, data);
    if (Object.keys(stepErrors).length) {
      setErrors((e) => ({ ...e, ...stepErrors }));
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    setErrors({});
    advance();
  };

  /** Single-choice steps move on by themselves — that is most of the speed. */
  const pickAndAdvance = <K extends keyof ProjectBrief>(key: K, value: ProjectBrief[K]) => {
    set(key, value);
    if (key === 'projectType' && value === 'other') return; // needs the follow-up field
    window.setTimeout(advance, reduced ? 0 : 200);
  };

  const submit = async () => {
    if (sending) return; // guards a double press
    const { errors: all, firstBadStep } = validateAll(data);
    if (Object.keys(all).length) {
      setErrors(all);
      setOutcome({ status: 'invalid', fieldErrors: {} });
      if (firstBadStep >= 0) goTo(firstBadStep, { fromReview: true });
      return;
    }

    setSending(true);
    setOutcome(null);
    const result = await submitBrief({
      data,
      submissionId: submissionId.current,
      meta: { locale: lang, startedAt: startedAt.current, completedAt: new Date().toISOString() },
      hp: hp.current,
    });
    setSending(false);

    if (result.status === 'ok') {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setReference(result.reference);
      return;
    }
    if (result.status === 'invalid') {
      const mapped: FieldErrors = {};
      Object.entries(result.fieldErrors).forEach(([k, v]) => {
        mapped[k as keyof ProjectBrief] = v as ErrorKey;
      });
      setErrors(mapped);
      const { firstBadStep: bad } = validateAll(data);
      if (bad >= 0) goTo(bad, { fromReview: true });
    }
    setOutcome(result);
  };

  /* Enter continues; inside a textarea it needs Cmd/Ctrl so newlines work. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' && !(e.metaKey || e.ctrlKey)) return;
    if (target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (isReview) submit(); else next();
  };

  /* ── Confirmation — only reachable with a server-issued reference ──── */
  if (reference) {
    return (
      <Shell className="py-rhythm-l">
        <div className="max-w-2xl">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-signal">
            {b.ok.refLabel}
          </span>
          <p className="font-mono text-lead text-ink tracking-[0.08em] mt-3">{reference}</p>
          <h1 className="display text-d-l text-ink mt-10 mb-6">{b.ok.title}</h1>
          <p className="text-lead text-ink-2 max-w-md mb-14">{b.ok.lead}</p>

          <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-3 mb-6">
            {b.ok.whatNext}
          </p>
          <ol className="border-t border-line mb-14">
            {[b.ok.n1, b.ok.n2, b.ok.n3].map((s, i) => (
              <li key={s} className="flex gap-5 border-b border-line py-4">
                <span className="font-mono text-[0.625rem] text-ink-3 pt-1">0{i + 1}</span>
                <span className="text-body text-ink-2">{s}</span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-3">
            <Action href="/" variant="solid">{b.ok.home}</Action>
            <Action href="/#work" variant="ghost">{b.ok.work}</Action>
          </div>
        </div>
      </Shell>
    );
  }

  const progress = Math.round((Math.min(step, ANSWER_STEPS) / ANSWER_STEPS) * 100);
  const isEmptyStep = current.fields.every((f) => !data[f]);

  const renderStep = () => {
    switch (current.id) {
      case 'project':
        return (
          <>
            <Choice<ProjectType>
              legend={b.q.project.t}
              options={PROJECT_TYPES.map((v) => ({ value: v, label: b.types[v] }))}
              value={data.projectType}
              onChange={(v) => pickAndAdvance('projectType', v)}
              error={err('projectType')}
            />
            {data.projectType === 'other' && (
              <Field
                label={b.f.typeOtherL}
                placeholder={b.f.typeOtherP}
                value={data.projectTypeOther}
                onChange={(v) => set('projectTypeOther', v)}
                error={err('projectTypeOther')}
                maxLength={LIMITS.projectTypeOther}
                required
              />
            )}
          </>
        );

      case 'goal':
        return (
          <Field
            label={b.q.goal.t}
            placeholder={b.f.goalP}
            value={data.goal}
            onChange={(v) => set('goal', v)}
            error={err('goal')}
            multiline
            rows={6}
            maxLength={LIMITS.goal.max}
            counter
            required
          />
        );

      case 'scope':
        return (
          <>
            <Field
              label={b.f.descriptionL}
              placeholder={b.f.descriptionP}
              value={data.description}
              onChange={(v) => set('description', v)}
              error={err('description')}
              multiline
              rows={5}
              maxLength={LIMITS.description.max}
              counter
              required
            />
            <Field
              label={b.f.functionalityL}
              placeholder={b.f.functionalityP}
              value={data.functionality}
              onChange={(v) => set('functionality', v)}
              error={err('functionality')}
              optional={b.optional}
              multiline
              rows={4}
              maxLength={LIMITS.functionality}
            />
          </>
        );

      case 'references':
        return (
          <>
            <Field
              label={b.f.existingUrlL}
              placeholder={b.f.existingUrlP}
              value={data.existingUrl}
              onChange={(v) => set('existingUrl', v)}
              error={err('existingUrl')}
              optional={b.optional}
              inputMode="url"
              maxLength={LIMITS.url}
            />
            <Field
              label={b.f.referenceLinksL}
              placeholder={b.f.referenceLinksP}
              value={data.referenceLinks}
              onChange={(v) => set('referenceLinks', v)}
              error={err('referenceLinks')}
              optional={b.optional}
              multiline
              rows={3}
              maxLength={LIMITS.links}
            />
            <Field
              label={b.f.notesL}
              placeholder={b.f.notesP}
              value={data.notes}
              onChange={(v) => set('notes', v)}
              error={err('notes')}
              optional={b.optional}
              multiline
              rows={3}
              maxLength={LIMITS.notes}
            />
          </>
        );

      case 'budget':
        return (
          <>
            <Choice<Budget>
              legend={b.q.budget.t}
              options={BUDGETS.map((v) => ({ value: v, label: b.budgets[v] }))}
              value={data.budget}
              onChange={(v) => pickAndAdvance('budget', v)}
              error={err('budget')}
            />
            <p className="text-micro text-ink-3 max-w-md">{b.budgetNote}</p>
          </>
        );

      case 'timeline':
        return (
          <>
            <Choice<Timeline>
              legend={b.q.timeline.t}
              options={TIMELINES.map((v) => ({ value: v, label: b.timelines[v] }))}
              value={data.timeline}
              onChange={(v) => pickAndAdvance('timeline', v)}
              error={err('timeline')}
            />
            <p className="text-micro text-ink-3 max-w-md">{b.timelineNote}</p>
          </>
        );

      case 'contact':
        return (
          <>
            <Field
              label={b.f.nameL} placeholder={b.f.nameP} value={data.name}
              onChange={(v) => set('name', v)} error={err('name')}
              maxLength={LIMITS.name.max} autoComplete="name" required
            />
            <Field
              label={b.f.emailL} placeholder={b.f.emailP} value={data.email}
              onChange={(v) => set('email', v)} error={err('email')}
              type="email" inputMode="email" maxLength={LIMITS.email}
              autoComplete="email" required
            />
            <Field
              label={b.f.companyL} placeholder={b.f.companyP} value={data.company}
              onChange={(v) => set('company', v)} error={err('company')}
              optional={b.optional} maxLength={LIMITS.company} autoComplete="organization"
            />
            <div className="grid sm:grid-cols-2 gap-8">
              <Field
                label={b.f.telegramL} placeholder={b.f.telegramP} value={data.telegram}
                onChange={(v) => set('telegram', v)} error={err('telegram')}
                optional={b.optional} maxLength={LIMITS.handle}
              />
              <Field
                label={b.f.whatsappL} placeholder={b.f.whatsappP} value={data.whatsapp}
                onChange={(v) => set('whatsapp', v)} error={err('whatsapp')}
                optional={b.optional} inputMode="tel" maxLength={LIMITS.handle}
              />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={data.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  aria-invalid={!!errors.consent || undefined}
                  aria-describedby={errors.consent ? 'consent-err' : undefined}
                  className="sr-only peer"
                />
                <span
                  aria-hidden
                  className={`mt-0.5 shrink-0 w-[18px] h-[18px] border grid place-items-center
                              transition-colors peer-focus-visible:ring-1 peer-focus-visible:ring-signal
                              ${data.consent
                                ? 'border-signal bg-signal text-base'
                                : errors.consent ? 'border-signal' : 'border-line-2'}`}
                >
                  {data.consent && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-micro text-ink-2 group-hover:text-ink transition-colors">
                  {b.f.consentL}
                </span>
              </label>
              {errors.consent && (
                <p id="consent-err" role="alert" className="mt-2 text-micro text-signal">
                  {err('consent')}
                </p>
              )}
            </div>
          </>
        );

      case 'review':
        return <BriefSummary data={data} t={b} onEdit={(i) => goTo(i, { fromReview: true })} />;

      default:
        return null;
    }
  };

  return (
    <Shell className="py-rhythm-m">
      {/* masthead */}
      <div className="flex items-center gap-6 mb-14 md:mb-20">
        <Link href="/" aria-label="ALY" className="opacity-80 hover:opacity-100 transition-opacity">
          <Logo className="h-4 w-auto" />
        </Link>
        <span aria-hidden className="h-px flex-1 bg-line" />
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-3">
          {b.eyebrow}
        </span>
      </div>

      <div className="grid-12 gap-y-12">
        {/* progress rail */}
        <div className="col-span-12 lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-[0.625rem] text-signal tabular-nums">
                {String(step + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-3">
                {b.step} {step + 1} {b.of} {STEPS.length}
              </span>
            </div>
            <div
              className="h-px w-full bg-line overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label={`${b.step} ${step + 1} ${b.of} ${STEPS.length}`}
            >
              <div
                className="h-full w-full bg-signal origin-left transition-transform duration-500 ease-out"
                style={{ transform: `scaleX(${Math.max(progress, 4) / 100})` }}
              />
            </div>
            {current.optional && (
              <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-3">
                {b.optional}
              </p>
            )}
          </div>
        </div>

        {/* the question */}
        <div className="col-span-12 lg:col-span-8 lg:col-start-5">
          <p aria-live="polite" className="sr-only">
            {b.step} {step + 1} {b.of} {STEPS.length}. {b.q[current.id].t}
          </p>

          <form ref={formRef} onSubmit={(e) => { e.preventDefault(); if (isReview) submit(); else next(); }}
            onKeyDown={onKeyDown} noValidate>
            {/* honeypot — off-screen, never announced, never focusable */}
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
              className="absolute w-px h-px -left-[9999px] opacity-0"
              onChange={(e) => { hp.current = e.target.value; }} />

            <h1
              ref={headingRef}
              tabIndex={-1}
              data-brief-heading
              className="display text-d-m text-ink leading-[1.06] mb-4 outline-none max-w-[18ch]"
            >
              {b.q[current.id].t}
            </h1>
            {b.q[current.id].hint && (
              <p className="text-body text-ink-2 max-w-lg mb-12">{b.q[current.id].hint}</p>
            )}

            <div className="space-y-10">{renderStep()}</div>

            {/* outcome — the three failure modes stay distinct */}
            {outcome && outcome.status !== 'ok' && (
              <p role="alert" className="mt-10 border-l-2 border-signal pl-4 text-body text-ink-2">
                {outcome.status === 'invalid' && b.fail.validation}
                {outcome.status === 'unavailable' && b.fail.unavailable}
                {outcome.status === 'rateLimited' && b.fail.tooMany}
                {outcome.status === 'error' && b.fail.network}
              </p>
            )}

            {/* navigation */}
            <div className="mt-14 flex flex-wrap items-center gap-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-3
                             hover:text-ink transition-colors outline-none focus-visible:text-signal"
                >
                  ← {b.back}
                </button>
              )}
              <Action type="submit" variant="signal" disabled={sending}>
                {sending
                  ? b.sending
                  : isReview
                    ? b.submit
                    : returnToReview
                      ? b.toReview
                      : current.optional && isEmptyStep
                        ? b.skip
                        : b.next}
              </Action>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}
