/* Shared shape for every language dictionary. Enforces that ru/tg/en all
   provide the same keys, so nothing goes untranslated. */

import type {
  ProjectType, Budget, Timeline, StepId,
} from '@/lib/brief/schema';
import type { ErrorKey } from '@/lib/brief/validate';

export type Lang = 'ru' | 'tg' | 'en';

export interface Dict {
  common: { more: string; viewPricing: string; ctaTitle: string };
  nav: { work: string; services: string; process: string; pricing: string; about: string; contact: string; cta: string };
  hero: { badge: string; roleA: string; roleB: string; ctaWork: string; ctaContact: string; marker: string; scroll: string };
  marquee: { title: string };
  /* The figures carry their own heading. They used to sit under the
     testimonials one, which promised quotes and delivered numbers — and the
     quotes are still placeholders, so nothing renders them. */
  stats: {
    eyebrow: string;
    title: string;
    items: { value: number; suffix: string; label: string }[];
  };
  services: { eyebrow: string; title: string; sub: string; items: { title: string; body: string; tags: string[] }[] };
  work: { eyebrow: string; title: string; sub: string; open: string };
  cases: Record<
    string,
    { title: string; category: string; summary: string; result: { value: string; label: string }; problem: string; solution: string; features: string[]; stack: string[] }
  >;
  caseUI: { back: string; discuss: string; openSite: string; problem: string; solution: string; result: string; done: string; next: string };
  process: { eyebrow: string; title: string; sub: string; steps: { n: string; t: string; d: string }[] };
  stack: { eyebrow: string; title: string; sub: string; groups: { title: string; items: string[] }[] };
  /* Editorial photography punctuation — captions for the photo moments. */
  photo: {
    craftLabel: string; craftTitle: string; craftNote: string;
    toolsLabel: string; toolsNote: string;
    standardLabel: string; standardNote: string;
  };
  why: { eyebrow: string; title: string; items: { t: string; d: string }[] };
  testimonials: { eyebrow: string; title: string; items: { name: string; role: string; text: string }[] };
  pricing: {
    eyebrow: string; unit: string; from: string; to: string;
    th: { service: string; from: string; to: string };
    services: { n: string; name: string; from: string; to: string }[];
    dependsTitle: string; dependsText: string; factorsTitle: string; factors: string[];
    writeTitle: string; writeText: string; ctaTg: string; noPressure: string;
    tariffsTitle: string; tariffsSub: string; order: string; popular: string; tableTitle: string;
    tariffs: { name: string; tagline: string; features: string[]; deadline: string }[];
  };
  faq: { eyebrow: string; title: string; sub: string; items: { q: string; a: string }[] };
  about: { eyebrow: string; title: string; p1: string; p2: string; p3: string; facts: { k: string; v: string }[] };
  contact: {
    eyebrow: string; title1: string; title2: string; sub: string;
    channels: { label: string; value: string; href: string }[];
    budgets: string[]; timelines: string[];
    f: { name: string; namePh: string; contact: string; contactPh: string; budget: string; timeline: string; message: string; messagePh: string; select: string; submit: string; sending: string; consent: string };
    okTitle: string; okText: string; again: string; errValidation: string; errFail: string;
    w: {
      q1: string; q2: string; q3: string; q4: string;
      tasks: string[];
      step: string; of: string; back: string;
      comment: string; commentFor: string[]; commentPh: string; intro: string;
    };
  };
  /* Project Brief — the progressive multi-step request flow at /brief. */
  brief: {
    eyebrow: string; title: string; intro: string;
    step: string; of: string;
    back: string; next: string; toReview: string; submit: string; sending: string;
    optional: string; edit: string; skip: string; required: string;
    q: Record<StepId, { t: string; hint: string }>;
    types: Record<ProjectType, string>;
    budgets: Record<Budget, string>;
    budgetNote: string;
    timelines: Record<Timeline, string>;
    timelineNote: string;
    f: {
      typeOtherL: string; typeOtherP: string;
      goalP: string;
      descriptionL: string; descriptionP: string;
      functionalityL: string; functionalityP: string;
      existingUrlL: string; existingUrlP: string;
      referenceLinksL: string; referenceLinksP: string;
      notesL: string; notesP: string;
      nameL: string; nameP: string;
      companyL: string; companyP: string;
      emailL: string; emailP: string;
      telegramL: string; telegramP: string;
      whatsappL: string; whatsappP: string;
      consentL: string;
    };
    sum: {
      project: string; goal: string; scope: string; references: string;
      budget: string; timeline: string; contact: string; none: string;
    };
    err: Record<ErrorKey, string> & { summary: string };
    fail: { validation: string; unavailable: string; tooMany: string; network: string; retry: string };
    ok: {
      title: string; lead: string; refLabel: string;
      whatNext: string; n1: string; n2: string; n3: string;
      home: string; work: string;
    };
  };
  footer: { tagline: string; navTitle: string; contactTitle: string; location: string; up: string; rights: string };
  langNames: { ru: string; tg: string; en: string };
}
