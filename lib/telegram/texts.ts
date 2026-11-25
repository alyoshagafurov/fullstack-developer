import { briefCopyRu, briefTypes, budgetRanges, contactMethods, priorities } from '@/lib/content/brief';
import { PROJECTS, PROMISE, site } from '@/lib/content/site';

/*
 * Everything the bot says, in the owner's words.
 *
 * Block 14 of docs/rebuild/02-ВОПРОСЫ.md, verbatim, plus the field labels and
 * hints of the brief form, which are his too. The handful of connective
 * phrases that no answer covers are gathered in `glue` at the bottom so they
 * can be found and replaced in one place.
 */

/**
 * What a visitor reads on /start — the owner's own text, word for word
 * (2026-11-24 brief, section 3).
 *
 * It does one job: get the visitor to press the button under it. So it says
 * who is talking, why this chat beats any other way in, what the button costs
 * them in time, and the promise that takes the risk out of trying. No prices:
 * the brief puts them after the work and the reviews, and the owner's text has
 * none.
 *
 * A photo caption, sent as HTML. Nothing in it needs escaping, and nothing is
 * set bold: he sent it as plain text, so it goes out as plain text.
 */
export const visitorGreeting = [
  'Привет! Я Алишер 👋',
  '',
  'Этот бот — самый быстрый способ со мной связаться.',
  'Нажмите «Оставить заявку» — это 4 коротких вопроса, меньше минуты.',
  '',
  'Отвечаю лично, в течение дня.',
  'Первый набросок — через 1–3 дня, оплата — только если понравится.',
].join('\n');

/*
 * The picture the greeting stands on: the site's first screen, as a card —
 * its headline, two of his sites, and the site's figures (ru.showroom.specs:
 * «1–3 дня до первого наброска», PROJECTS, «50% · оплата — только если
 * нравится»).
 *
 * Those words are baked into the image, so nothing keeps them in step with
 * site.ts: when the headline, PROJECTS or PROMISE change, the card is redrawn
 * and saved under a new name. A new name, not the same file overwritten —
 * Telegram caches a photo by its URL and would go on sending the old one.
 */
export const welcomeCard = '/bot/welcome-v2.jpg';

/*
 * What Telegram shows in an empty chat before /start (up to 512 characters),
 * and on the bot's profile and in shared links (up to 120). The promise comes
 * first in both — it is the first thing a stranger should learn — and the
 * count is the site's, so the two can never disagree.
 */
export const botDescription = [
  PROMISE.full,
  '',
  `Алишер Гафуров — сайты, интернет-магазины и Telegram-боты. ${PROJECTS} проектов. Отвечаю лично, в течение дня.`,
  '',
  'Нажмите «Старт», чтобы оставить заявку или посмотреть работы.',
  '',
  `${site.url}/ru`,
].join('\n');
export const botShortDescription = `${PROMISE.full} ${site.url}/ru`;

/**
 * What the owner sees on /start.
 *
 * It used to be nine lines describing nine buttons, because there were nine
 * buttons to describe. Now there is one place everything happens, so the
 * message says what still happens *here* — leads and reviews arrive as
 * notifications, and a reply to a forwarded question reaches the person who
 * asked — and then gets out of the way.
 */
export const ownerGreeting =
  '<b>Панель владельца.</b>\n\n' +
  'Заявки и отзывы приходят сюда уведомлениями.\n' +
  'Всё остальное — заявки, деньги, сайт, бот — в админке.\n\n' +
  'Ответить клиенту — ответьте реплаем на его сообщение.';

/**
 * 14.5 — the original greeting, kept because it is the owner's own wording and
 * may be wanted again. Nothing sends it today.
 */
export const greeting =
  'Привет 👋 Я аly.\nЕсли ты здесь — скорее всего, тебе нужно что-то создать. Покажи мне идею, а дальше разберёмся вместе.';

export const clientButtons = {
  idea: '💡 Рассказать идею',
  services: '🚀 Посмотреть, что я делаю',
  about: 'Об Алишере',
  site: 'Веб-сайт',
  /*
   * The greeting's buttons. No emoji: they are navigation, and a row of
   * pictograms reads as a menu rather than as the three things a visitor
   * actually came for.
   */
  brief: 'Оставить заявку',
  work: 'Работы',
  dm: 'Написать Алишеру',
  status: 'Статус проекта',
  review: 'Оставить отзыв',
  prices: 'Все цены',
} as const;

/**
 * 14.7 — sent the moment a brief is stored. His answer, with the greeting's
 * promise finished on the end: the moment they have just committed is when
 * "you pay only if you like it" matters most.
 *
 * The middle sentence is the Mini App's «Готово!» screen, read from the same
 * field: this message lands while that screen is still open, and two different
 * promises of when he will write, side by side, would make both less sure.
 */
export const confirmation = `Заявка получена. ${briefCopyRu.done.personal} Первый набросок — через 1–3 дня после разговора, оплата — только если понравится.`;

/** 14.3 — the notification, field by field, with his emoji. */
export const notification = {
  title: '🔔 Новая заявка',
  name: '👤 Имя клиента',
  company: '🏢 Компания / проект',
  projectType: '📌 Тип проекта',
  description: '📝 Что нужно сделать',
  goal: '🎯 Цель проекта',
  features: '⚙️ Основные функции',
  budget: '💰 Бюджет',
  /** The form's «Что для вас сейчас важнее?» — Скорость / Качество / Цена. */
  priority: '⚖️ Что важнее',
  timeline: '📅 Желаемый срок',
  contact: '📞 Контакт клиента',
  extra: '💬 Вопросы и пожелания',
  createdAt: '🕐 Дата и время отправки заявки',
  source: '🌐 Источник заявки',
} as const;

/** 14.3 — the buttons under it. */
export const notificationButtons = {
  open: 'Открыть заявку',
  contact: 'Связаться',
} as const;

/** 14.4 — the owner's keyboard, his labels. */
/*
 * The list Telegram shows behind the "/" button.
 *
 * Without this the commands still work when typed, but nothing in the app
 * tells anyone they exist — which is exactly how a working bot reads as a
 * broken one. The owner's list is registered against his own chat, so a
 * visitor never sees it.
 */
export const clientCommands = [
  { command: 'start', description: 'Заявка, работы и цены' },
] as const;

export const ownerCommands = [
  { command: 'start', description: 'Панель' },
  { command: 'panel', description: 'Открыть админку' },
  { command: 'id', description: 'Мой Telegram id' },
] as const;

export type BriefStep = {
  key: 'projectType' | 'details' | 'questions' | 'priority' | 'budget' | 'name' | 'contactMethod' | 'contact';
  label: string;
  hint: string;
  optional?: boolean;
  /** What is stored, and sent back in the button's callback. */
  choices?: readonly string[];
  /** What the buttons say, when it differs from what is stored («Email» is shown as «Почта»). */
  labels?: readonly string[];
  consent?: boolean;
};

/**
 * The request, one question per message — the same short form as the site and
 * the Mini App, in the same words and the same order (lib/content/brief.ts):
 * what, a few words about it, what matters most, the budget, and only then
 * who they are and where to answer.
 */
const c = briefCopyRu;
export const briefSteps: BriefStep[] = [
  { key: 'projectType', label: c.projectType.question, hint: c.projectType.hint, choices: briefTypes },
  { key: 'details', label: c.details.question, hint: c.details.hint, optional: true },
  { key: 'questions', label: c.fields.questions.label, hint: c.fields.questions.placeholder, optional: true },
  { key: 'priority', label: c.priority.question, hint: c.priority.hint, choices: priorities },
  { key: 'budget', label: c.budget.question, hint: c.budget.hint, choices: budgetRanges },
  { key: 'name', label: c.name.question, hint: c.name.hint },
  {
    key: 'contactMethod',
    label: c.contact.question,
    hint: c.contact.hint,
    choices: contactMethods,
    labels: contactMethods.map((m) => c.methods[m].label),
  },
  { key: 'contact', label: 'Ваш контакт', hint: 'Ник, номер или почта — куда вам написать.' },
];

/**
 * Connective phrases no answer covers. Short, plain, and all in one place so
 * the owner can replace any of them with his own words.
 */
export const glue = {
  skip: 'Пропустить',
  agree: 'Согласен',
  cancel: 'Отменить',
  cancelled: 'Заявка отменена.',
  useUsername: (username: string) => `Использовать @${username}`,
  stepOf: (n: number, total: number) => `${n} из ${total}`,
  ref: 'Номер заявки',
  /** After «спасибо». A connective phrase, so it lives here to be replaced. */
  welcome: 'Пожалуйста. Появится вопрос — пишите сюда.',
  forwarded: 'Передал.',
  resumed: 'Уведомления включены.',
  tooMany: 'Слишком много заявок за сегодня.',
  failed: 'Не получилось. Попробуйте ещё раз.',
  noAccess: 'Эта команда недоступна.',
  yourId: 'Ваш Telegram ID:',
  from: 'Сообщение от',
  status: 'Статус',
} as const;
