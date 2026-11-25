import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The words a service's own page adds around the owner's description of it:
 * the line under the headline, the headings of the blocks below, the related
 * services and projects, and a short FAQ.
 *
 * Nothing here is a new fact. The FAQ answers are built from what the site
 * already says — the live price and term, the promise, the deliverable — so
 * an edit there, or a price changed in the admin, reaches the page and its
 * FAQPage markup together. The copy lives here rather than in lib/i18n so
 * these pages can change without touching the dictionaries every page reads.
 *
 * The Russian headlines of the five most asked-for services say «в Душанбе»
 * where it reads as people say it («Telegram-боты на заказ в Душанбе»). The
 * home owns «программист в Душанбе» and /dushanbe owns «создание сайтов в
 * Душанбе», so /services/sites keeps its plain name and names the city only in
 * the line under it.
 */

export type ServiceFaq = { q: string; a: string };

type Naming = {
  /** The headline, when it differs from the service's name in the dictionary. */
  h1?: string;
  /** As it reads inside «Сколько стоит …?» / "How much does … cost?". */
  asked: string;
};

const NAMES: Record<Locale, Record<string, Naming>> = {
  ru: {
    sites: { asked: 'сайт под ключ' },
    landing: { h1: 'Лендинги на заказ в Душанбе', asked: 'лендинг' },
    corporate: { asked: 'сайт компании' },
    ecommerce: { h1: 'Интернет-магазины под ключ в Душанбе', asked: 'интернет-магазин' },
    'web-apps': { asked: 'веб-приложение' },
    crm: { asked: 'CRM-система' },
    automation: { asked: 'автоматизация' },
    redesign: { asked: 'редизайн' },
    mvp: { asked: 'MVP' },
    support: { asked: 'поддержка' },
    android: { asked: 'Android-приложение' },
    ios: { asked: 'приложение для iPhone' },
    'telegram-bots': { h1: 'Telegram-боты на заказ в Душанбе', asked: 'Telegram-бот' },
    'telegram-mini-apps': { h1: 'Telegram Mini Apps на заказ в Душанбе', asked: 'Telegram Mini App' },
  },
  en: {
    sites: { asked: 'a website' },
    landing: { asked: 'a landing page' },
    corporate: { asked: 'a company website' },
    ecommerce: { asked: 'an online store' },
    'web-apps': { asked: 'a web app' },
    crm: { asked: 'a CRM system' },
    automation: { asked: 'automation' },
    redesign: { asked: 'a redesign' },
    mvp: { asked: 'an MVP' },
    support: { asked: 'support' },
    android: { asked: 'an Android app' },
    ios: { asked: 'an iPhone app' },
    'telegram-bots': { asked: 'a Telegram bot' },
    'telegram-mini-apps': { asked: 'a Telegram Mini App' },
  },
};

/** Two or three neighbours of each service, linked under it. Hidden ones are skipped by the page. */
export const RELATED_SERVICES: Record<string, readonly string[]> = {
  sites: ['landing', 'corporate', 'ecommerce'],
  landing: ['sites', 'corporate', 'redesign'],
  corporate: ['sites', 'landing', 'crm'],
  ecommerce: ['sites', 'telegram-bots', 'telegram-mini-apps'],
  'web-apps': ['mvp', 'crm', 'telegram-mini-apps'],
  crm: ['automation', 'web-apps', 'telegram-bots'],
  automation: ['telegram-bots', 'crm', 'web-apps'],
  redesign: ['sites', 'landing', 'support'],
  mvp: ['web-apps', 'android', 'ios'],
  support: ['redesign', 'automation', 'sites'],
  android: ['ios', 'telegram-mini-apps', 'mvp'],
  ios: ['android', 'telegram-mini-apps', 'mvp'],
  'telegram-bots': ['telegram-mini-apps', 'automation', 'crm'],
  'telegram-mini-apps': ['telegram-bots', 'web-apps', 'ecommerce'],
};

/**
 * Published projects that are plainly this service, by case slug. Only the
 * two stores are: every other service links to /work instead of a project
 * that would only loosely fit.
 */
export const RELATED_CASES: Record<string, readonly string[]> = {
  ecommerce: ['arusdomod-shop', 'autoshine-store'],
};

/**
 * Support is ongoing work on a project that already exists: there is no
 * design stage, no draft and no 50/50 on it, so its page leaves the project
 * stages and payment terms out rather than promise them.
 */
export const hasProjectStages = (slug: string) => slug !== 'support';

/*
 * The six stages in the dictionary are written for a website. Their durations
 * add up to about two weeks at the least (1 + 1 + 3 + 7 + 2 + 1 days), and the
 * launch puts the site online on the client's domain.
 *
 * A service whose own term ends before that (a landing page in 4–6 days, a bot
 * in 3 days to 2 weeks) shows the same stages without their durations, so the
 * page does not quote two timelines that disagree: the term in the price band
 * is the one that holds. An app is handed over ready to publish, not put on a
 * domain, so its stages stop before that launch. No service gets durations of
 * its own — the repo has none to give it.
 */
const SHORTER_THAN_STAGES = new Set(['sites', 'landing', 'redesign', 'automation', 'telegram-bots']);
const APPS = new Set(['android', 'ios']);

export type StageRow = { title: string; duration: string | null; body: string };

export function serviceStages(slug: string, stages: Dictionary['process']['stages']): StageRow[] {
  const timed = !SHORTER_THAN_STAGES.has(slug);
  const shown = APPS.has(slug) ? stages.slice(0, -1) : stages;
  return shown.map((stage) => ({ title: stage.title, duration: timed ? stage.duration : null, body: stage.body }));
}

const ru = {
  sub: 'Работаю в Душанбе и удалённо — делаю сам, от идеи до запуска.',
  processNote: (planStage: string) =>
    `Так обычно проходит проект. Точный срок вашего назову вместе со стоимостью — на этапе «${planStage}».`,
  termsTitle: 'Оплата и правки',
  casesTitle: 'Похожие проекты',
  casesNote: 'Сделаны для реальных клиентов — подробности на странице проекта.',
  relatedTitle: 'Похожие услуги',
  allServices: 'Все услуги',
  allPrices: 'Все цены',
  allWork: 'Все проекты',
  faqTitle: 'Частые вопросы',
  faqNote: (t: Dictionary) => `Не нашли ответ — напишите. ${t.common.replyWithin}`,
  faq: {
    price: (asked: string) => `Сколько стоит ${asked}?`,
    priceFrom: (figure: string) => `${figure} — это стартовая цена. Точную сумму скажу после разговора.`,
    priceOther: (figure: string) => `${figure}. Точную сумму скажу после разговора.`,
    term: 'Сколько времени займёт работа?',
    termAnswer: (term: string | null) =>
      [
        term && `${term}.`,
        'Первый набросок — через 1–3 дня после разговора.',
        'Точный срок называю вместе со стоимостью, когда разберём задачу.',
      ]
        .filter(Boolean)
        .join(' '),
    supportTerm: 'Как устроена поддержка?',
    supportAnswer: (term: string | null, deliverable: string) =>
      [term && `${term}.`, `Входят: ${lowerFirst(deliverable, 'ru')}`].filter(Boolean).join(' '),
  },
};

export type ServicePageCopy = typeof ru;

const en: ServicePageCopy = {
  sub: 'In Dushanbe and remotely — I do it all myself, from idea to launch.',
  processNote: (planStage: string) =>
    `This is how a project usually goes. I give you the exact timeline for yours together with the price, at the “${planStage}” stage.`,
  termsTitle: 'Payment and changes',
  casesTitle: 'Similar projects',
  casesNote: 'Built for real clients — the details are on each project’s page.',
  relatedTitle: 'Related services',
  allServices: 'All services',
  allPrices: 'All prices',
  allWork: 'All projects',
  faqTitle: 'Common questions',
  faqNote: (t: Dictionary) => `Didn’t find your answer? Write to me. ${t.common.replyWithin}`,
  faq: {
    price: (asked: string) => `How much does ${asked} cost?`,
    priceFrom: (figure: string) => `${figure} — that’s the starting price. I’ll tell you the exact amount after we talk.`,
    priceOther: (figure: string) => `${figure}. I’ll tell you the exact amount after we talk.`,
    term: 'How long does it take?',
    termAnswer: (term: string | null) =>
      [
        term && `${term}.`,
        'The first draft is ready 1–3 days after we talk.',
        'I give you the exact timeline together with the price, once we’ve worked through the task.',
      ]
        .filter(Boolean)
        .join(' '),
    supportTerm: 'How does support work?',
    supportAnswer: (term: string | null, deliverable: string) =>
      [term && `${term}.`, `It covers ${lowerFirst(deliverable, 'en')}`].filter(Boolean).join(' '),
  },
};

const copy: Record<Locale, ServicePageCopy> = { ru, en };

export function servicePageCopy(lang: Locale): ServicePageCopy {
  return copy[lang];
}

/** The headline: «Telegram-боты на заказ в Душанбе» where one is set, the service's own name otherwise. */
export function serviceHeadline(lang: Locale, slug: string, fallback: string): string {
  return NAMES[lang][slug]?.h1 ?? fallback;
}

function lowerFirst(text: string, lang: Locale): string {
  return text.charAt(0).toLocaleLowerCase(lang) + text.slice(1);
}

/** A value that stands alone on the site («От 3 дней до 2 недель»), closed as a sentence without a doubled full stop. */
const sentence = (text: string) => text.trim().replace(/\.$/, '');

/**
 * The questions and answers, the same strings for the page and for its
 * FAQPage markup. `price` and `term` are the figures the page shows above —
 * in somoni on /ru, in dollars on the English site.
 *
 * Only what is this service's own: its price, and its term (or, for support,
 * how support works). Payment and what follows the launch are the same on
 * every project and already stand in the «Оплата и правки» band above; asked
 * again here they would repeat that band word for word and put one question
 * into the markup of a dozen pages and /dushanbe. Support has no launch, so
 * the three revisions included in a project's price are not its to promise.
 */
export function serviceFaq({
  lang,
  slug,
  asked,
  price,
  term,
  deliverable,
}: {
  lang: Locale;
  slug: string;
  /** The service's name, for a slug this file has no words for. */
  asked: string;
  price: string;
  term: string | null;
  deliverable: string;
}): ServiceFaq[] {
  const c = copy[lang].faq;
  const name = NAMES[lang][slug]?.asked ?? asked;
  const shown = sentence(price);
  const said = term ? sentence(term) : null;

  return [
    {
      q: c.price(name),
      a: /^(от|from)\s/i.test(shown) ? c.priceFrom(shown) : c.priceOther(shown),
    },
    hasProjectStages(slug)
      ? { q: c.term, a: c.termAnswer(said) }
      : { q: c.supportTerm, a: c.supportAnswer(said, deliverable) },
  ];
}
