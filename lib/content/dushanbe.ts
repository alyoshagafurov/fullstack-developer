import { PROJECTS, PROMISE } from '@/lib/content/site';
import { kickoff } from '@/lib/content/process';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The local page, /dushanbe and /ru/dushanbe: what someone who wants a site
 * made in Dushanbe asks before writing — what it costs, how long it takes, how
 * payment works, who would do the work — on one page.
 *
 * Its job is not the home's. The home owns «Программист в Душанбе»: who he is
 * and his work. This page owns «создание сайтов в Душанбе» (its title and
 * headline) and «заказать сайт в Душанбе» (its description), and «программист
 * в Душанбе» is said here only once, in the line under the headline, so the
 * two pages do not compete for the same search. It answers what a site costs
 * and how long it takes in its FAQ, but the price list itself is /prices's:
 * the service pages and /prices carry the detail, and this page links to both.
 *
 * Every statement here is one the repo already holds: the promise and the
 * project count from ./site, the kickoff note from ./process, the payment and
 * support terms, reply time and hours from the dictionary (so an edit there
 * reaches this page and its FAQ markup in both languages), and the prices and
 * terms from the live price list. Nothing is added that the owner has not said.
 * The copy lives here rather than in lib/i18n so this page can change without
 * touching the dictionaries every other page reads.
 */

export const DUSHANBE_PATH = '/dushanbe';

/** The services this page leads with, in the order people here ask for them. */
export const LOCAL_SERVICES = ['sites', 'landing', 'corporate', 'ecommerce', 'telegram-bots', 'telegram-mini-apps'] as const;

/** The rest, named in one line under the list, each a link to its own page. */
export const MORE_SERVICES = ['web-apps', 'crm', 'automation', 'android', 'ios'] as const;

/** What the price and time answers walk through. */
const PRICE_ORDER = ['landing', 'sites', 'corporate', 'ecommerce', 'telegram-bots'] as const;
const TERM_ORDER = ['landing', 'sites', 'ecommerce', 'telegram-bots'] as const;

/** The three home projects, by kind. The case pages and the live site carry the detail. */
export const LOCAL_WORK = ['arusdomod-shop', 'autoshine-store', 'mimi'] as const;
export const MIMI_URL = 'https://www.mimitj.agency';

/** A figure from the price list, as it reads inside a sentence: «от 3 000 сомони», "from ~$270". */
export type Figures = Record<string, { price: string | null; term: string | null }>;

type Faq = { q: string; a: string };

const lowerFirst = (text: string, lang: Locale) => text.charAt(0).toLocaleLowerCase(lang) + text.slice(1);
const upperFirst = (text: string, lang: Locale) => text.charAt(0).toLocaleUpperCase(lang) + text.slice(1);

/** «лендинг — от 1 500 сомони; сайт под ключ — от 3 000 сомони; …», skipping anything without a figure. */
function walk(
  lang: Locale,
  order: readonly string[],
  names: Record<string, string>,
  pick: (slug: string) => string | null | undefined,
): string {
  const parts = order.flatMap((slug) => {
    const value = pick(slug)?.trim();
    return value && names[slug] ? [`${names[slug]} — ${lowerFirst(value, lang)}`] : [];
  });
  return parts.length ? upperFirst(parts.join('; '), lang) : '';
}

/* ================================================================= Russian */

const ru = {
  /**
   * Without the name: the layout's '%s | Алишер Гафуров' adds it, 64
   * characters in all. The query leads, so a cut in the results only ever
   * takes the name.
   */
  metaTitle: 'Создание сайтов в Душанбе — цены, сроки, оплата',
  /**
   * «Заказать сайт в Душанбе: лендинг от 1 500 сомони, сайт под ключ от 3 000
   * сомони. Первый набросок…» — the figures as the price list shows them, each
   * left out when it has none; about 145 characters with both.
   */
  metaDescription: (landing: string | null, site: string | null) => {
    const priced = [landing && `лендинг ${lowerFirst(landing, 'ru')}`, site && `сайт под ключ ${lowerFirst(site, 'ru')}`].filter(Boolean);
    return priced.length
      ? `Заказать сайт в Душанбе: ${priced.join(', ')}. ${PROMISE.full}`
      : `Заказать сайт в Душанбе: лендинги, сайты под ключ и интернет-магазины. ${PROMISE.full}`;
  },
  footer: 'Создание сайтов в Душанбе',
  crumbs: { here: 'Создание сайтов в Душанбе' },
  crumbsLabel: 'Вы здесь',

  hero: {
    eyebrow: 'Алишер Гафуров · aly',
    title: 'Создание сайтов в Душанбе',
    sub: 'Я — программист в Душанбе: делаю сайты, интернет-магазины и Telegram-ботов сам, от идеи до запуска.',
    cta: 'Обсудить проект',
    promise: [PROMISE.draft, PROMISE.payment] as string[],
    photoAlt: 'Алишер Гафуров работает за ноутбуком',
  },

  who: {
    title: 'Вы общаетесь с тем, кто делает.',
    body: [
      `Я Алишер Гафуров, веб-разработчик. Собираю проект целиком: от идеи и дизайна до сервера и запуска — без посредников и передачи «в другие руки».`,
      `За плечами ${PROJECTS} проектов на фрилансе для клиентов из Таджикистана и других стран. Говорю с клиентами на русском, таджикском и английском.`,
    ],
    more: 'Обо мне',
  },

  services: {
    title: 'Что делаю — и сколько стоит.',
    note: 'Это стартовые цены. Итог зависит от объёма работы — точную сумму скажу после разговора.',
    names: {
      sites: 'Сайт под ключ',
      landing: 'Лендинг',
      corporate: 'Сайт компании',
      ecommerce: 'Интернет-магазин под ключ',
      'telegram-bots': 'Telegram-бот на заказ',
      'telegram-mini-apps': 'Telegram Mini App на заказ',
    } as Record<string, string>,
    more: 'А ещё:',
    moreNames: {
      'web-apps': 'веб-приложения',
      crm: 'CRM-системы',
      automation: 'автоматизация',
      android: 'приложения для Android',
      ios: 'приложения для iOS',
    } as Record<string, string>,
    all: 'Все услуги',
    prices: 'Все цены',
    termLabel: 'Сроки',
  },

  work: {
    title: 'Настоящие проекты.',
    note: 'Сайты, сделанные для реальных клиентов. Подробности — по ссылке у каждого проекта.',
    kinds: {
      'arusdomod-shop': 'Магазин свадебных нарядов',
      'autoshine-store': 'Магазин автокосметики',
      // Sourced, not added: mimi's own site is titled «Маркетинговое агентство в Душанбе — mimi».
      mimi: 'Маркетинговое агентство из Душанбе',
    } as Record<string, string>,
    openSite: 'Открыть сайт',
    details: 'Подробнее',
    all: 'Все проекты',
    home: 'Кейсы на главной',
  },

  faqTitle: 'Частые вопросы.',
  faqNote: 'Не нашли ответ — напишите, отвечу в течение дня.',

  closing: {
    title: 'Расскажите, что нужно сделать.',
    sub: 'Своими словами, можно коротко. Отвечу лично, в течение дня.',
    cta: 'Обсудить проект',
    or: 'Или напишите напрямую',
    avatarAlt: 'Алишер Гафуров',
  },
};

/*
 * The answers that restate a term the site already gives — payment, support
 * after launch, the reply time, the hours — read it from the dictionary, so
 * the page, its FAQ markup and the rest of the site never drift apart.
 */
function paymentAnswer(t: Dictionary, lead: string, fallback: string): string {
  return `${lead} ${t.process.terms[0]?.value ?? fallback}`;
}

function supportAnswer(t: Dictionary): string {
  return [t.process.terms[1]?.value, t.process.terms[2]?.value].filter(Boolean).join(' ');
}

function replyAnswer(t: Dictionary): string {
  return `${t.common.responseTime}. ${t.common.hours}`;
}

function faqRu(figures: Figures, t: Dictionary): Faq[] {
  const priceNames = { landing: 'лендинг', sites: 'сайт под ключ', corporate: 'сайт компании', ecommerce: 'интернет-магазин', 'telegram-bots': 'Telegram-бот' } as Record<string, string>;
  const prices = walk('ru', PRICE_ORDER, priceNames, (slug) => figures[slug]?.price);
  const times = walk('ru', TERM_ORDER, priceNames, (slug) => figures[slug]?.term);

  /*
   * Money, time and payment first: the three questions this page is searched
   * for. Payment says how it is split and when — the repo names no payment
   * methods, so neither does the answer.
   */
  return [
    {
      q: 'Сколько стоит сайт в Душанбе?',
      a: [prices && `${prices}.`, ru.services.note].filter(Boolean).join(' '),
    },
    {
      q: 'Сколько времени займёт создание сайта?',
      a: [
        'Первый набросок — через 1–3 дня после разговора.',
        times && `Сроки работы: ${lowerFirst(times, 'ru')}.`,
        'Точный срок называю вместе со стоимостью, когда разберём задачу.',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      q: 'Как проходит оплата?',
      a: paymentAnswer(t, 'Пятьдесят на пятьдесят.', PROMISE.full),
    },
    {
      q: 'Как заказать сайт?',
      a: 'Оставьте заявку на сайте — коротко, своими словами — или напишите мне в Telegram или WhatsApp. Я отвечу лично, мы обсудим задачу, и я предложу решение, сроки и стоимость.',
    },
    {
      q: 'Можно без технического задания?',
      a: `Да. В заявке можно выбрать «Не знаю» и описать задачу своими словами — коротко, как получится. ${kickoff.outro}`,
    },
    {
      q: 'Поможете с доменом и размещением?',
      a: 'Да, это последний шаг работы: размещаю проект, подключаю домен, настраиваю нужные сервисы и передаю готовый продукт вам.',
    },
    {
      q: 'Что после запуска?',
      a: `${supportAnswer(t)} Если проект нужно развивать дальше — продолжаю с ним работать: исправляю, улучшаю и добавляю новые функции.`,
    },
    {
      q: 'На каком языке можно общаться?',
      a: 'На русском, таджикском или английском — как вам удобнее. Сайт тоже может быть на нескольких языках: например, сайт агентства mimi сделан на трёх.',
    },
    {
      q: 'Вы работаете только с клиентами из Душанбе?',
      a: 'Нет. Я работаю из Душанбе с клиентами из Таджикистана и других стран. Обсудить проект можно в Telegram, WhatsApp, по телефону или почте — как вам удобнее.',
    },
    {
      q: 'Как быстро вы отвечаете?',
      a: replyAnswer(t),
    },
  ];
}

/* ================================================================= English */

export type DushanbeCopy = typeof ru;

const en: DushanbeCopy = {
  /** With the layout's ' | Alisher Gafurov', past 60: the query leads, so a cut takes the name. */
  metaTitle: 'Website development in Dushanbe — prices and timelines',
  /** «…: landing pages from ~$…, websites from ~$…. A first draft…» — about 155 characters with both figures in dollars. */
  metaDescription: (landing: string | null, site: string | null) => {
    const priced = [landing && `landing pages ${lowerFirst(landing, 'en')}`, site && `websites ${lowerFirst(site, 'en')}`].filter(Boolean);
    return priced.length
      ? `Order a website in Dushanbe, Tajikistan: ${priced.join(', ')}. ${PROMISE.en.full}`
      : `Order a website in Dushanbe, Tajikistan: landing pages, websites and online stores. ${PROMISE.en.full}`;
  },
  footer: 'Websites in Dushanbe',
  crumbs: { here: 'Websites in Dushanbe' },
  crumbsLabel: 'You are here',

  hero: {
    eyebrow: 'Alisher Gafurov · aly',
    title: 'Website development in Dushanbe',
    sub: 'I’m a web developer in Dushanbe: I build websites, online stores and Telegram bots myself, from idea to launch.',
    cta: 'Discuss a project',
    promise: [PROMISE.en.draft, PROMISE.en.payment] as string[],
    photoAlt: 'Alisher Gafurov at work on his laptop',
  },

  who: {
    title: 'You talk to the person who builds it.',
    body: [
      'I’m Alisher Gafurov, a web developer. I build the whole project myself: from the idea and design to the server and launch — no middlemen, nothing handed off to someone else.',
      `${PROJECTS} freelance projects so far, for clients in Tajikistan and other countries. I talk with clients in Russian, Tajik and English.`,
    ],
    more: 'About me',
  },

  services: {
    title: 'What I build — and what it costs.',
    note: 'These are starting prices. The final price depends on the size of the job — I’ll tell you the exact amount after we talk.',
    names: {
      sites: 'Website from scratch',
      landing: 'Landing page',
      corporate: 'Company website',
      ecommerce: 'Turnkey online store',
      'telegram-bots': 'Custom Telegram bot',
      'telegram-mini-apps': 'Custom Telegram Mini App',
    } as Record<string, string>,
    more: 'Also:',
    moreNames: {
      'web-apps': 'web apps',
      crm: 'CRM systems',
      automation: 'automation',
      android: 'Android apps',
      ios: 'iOS apps',
    } as Record<string, string>,
    all: 'All services',
    prices: 'All prices',
    termLabel: 'Timeline',
  },

  work: {
    title: 'Real projects.',
    note: 'Sites built for real clients. Follow each project for the details.',
    kinds: {
      'arusdomod-shop': 'Wedding outfits store',
      'autoshine-store': 'Car care store',
      // From mimi's own site title, «Маркетинговое агентство в Душанбе — mimi».
      mimi: 'Marketing agency in Dushanbe',
    } as Record<string, string>,
    openSite: 'Open the site',
    details: 'Details',
    all: 'All projects',
    home: 'Case studies on the home page',
  },

  faqTitle: 'Common questions.',
  faqNote: 'Didn’t find your answer? Write to me — I reply within a day.',

  closing: {
    title: 'Tell me what you need.',
    sub: 'In your own words, briefly is fine. I reply personally, within a day.',
    cta: 'Discuss a project',
    or: 'Or write to me directly',
    avatarAlt: 'Alisher Gafurov',
  },
};

function faqEn(figures: Figures, t: Dictionary): Faq[] {
  const priceNames = { landing: 'landing page', sites: 'website from scratch', corporate: 'company website', ecommerce: 'online store', 'telegram-bots': 'Telegram bot' } as Record<string, string>;
  const prices = walk('en', PRICE_ORDER, priceNames, (slug) => figures[slug]?.price);
  const times = walk('en', TERM_ORDER, priceNames, (slug) => figures[slug]?.term);

  /* The same order as the Russian: money, time and payment first. */
  return [
    {
      q: 'How much does a website cost in Dushanbe?',
      a: [prices && `${prices}.`, en.services.note].filter(Boolean).join(' '),
    },
    {
      q: 'How long does it take to build a website?',
      a: [
        'The first draft is ready 1–3 days after we talk.',
        times && `The work itself: ${lowerFirst(times, 'en')}.`,
        'I give you the exact timeline together with the price, once we’ve worked through the task.',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      q: 'How does payment work?',
      a: paymentAnswer(t, 'Fifty-fifty.', PROMISE.en.full),
    },
    {
      q: 'How do I order a website?',
      a: 'Send a request on this site — briefly, in your own words — or message me on Telegram or WhatsApp. I’ll reply personally, we’ll talk the task through, and I’ll suggest a solution, a timeline and a price.',
    },
    {
      q: 'Can we start without a technical brief?',
      a: 'Yes. In the request form you can pick “Not sure” and describe the task in your own words — briefly, however you can. If you don’t have the materials or a clear picture yet, that’s normal: I’ll help you work it out as we go.',
    },
    {
      q: 'Will you help with the domain and hosting?',
      a: 'Yes, that’s the last step of the work. I put the project online, connect the domain, set up the services it needs and hand the finished product over to you.',
    },
    {
      q: 'What happens after launch?',
      a: `${supportAnswer(t)} If the project needs to keep growing, I keep working on it: fixing, improving and adding new features.`,
    },
    {
      q: 'Which languages do you work in?',
      a: 'Russian, Tajik or English — whichever suits you. The site itself can be in several languages too: the site for the mimi agency, for example, is in three.',
    },
    {
      q: 'Do you only work with clients in Dushanbe?',
      a: 'No. I work from Dushanbe with clients in Tajikistan and other countries. We can talk it through on Telegram, WhatsApp, by phone or by email — whatever suits you.',
    },
    {
      q: 'How quickly do you reply?',
      a: replyAnswer(t),
    },
  ];
}

/* ================================================================== access */

const copy: Record<Locale, DushanbeCopy> = { ru, en };

export function dushanbeCopy(lang: Locale): DushanbeCopy {
  return copy[lang];
}

/** The questions and answers, the same strings for the page and for its FAQPage markup. */
export function dushanbeFaq(lang: Locale, figures: Figures, t: Dictionary): Faq[] {
  return lang === 'ru' ? faqRu(figures, t) : faqEn(figures, t);
}
