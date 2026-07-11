/* Shared shape for every language dictionary. Enforces that ru/tg/en all
   provide the same keys, so nothing goes untranslated. */

export type Lang = 'ru' | 'tg' | 'en';

export interface Dict {
  nav: { work: string; services: string; process: string; pricing: string; about: string; contact: string; cta: string };
  hero: { badge: string; roleA: string; roleB: string; ctaWork: string; ctaContact: string; marker: string; scroll: string };
  marquee: { title: string };
  stats: { items: { value: number; suffix: string; label: string }[] };
  services: { eyebrow: string; title: string; sub: string; items: { title: string; body: string; tags: string[] }[] };
  work: { eyebrow: string; title: string; sub: string; open: string };
  cases: Record<
    string,
    { title: string; category: string; summary: string; result: { value: string; label: string }; problem: string; solution: string; features: string[]; stack: string[] }
  >;
  caseUI: { back: string; discuss: string; openSite: string; problem: string; solution: string; result: string; done: string; next: string };
  process: { eyebrow: string; title: string; sub: string; steps: { n: string; t: string; d: string }[] };
  stack: { eyebrow: string; title: string; sub: string; groups: { title: string; items: string[] }[] };
  why: { eyebrow: string; title: string; items: { t: string; d: string }[] };
  testimonials: { eyebrow: string; title: string; items: { name: string; role: string; text: string }[] };
  pricing: {
    eyebrow: string; unit: string; from: string; to: string;
    th: { service: string; from: string; to: string };
    services: { n: string; name: string; from: string; to: string }[];
    dependsTitle: string; dependsText: string; factorsTitle: string; factors: string[];
    writeTitle: string; writeText: string; ctaTg: string; noPressure: string;
  };
  faq: { eyebrow: string; title: string; sub: string; items: { q: string; a: string }[] };
  about: { eyebrow: string; title: string; p1: string; p2: string; p3: string; facts: { k: string; v: string }[] };
  contact: {
    eyebrow: string; title1: string; title2: string; sub: string;
    channels: { label: string; value: string; href: string }[];
    budgets: string[]; timelines: string[];
    f: { name: string; namePh: string; email: string; emailPh: string; company: string; companyPh: string; budget: string; timeline: string; message: string; messagePh: string; select: string; submit: string; sending: string; consent: string };
    okTitle: string; okText: string; again: string; errValidation: string; errFail: string;
  };
  footer: { tagline: string; navTitle: string; contactTitle: string; location: string; up: string; rights: string };
  langNames: { ru: string; tg: string; en: string };
}
