'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  BriefData, STEPS, ANSWER_STEPS, LIMITS, emptyBrief,
  PROJECT_TYPES, NEEDS, FEATURES, BUDGETS, TIMELINES, SOURCES,
  ProjectType, Need, Feature, Budget, Timeline, Source,
} from '@/lib/brief/schema';
import { validateStep, validateAll, FieldErrors, ErrorKey } from '@/lib/brief/validate';
import { submitBrief, BriefSubmitResult } from '@/lib/brief/submit';
import OptionGrid from './OptionGrid';
import Field from './Field';
import BriefReview from './BriefReview';
import BriefSuccess from './BriefSuccess';

/*
 * The Project Brief.
 *
 * One question per screen, answers kept in a single BriefData object, and a
 * draft mirrored into sessionStorage so a refresh never costs the visitor
 * their work. Validation runs per step on Continue (and once more over
 * everything before submitting), so nobody is told about a mistake on a screen
 * they haven't reached yet.
 *
 * Submission goes through lib/brief/submit — the one boundary Phase 8 replaces.
 * Its three failure modes stay distinct here: fields to fix, backend not wired
 * up yet, and the network falling over.
 */

const DRAFT_KEY = 'aly-brief-v1';

type Draft = { data: BriefData; step: number; startedAt: string };
type SubmitState = 'idle' | 'sending';

/** Steps where typing is the point — focus the input, not the heading. */
const TEXT_FIRST = new Set(['about', 'problem', 'existing', 'contact']);

export default function BriefWizard() {
  const { t, lang } = useI18n();
  const b = t.brief;

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<BriefData>(emptyBrief);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [failure, setFailure] = useState<BriefSubmitResult | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  /* Set when the visitor jumped back from the review to fix one answer. */
  const [returnToReview, setReturnToReview] = useState(false);

  const startedAt = useRef<string>(new Date().toISOString());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hp = useRef('');

  const current = STEPS[step];
  const isReview = current.id === 'review';
  const reduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Draft: restore once, then mirror every change ───────────────────── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d?.data) {
          setData({ ...emptyBrief(), ...d.data });
          setStep(Math.min(Math.max(d.step ?? 0, 0), STEPS.length - 1));
          if (d.startedAt) startedAt.current = d.startedAt;
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
      const draft: Draft = { data, step, startedAt: startedAt.current };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore — the draft is a convenience, not a requirement */
    }
  }, [data, step, hydrated, reference]);

  /* ── Focus + announcement on every step change ─────────────────────────
   * Skipped on the very first render: arriving on the page should leave the
   * visitor at the top reading the intro, not yanked into the form. */
  const firstRender = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (firstRender.current) { firstRender.current = false; return; }
    if (TEXT_FIRST.has(current.id)) {
      const first = formRef.current?.querySelector<HTMLElement>('input:not([tabindex="-1"]), textarea');
      if (first) { first.focus(); return; }
    }
    headingRef.current?.focus();
  }, [step, hydrated, current.id]);

  const set = useCallback(<K extends keyof BriefData>(key: K, value: BriefData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const err = (key: keyof BriefData): string | undefined => {
    const k = errors[key] as ErrorKey | undefined;
    return k ? b.err[k] : undefined;
  };

  const goTo = (index: number, opts: { fromReview?: boolean } = {}) => {
    setFailure(null);
    setReturnToReview(!!opts.fromReview);
    setStep(Math.min(Math.max(index, 0), STEPS.length - 1));
  };

  const advance = () => {
    if (returnToReview) { setReturnToReview(false); setStep(STEPS.length - 1); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  /** Continue: validate this step only, then move on. */
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
  const pickAndAdvance = <K extends keyof BriefData>(key: K, value: BriefData[K]) => {
    set(key, value);
    if (key === 'projectType' && value === 'other') return; // needs the follow-up field
    window.setTimeout(advance, reduced ? 0 : 190);
  };

  const submit = async () => {
    const { errors: all, firstBadStep } = validateAll(data);
    if (Object.keys(all).length) {
      setErrors(all);
      setFailure({ status: 'invalid', fieldErrors: {} });
      if (firstBadStep >= 0) goTo(firstBadStep, { fromReview: true });
      return;
    }

    setSubmitState('sending');
    setFailure(null);
    const result = await submitBrief({
      data,
      meta: { locale: lang, startedAt: startedAt.current, completedAt: new Date().toISOString() },
      hp: hp.current,
    });
    setSubmitState('idle');

    if (result.status === 'ok') {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setReference(result.reference);
      return;
    }
    if (result.status === 'invalid') {
      // The server disagreed with us — trust it and map its fields back.
      const mapped: FieldErrors = {};
      Object.entries(result.fieldErrors).forEach(([k, v]) => {
        mapped[k as keyof BriefData] = v as ErrorKey;
      });
      setErrors(mapped);
      const { firstBadStep: bad } = validateAll(data);
      if (bad >= 0) goTo(bad, { fromReview: true });
    }
    setFailure(result);
  };

  /* Enter continues; inside a textarea it needs Cmd/Ctrl so newlines still work. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    const inTextarea = target.tagName === 'TEXTAREA';
    if (inTextarea && !(e.metaKey || e.ctrlKey)) return;
    if (target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (isReview) submit(); else next();
  };

  if (reference) return <BriefSuccess reference={reference} t={b} />;

  const progress = Math.round((Math.min(step, ANSWER_STEPS) / ANSWER_STEPS) * 100);
  const stepNo = String(step + 1).padStart(2, '0');

  /** True when an optional step has been left untouched — Continue reads "Skip". */
  const isEmptyStep = (): boolean =>
    current.fields.every((f) => {
      const v = data[f];
      return Array.isArray(v) ? v.length === 0 : !v;
    });

  const renderStep = () => {
    switch (current.id) {
      case 'type':
        return (
          <>
            <OptionGrid<ProjectType>
              name="projectType"
              label={b.q.type.t}
              options={PROJECT_TYPES.map((v) => ({ value: v, label: b.types[v] }))}
              value={data.projectType}
              onChange={(v) => pickAndAdvance('projectType', v as ProjectType)}
              columns={3}
              invalid={!!errors.projectType}
            />
            {errors.projectType && (
              <p role="alert" className="text-[12.5px] text-accent">{err('projectType')}</p>
            )}
            {data.projectType === 'other' && (
              <Field
                label={b.f.typeOtherL}
                placeholder={b.f.typeOtherP}
                value={data.projectTypeOther}
                onChange={(v) => set('projectTypeOther', v)}
                error={err('projectTypeOther')}
                maxLength={LIMITS.projectTypeOther}
                autoFocus
              />
            )}
          </>
        );

      case 'about':
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
            />
            <Field
              label={b.f.projectNameL}
              placeholder={b.f.projectNameP}
              value={data.projectName}
              onChange={(v) => set('projectName', v)}
              error={err('projectName')}
              optional={b.optional}
              maxLength={LIMITS.projectName}
              autoComplete="organization"
            />
          </>
        );

      case 'problem':
        return (
          <Field
            label={b.q.problem.t}
            placeholder={b.f.problemP}
            value={data.problem}
            onChange={(v) => set('problem', v)}
            error={err('problem')}
            optional={b.optional}
            multiline
            rows={5}
            maxLength={LIMITS.problem}
            counter
          />
        );

      case 'needs':
        return (
          <OptionGrid<Need>
            name="needs"
            label={b.q.needs.t}
            options={NEEDS.map((v) => ({ value: v, label: b.needs[v] }))}
            value={data.needs}
            onChange={(v) => set('needs', v as Need[])}
            multi
            invalid={!!errors.needs}
          />
        );

      case 'features':
        return (
          <>
            <OptionGrid<Feature>
              name="features"
              label={b.q.features.t}
              options={FEATURES.map((v) => ({ value: v, label: b.features[v] }))}
              value={data.features}
              onChange={(v) => set('features', v as Feature[])}
              multi
              columns={3}
              invalid={!!errors.features}
            />
            <Field
              label={b.f.featuresOtherL}
              placeholder={b.f.featuresOtherP}
              value={data.featuresOther}
              onChange={(v) => set('featuresOther', v)}
              error={err('featuresOther')}
              optional={b.optional}
              maxLength={LIMITS.featuresOther}
            />
          </>
        );

      case 'existing':
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
              label={b.f.referenceUrlsL}
              placeholder={b.f.referenceUrlsP}
              value={data.referenceUrls}
              onChange={(v) => set('referenceUrls', v)}
              error={err('referenceUrls')}
              optional={b.optional}
              multiline
              rows={3}
              maxLength={LIMITS.url}
            />
          </>
        );

      case 'budget':
        return (
          <>
            <OptionGrid<Budget>
              name="budget"
              label={b.q.budget.t}
              options={BUDGETS.map((v) => ({ value: v, label: b.budgets[v] }))}
              value={data.budget}
              onChange={(v) => pickAndAdvance('budget', v as Budget)}
              invalid={!!errors.budget}
            />
            {errors.budget && <p role="alert" className="text-[12.5px] text-accent">{err('budget')}</p>}
            <p className="text-[12.5px] text-muted leading-relaxed max-w-md">{b.budgetNote}</p>
          </>
        );

      case 'timeline':
        return (
          <>
            <OptionGrid<Timeline>
              name="timeline"
              label={b.q.timeline.t}
              options={TIMELINES.map((v) => ({ value: v, label: b.timelines[v] }))}
              value={data.timeline}
              onChange={(v) => pickAndAdvance('timeline', v as Timeline)}
              invalid={!!errors.timeline}
            />
            {errors.timeline && <p role="alert" className="text-[12.5px] text-accent">{err('timeline')}</p>}
          </>
        );

      case 'contact':
        return (
          <>
            <Field
              label={b.f.nameL}
              placeholder={b.f.nameP}
              value={data.name}
              onChange={(v) => set('name', v)}
              error={err('name')}
              maxLength={LIMITS.name.max}
              autoComplete="name"
            />
            <Field
              label={b.f.emailL}
              placeholder={b.f.emailP}
              value={data.email}
              onChange={(v) => set('email', v)}
              error={err('email')}
              type="email"
              inputMode="email"
              maxLength={LIMITS.email}
              autoComplete="email"
            />
            <Field
              label={b.f.messengerL}
              placeholder={b.f.messengerP}
              value={data.messenger}
              onChange={(v) => set('messenger', v)}
              error={err('messenger')}
              optional={b.optional}
              maxLength={LIMITS.messenger}
            />
            <div>
              <div className="label text-[10px] text-ink-2 mb-3">
                {b.f.sourceL} <span className="ml-2 text-muted normal-case tracking-normal">({b.optional})</span>
              </div>
              <OptionGrid<Source>
                name="source"
                label={b.f.sourceL}
                options={SOURCES.map((v) => ({ value: v, label: b.sources[v] }))}
                value={data.source}
                onChange={(v) => set('source', v as Source)}
                columns={3}
              />
            </div>
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
                className={`mt-0.5 shrink-0 w-[18px] h-[18px] rounded-[5px] border grid place-items-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60 ${
                  data.consent
                    ? 'border-accent bg-accent/90 text-[#16130F]'
                    : errors.consent ? 'border-accent/70' : 'border-line-2'
                }`}
              >
                {data.consent && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[13.5px] text-ink-2 leading-relaxed group-hover:text-ink transition-colors">
                {b.f.consentL}
              </span>
            </label>
            {errors.consent && (
              <p id="consent-err" role="alert" className="text-[12.5px] text-accent">{err('consent')}</p>
            )}
          </>
        );

      case 'review':
        return <BriefReview data={data} t={b} onEdit={(i) => goTo(i, { fromReview: true })} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Progress */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="label text-[10px] text-muted tabular-nums">
            {b.step} {step + 1} {b.of} {STEPS.length}
          </span>
          {current.optional && <span className="label text-[10px] text-muted">{b.optional}</span>}
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
            className="h-full w-full bg-accent origin-left transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${Math.max(progress, 4) / 100})` }}
          />
        </div>
      </div>

      {/* Screen-reader announcement of the current question */}
      <p aria-live="polite" className="sr-only">
        {b.step} {step + 1} {b.of} {STEPS.length}. {b.q[current.id].t}
      </p>

      <form
        ref={formRef}
        onSubmit={(e) => { e.preventDefault(); if (isReview) submit(); else next(); }}
        onKeyDown={onKeyDown}
        noValidate
      >
        {/* Honeypot — off-screen, never announced, never focusable */}
        <input
          type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
          className="absolute w-px h-px -left-[9999px] opacity-0"
          onChange={(e) => { hp.current = e.target.value; }}
        />

        <div key={step} className={reduced ? '' : 'brief-step'}>
          <div className="flex items-baseline gap-4 mb-4">
            <span className="label text-[10px] text-accent tabular-nums">{stepNo}</span>
            <span className="h-px flex-1 bg-line" aria-hidden />
          </div>

          <h2
            ref={headingRef}
            tabIndex={-1}
            data-brief-heading
            className="display text-ink text-[8vw] sm:text-4xl md:text-[2.6rem] leading-[1.06] mb-4 outline-none"
          >
            {b.q[current.id].t}
          </h2>
          {b.q[current.id].hint && (
            <p className="text-ink-2 text-[15px] md:text-base leading-relaxed mb-9 max-w-lg">
              {b.q[current.id].hint}
            </p>
          )}

          <div className="space-y-6">{renderStep()}</div>
        </div>

        {/* Failure — kept distinct from field-level validation */}
        {failure && failure.status !== 'ok' && (
          <div
            role="alert"
            className="mt-8 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/[0.07] px-4 py-3.5"
          >
            <AlertCircle size={17} className="text-accent shrink-0 mt-0.5" />
            <div className="text-[14px] text-ink-2 leading-relaxed">
              {failure.status === 'invalid' && b.fail.validation}
              {failure.status === 'unavailable' && b.fail.unavailable}
              {failure.status === 'error' && b.fail.network}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 md:mt-12 flex items-center gap-3 sticky bottom-0 -mx-6 px-6 py-4 md:static md:mx-0 md:px-0 md:py-0 bg-bg/85 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-t border-line md:border-0">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              data-hover
              className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-[14px] text-ink-2 hover:text-ink hover:border-line-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <ArrowLeft size={15} /> {b.back}
            </button>
          )}

          <button
            type="submit"
            disabled={submitState === 'sending'}
            data-hover
            className="btn btn-primary !rounded-xl flex-1 sm:flex-none !py-3.5 disabled:opacity-60"
          >
            {submitState === 'sending' ? (
              <><Loader2 size={16} className="animate-spin" /> {b.sending}</>
            ) : isReview ? (
              <>{b.submit} <ArrowRight size={15} /></>
            ) : (
              <>
                {returnToReview ? b.toReview : current.optional && isEmptyStep() ? b.skip : b.next}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
