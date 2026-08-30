/*
 * Client-side validation for the Project Brief.
 *
 * This is UX only: it catches mistakes early and points at the field that
 * needs attention. The server re-validates everything independently in
 * app/api/brief/route.ts and never trusts what arrives — the two are separate
 * on purpose, so loosening a rule here can never loosen the boundary.
 *
 * Errors are returned as { field: errorKey }; the flow resolves those keys
 * against the active language, so no user-facing text lives here.
 */

import {
  ProjectBrief, LIMITS, STEPS, StepId,
  PROJECT_TYPES, BUDGETS, TIMELINES,
} from './schema';

export type ErrorKey =
  | 'required' | 'pickOne' | 'email' | 'url' | 'tooShort' | 'tooLong' | 'consent';

export type FieldErrors = Partial<Record<keyof ProjectBrief, ErrorKey>>;

/* Deliberately permissive: one @, a dotted domain, no spaces. Anything
   stricter rejects valid addresses; the real proof is that mail arrives. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts "aly.lat", "https://aly.lat/x" — anything with a dotted host. */
function looksLikeUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^[^\s/.]+\.[^\s/.]{2,}/.test(v.replace(/^https?:\/\//i, ''));
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
export function validateStep(stepId: StepId, d: ProjectBrief): FieldErrors {
  const e: FieldErrors = {};

  switch (stepId) {
    case 'project': {
      if (!d.projectType || !oneOf(PROJECT_TYPES, d.projectType)) e.projectType = 'pickOne';
      else if (d.projectType === 'other') {
        const v = d.projectTypeOther.trim();
        if (!v) e.projectTypeOther = 'required';
        else if (v.length > LIMITS.projectTypeOther) e.projectTypeOther = 'tooLong';
      }
      break;
    }
    case 'goal': {
      const v = d.goal.trim();
      if (!v) e.goal = 'required';
      else if (v.length < LIMITS.goal.min) e.goal = 'tooShort';
      else if (v.length > LIMITS.goal.max) e.goal = 'tooLong';
      break;
    }
    case 'scope': {
      const v = d.description.trim();
      if (!v) e.description = 'required';
      else if (v.length < LIMITS.description.min) e.description = 'tooShort';
      else if (v.length > LIMITS.description.max) e.description = 'tooLong';
      if (d.functionality.trim().length > LIMITS.functionality) e.functionality = 'tooLong';
      break;
    }
    case 'references': {
      if (d.existingUrl.trim().length > LIMITS.url) e.existingUrl = 'tooLong';
      else if (!looksLikeUrl(d.existingUrl)) e.existingUrl = 'url';
      if (d.referenceLinks.trim().length > LIMITS.links) e.referenceLinks = 'tooLong';
      else if (!eachLinkValid(d.referenceLinks)) e.referenceLinks = 'url';
      if (d.notes.trim().length > LIMITS.notes) e.notes = 'tooLong';
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

      if (d.company.trim().length > LIMITS.company) e.company = 'tooLong';
      /* Telegram and WhatsApp are both optional, and never both required. */
      if (d.telegram.trim().length > LIMITS.handle) e.telegram = 'tooLong';
      if (d.whatsapp.trim().length > LIMITS.handle) e.whatsapp = 'tooLong';
      if (!d.consent) e.consent = 'consent';
      break;
    }
    case 'review':
      break;
  }

  return e;
}

/** Every step, in order — used before submitting and to find where to return. */
export function validateAll(d: ProjectBrief): { errors: FieldErrors; firstBadStep: number } {
  let errors: FieldErrors = {};
  let firstBadStep = -1;

  STEPS.forEach((step, i) => {
    const stepErrors = validateStep(step.id, d);
    if (Object.keys(stepErrors).length && firstBadStep === -1) firstBadStep = i;
    errors = { ...errors, ...stepErrors };
  });

  return { errors, firstBadStep };
}
