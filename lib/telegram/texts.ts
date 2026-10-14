import { briefCopyRu, contactMethods, projectTypes } from '@/lib/content/brief';
import type { LeadStatusName } from '@/lib/content/finance';

/*
 * Everything the bot says, in the owner's words.
 *
 * Block 14 of docs/rebuild/02-ВОПРОСЫ.md, verbatim, plus the field labels and
 * hints of the brief form, which are his too. The handful of connective
 * phrases that no answer covers are gathered in `glue` at the bottom so they
 * can be found and replaced in one place.
 */

/**
 * What a visitor reads first.
 *
 * It opens on the owner's own joke and keeps it, emoji included — that line is
 * the voice of the whole bot, and his design notes rule out emoji as
 * navigation, not in a sentence. What changed is everything after it. The old
 * text listed what the bot could do and asked the visitor to pick; a stranger
 * deciding whether to trust a developer needs, in order, who he is, what he
 * makes, that he has done it before, and roughly what it costs. All four are
 * his own words or his own figures: the description and the difference from
 * site.ts, the project count from its stats, the prices from the price list.
 *
 * The prices are passed in rather than written here, because he edits them in
 * the admin; a greeting quoting last month's landing price would be the bot
 * contradicting the site. When a price is missing — hidden, or the database
 * unreachable — its clause is simply left out.
 */
export function visitorGreeting(prices: { landing: string | null; sites: string | null }): string {
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  const quoted = [
    prices.landing ? `Лендинг — ${lower(prices.landing)}` : null,
    prices.sites ? `сайт под ключ — ${lower(prices.sites)}` : null,
  ].filter(Boolean);

  return [
    'Привет! Я бот aly. Проекты сам не делаю — мне пока доверили только кнопки 😄',
    '',
    'Делает их Алишер Гафуров, full-stack разработчик из Душанбе: сайты, интернет-магазины, веб-приложения и Telegram-боты — вот такие, как я. От идеи и дизайна до сервера и запуска, без посредников.',
    '',
    `50+ проектов на фрилансе.${quoted.length ? ` ${quoted.join(', ')}.` : ''}`,
    'Отвечает в течение дня, Пн–Сб.',
    '',
    'Выбирай, куда нажать — или просто спроси, сколько стоит то, что нужно.',
  ].join('\n');
}

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
  site: 'Сайт',
  /*
   * The greeting's buttons. No emoji: they are navigation, and a row of
   * pictograms reads as a menu rather than as the five things a visitor
   * actually came for.
   */
  brief: 'Оставить заявку',
  work: 'Работы',
  dm: 'Написать Алишеру',
  status: 'Статус проекта',
  review: 'Оставить отзыв',
  prices: 'Все цены',
} as const;

/** 14.7 — sent the moment a brief is stored. */
export const confirmation = 'Получил вашу заявку, скоро свяжусь с вами.';

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
  { command: 'start', description: 'Начать' },
  { command: 'status', description: 'Узнать, на каком этапе мой проект' },
  { command: 'stop', description: 'Отключить уведомления' },
] as const;

export const ownerCommands = [
  { command: 'start', description: 'Панель' },
  { command: 'panel', description: 'Открыть админку' },
  { command: 'id', description: 'Мой Telegram id' },
] as const;

/** 14.6 — a status, as the client is allowed to see it. */
export const clientStatusLine: Record<LeadStatusName, string> = {
  NEW: '📨 Заявка получена — я получил вашу заявку',
  CONTACTED: '💬 Обсуждаем проект — уточняем детали и пожелания',
  DISCOVERY: '🧠 Продумываем решение — определяем структуру, дизайн и функционал',
  PROPOSAL: '📄 Готовим предложение — согласовываем стоимость и сроки',
  IN_PROGRESS: '🛠️ Проект в работе — идёт разработка',
  COMPLETED: '🚀 Готово! — проект завершён и готов к запуску',
  ON_HOLD: '⏸️ Пауза — работа временно приостановлена',
  DECLINED: '❌ Проект закрыт — работа по проекту завершена без запуска',
  CANCELLED: '❌ Проект закрыт — работа по проекту завершена без запуска',
};

export type BriefStep = {
  key: 'name' | 'contactMethod' | 'contact' | 'projectType' | 'details' | 'questions' | 'budget';
  label: string;
  hint: string;
  optional?: boolean;
  choices?: readonly string[];
  consent?: boolean;
};

/**
 * The request, one question per message — the same short form as the site and
 * the Mini App, in the same words (lib/content/brief.ts).
 */
const c = briefCopyRu;
export const briefSteps: BriefStep[] = [
  { key: 'name', label: c.name.question, hint: c.name.hint },
  { key: 'contactMethod', label: c.contact.question, hint: c.contact.hint, choices: contactMethods },
  { key: 'contact', label: 'Ваш контакт', hint: 'Ник, номер или почта — куда вам написать.' },
  { key: 'projectType', label: c.projectType.question, hint: c.projectType.hint, choices: projectTypes },
  { key: 'details', label: c.fields.details.label, hint: c.details.hint },
  { key: 'questions', label: c.fields.questions.label, hint: c.fields.questions.placeholder, optional: true },
  { key: 'budget', label: c.fields.budget.label, hint: c.fields.budget.placeholder, optional: true },
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
  code: 'Код для проверки статуса',
  statusHow: 'Чтобы узнать статус проекта, пришлите номер заявки и код одной строкой.',
  statusAsk: 'Номер заявки и код:',
  updated: 'Обновлено',
  /** After «спасибо». A connective phrase, so it lives here to be replaced. */
  welcome: 'Пожалуйста! Если появится вопрос — пишите.',
  forwarded: 'Передал.',
  stopped: 'Уведомления выключены.',
  resumed: 'Уведомления включены.',
  tooMany: 'Слишком много заявок за сегодня.',
  failed: 'Не получилось. Попробуйте ещё раз.',
  noAccess: 'Эта команда недоступна.',
  notFound: 'Заявка не найдена.',
  yourId: 'Ваш Telegram ID:',
  from: 'Сообщение от',
  status: 'Статус',
} as const;
