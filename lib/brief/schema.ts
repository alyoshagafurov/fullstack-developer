/*
 * Project Brief — the shared data contract.
 *
 * Single source of truth for what a brief IS: the option values, the field
 * shape, the length limits and the step order. Imported by the client wizard,
 * the client validator, the i18n dictionaries (so every option is guaranteed a
 * label in ru/tg/en) and the API route.
 *
 * No UI copy and no validation logic live here — copy is in lib/i18n, client
 * rules in ./validate, and the server keeps its own independent rules in
 * app/api/brief/route.ts, which never trusts these.
 *
 * Phase 6 persists `BriefSubmission` as-is. Keep it stable.
 */

export const PROJECT_TYPES = [
  'website', 'landing', 'webapp', 'saas', 'ecommerce', 'crm',
  'telegram', 'automation', 'ai', 'api', 'custom', 'other',
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/* Ranges, never an exact figure — a planning signal, not a quote. */
export const BUDGETS = ['lt500', 'r500_1k', 'r1k_2k5', 'r2k5_5k', 'gt5k', 'unsure'] as const;
export type Budget = (typeof BUDGETS)[number];

export const TIMELINES = ['asap', 'w1_2', 'w2_4', 'm1_2', 'flexible', 'unsure'] as const;
export type Timeline = (typeof TIMELINES)[number];

/** Everything the brief collects. Nothing more personal than needed. */
export interface ProjectBrief {
  /* 01 — project */
  projectType: ProjectType | '';
  projectTypeOther: string;
  /* 02 — goal */
  goal: string;
  /* 03 — scope */
  description: string;
  functionality: string;
  /* 04 — references */
  existingUrl: string;
  referenceLinks: string;
  notes: string;
  /* 05 / 06 */
  budget: Budget | '';
  timeline: Timeline | '';
  /* 07 — contact */
  name: string;
  company: string;
  email: string;
  telegram: string;
  whatsapp: string;
  consent: boolean;
}

/** What crosses the wire. Phase 6 stores this shape. */
export interface BriefSubmission {
  data: ProjectBrief;
  meta: {
    /** UI language the brief was filled in — useful when replying. */
    locale: string;
    /** ISO-8601, client clock. The server records its own received-at too. */
    startedAt: string;
    completedAt: string;
  };
  /** Honeypot — must stay empty; real people never see this field. */
  hp?: string;
}

export const LIMITS = {
  projectTypeOther: 80,
  goal: { min: 12, max: 1500 },
  description: { min: 20, max: 2000 },
  functionality: 1500,
  url: 500,
  links: 800,
  notes: 1500,
  name: { min: 2, max: 80 },
  company: 120,
  email: 160,
  handle: 80,
} as const;

export function emptyBrief(): ProjectBrief {
  return {
    projectType: '', projectTypeOther: '',
    goal: '',
    description: '', functionality: '',
    existingUrl: '', referenceLinks: '', notes: '',
    budget: '', timeline: '',
    name: '', company: '', email: '', telegram: '', whatsapp: '',
    consent: false,
  };
}

/* ── Steps ────────────────────────────────────────────────────────────────
 * One question per screen. `optional` steps can be passed with Continue.
 * `autoAdvance` marks the single-choice steps that move on by themselves.
 */
export const STEP_IDS = [
  'project', 'goal', 'scope', 'references', 'budget', 'timeline', 'contact', 'review',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export type StepDef = {
  id: StepId;
  fields: (keyof ProjectBrief)[];
  optional?: boolean;
  autoAdvance?: boolean;
};

export const STEPS: StepDef[] = [
  { id: 'project', fields: ['projectType', 'projectTypeOther'], autoAdvance: true },
  { id: 'goal', fields: ['goal'] },
  { id: 'scope', fields: ['description', 'functionality'] },
  { id: 'references', fields: ['existingUrl', 'referenceLinks', 'notes'], optional: true },
  { id: 'budget', fields: ['budget'], autoAdvance: true },
  { id: 'timeline', fields: ['timeline'], autoAdvance: true },
  { id: 'contact', fields: ['name', 'company', 'email', 'telegram', 'whatsapp', 'consent'] },
  { id: 'review', fields: [] },
];

/** Steps the visitor actually answers (review is a summary, not a question). */
export const ANSWER_STEPS = STEPS.length - 1;

/**
 * Reference shown on the confirmation screen, e.g. `ALY-2026-4F7K2`.
 * Issued by the SERVER only when a brief is really stored (Phase 6) — never on
 * the client, so a reference always corresponds to something that exists.
 */
export const REFERENCE_PREFIX = 'ALY';
export const REFERENCE_PATTERN = /^ALY-\d{4}-[A-Z0-9]{5}$/;
