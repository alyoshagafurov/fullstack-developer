/*
 * Client-side validation for the Project Brief.
 *
 * This is UX only: it exists to catch mistakes early and point at the field
 * that needs attention. The server re-validates everything independently in
 * app/api/brief/route.ts and never trusts what arrives — the two are kept
 * separate on purpose, so loosening a rule here can never loosen the boundary.
 *
 * Errors are returned as { field: errorKey }; the wizard resolves those keys
 * against the active language, so nothing here is user-facing text.
 */

import {
  BriefData, LIMITS, STEPS, StepId,
  PROJECT_TYPES, NEEDS, FEATURES, BUDGETS, TIMELINES, SOURCES,
} from './schema';

export type ErrorKey =
  | 'required' | 'pickOne' | 'email' | 'url' | 'tooShort' | 'tooLong' | 'consent';

export type FieldErrors = Partial<Record<keyof BriefData, ErrorKey>>;

/* Deliberately permissive: one @, a dot in the domain, no spaces. Anything
   stricter rejects valid addresses; the real proof is that mail arrives. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts "aly.lat", "https://aly.lat/x" — anything with a dotted host. */
function looksLikeUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  const withoutScheme = v.replace(/^https?:\/\//i, '');
  return /^[^\s/.]+\.[^\s/.]{2,}/.test(withoutScheme);
}

/** Reference fields may hold several links, one per line or comma separated. */
function eachLinkValid(value: string): boolean {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .every(looksLikeUrl);
}

function oneOf<T extends readonly string[]>(list: T, value: string): boolean {
  return (list as readonly string[]).includes(value);
}

/** Validates only the fields belonging to `stepId`. */
export function validateStep(stepId: StepId, d: BriefData): FieldErrors {
  const e: FieldErrors = {};

  switch (stepId) {
    case 'type': {
      if (!d.projectType || !oneOf(PROJECT_TYPES, d.projectType)) e.projectType = 'pickOne';
      else if (d.projectType === 'other') {
        const v = d.projectTypeOther.trim();
        if (!v) e.projectTypeOther = 'required';
        else if (v.length > LIMITS.projectTypeOther) e.projectTypeOther = 'tooLong';
      }
      break;
    }
    case 'about': {
      const desc = d.description.trim();
      if (!desc) e.description = 'required';
      else if (desc.length < LIMITS.description.min) e.description = 'tooShort';
      else if (desc.length > LIMITS.description.max) e.description = 'tooLong';
      if (d.projectName.trim().length > LIMITS.projectName) e.projectName = 'tooLong';
      break;
    }
    case 'problem': {
      if (d.problem.trim().length > LIMITS.problem) e.problem = 'tooLong';
      break;
    }
    case 'needs': {
      if (d.needs.some((n) => !oneOf(NEEDS, n))) e.needs = 'pickOne';
      break;
    }
    case 'features': {
      if (d.features.some((f) => !oneOf(FEATURES, f))) e.features = 'pickOne';
      if (d.featuresOther.trim().length > LIMITS.featuresOther) e.featuresOther = 'tooLong';
      break;
    }
    case 'existing': {
      if (d.existingUrl.trim().length > LIMITS.url) e.existingUrl = 'tooLong';
      else if (!looksLikeUrl(d.existingUrl)) e.existingUrl = 'url';
      if (d.referenceUrls.trim().length > LIMITS.url) e.referenceUrls = 'tooLong';
      else if (!eachLinkValid(d.referenceUrls)) e.referenceUrls = 'url';
      break;
    }
    case 'budget': {
      if (!d.budget || !oneOf(BUDGETS, d.budget)) e.budget = 'pickOne';
      break;
    }
    case 'timeline': {
      if (!d.timeline || !oneOf(TIMELINES, d.timeline)) e.timeline = 'pickOne';
      break;
    }
    case 'contact': {
      const name = d.name.trim();
      if (!name) e.name = 'required';
      else if (name.length < LIMITS.name.min) e.name = 'tooShort';
      else if (name.length > LIMITS.name.max) e.name = 'tooLong';

      const email = d.email.trim();
      if (!email) e.email = 'required';
      else if (email.length > LIMITS.email || !EMAIL.test(email)) e.email = 'email';

      if (d.messenger.trim().length > LIMITS.messenger) e.messenger = 'tooLong';
      if (d.source && !oneOf(SOURCES, d.source)) e.source = 'pickOne';
      if (d.notes.trim().length > LIMITS.notes) e.notes = 'tooLong';
      if (!d.consent) e.consent = 'consent';
      break;
    }
    case 'review':
      break;
  }

  return e;
}

/** Every step, in order — used before submitting and to mark the review list. */
export function validateAll(d: BriefData): { errors: FieldErrors; firstBadStep: number } {
  let errors: FieldErrors = {};
  let firstBadStep = -1;

  STEPS.forEach((step, i) => {
    const stepErrors = validateStep(step.id, d);
    if (Object.keys(stepErrors).length && firstBadStep === -1) firstBadStep = i;
    errors = { ...errors, ...stepErrors };
  });

  return { errors, firstBadStep };
}
