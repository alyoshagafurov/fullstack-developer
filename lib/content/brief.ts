import { z } from 'zod';
import { PROMISE } from '@/lib/content/site';

/*
 * The request form, in the order the owner set (2026-11-24): what they need,
 * a few lines about it (optional), what matters most right now, a budget
 * range, and only then a name and where to reply. Five screens, the same on
 * the site and in the Telegram Mini App. Asking for contacts last is the
 * point: by then the visitor has already told their story and is invested in
 * sending it.
 *
 * The zod schema is the single source of truth for the request body. The forms
 * and /api/lead both import it, so a field can never be checked in the browser
 * and skipped on the server. The bot's older one-message-per-question dialogue
 * validates against the same schema, which is why the newer answers (priority)
 * are optional here and required only by the forms.
 *
 * The Lead table keeps its old columns (the database is shared and is never
 * pushed to — see prisma/schema.prisma), so `createLead` maps these answers
 * onto them: the way to reach them goes to `contact` ("Telegram: @name"), an
 * email address also to `email`, what they need to `description`, their
 * questions to `extra`, what matters most to `goal`, the budget range to
 * `budget`.
 */

/**
 * Every project type the request accepts — 11.2, the owner's list, his order
 * and his wording, stored as written. Old links (startHref(lang, type)) and
 * saved leads may hold any of these, so none is ever taken out. The forms and
 * the bot offer only `briefTypes` below.
 */
export const projectTypes = [
  'Сайт',
  'Landing Page',
  'Корпоративный сайт',
  'Интернет-магазин',
  'Web-приложение',
  'CRM-система',
  'Автоматизация',
  'Редизайн',
  'MVP стартапа',
  'Android-приложение',
  'iOS-приложение',
  'Telegram-бот',
  'Telegram Mini App',
  'Поддержка и развитие',
  'Не знаю',
] as const;
export type ProjectType = (typeof projectTypes)[number];

/** The seven the forms offer on their first screen, in the owner's order. */
export const briefTypes = [
  'Сайт',
  'Landing Page',
  'Корпоративный сайт',
  'Интернет-магазин',
  'Web-приложение',
  'Telegram-бот',
  'Не знаю',
] as const satisfies readonly ProjectType[];

/** «Что для вас сейчас важнее?» — one of three, stored as written on `Lead.goal`. */
export const priorities = ['Скорость', 'Качество', 'Цена'] as const;
export type Priority = (typeof priorities)[number];

export const isPriority = (value: string | null | undefined): value is Priority =>
  (priorities as readonly string[]).includes(value ?? '');

/**
 * The budget, as ranges rather than an empty box: a blank field with an
 * example amount anchors people to the example. Stored as written on
 * `Lead.budget`. The schema still takes free text, for the bot's typed answer.
 */
export const budgetRanges = ['до 3 000 сомони', '3 000–7 000 сомони', '7 000–15 000 сомони', 'Пока не знаю'] as const;
export type BudgetRange = (typeof budgetRanges)[number];

/** Where the person wants to be answered. Stored as written here. */
export const contactMethods = ['Telegram', 'WhatsApp', 'Instagram', 'Email', 'Телефон'] as const;
export type ContactMethod = (typeof contactMethods)[number];

/** What is wrong with a contact, if anything — worded by whoever shows it. */
export type ContactProblem = 'required' | 'email' | 'phone' | 'short';

export function checkContact(method: string, raw: string): ContactProblem | null {
  const value = raw.trim();
  if (!value) return 'required';
  if (method === 'Email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'email';
  if (method === 'WhatsApp' || method === 'Телефон') {
    return value.replace(/\D/g, '').length >= 7 ? null : 'phone';
  }
  return value.replace(/^@/, '').length >= 3 ? null : 'short';
}

/** A link that opens the contact, for the admin and the owner's notification. */
export function contactHref(method: string, raw: string): string | null {
  const value = raw.trim();
  const handle = value.replace(/^@/, '').replace(/^https?:\/\/(www\.)?[^/]+\//, '');
  const digits = value.replace(/\D/g, '');
  switch (method) {
    case 'Telegram':
      return `https://t.me/${handle}`;
    case 'Instagram':
      return `https://instagram.com/${handle}`;
    case 'WhatsApp':
      return digits ? `https://wa.me/${digits}` : null;
    case 'Телефон':
      return digits ? `tel:+${digits}` : null;
    case 'Email':
      return `mailto:${value}`;
    default:
      return null;
  }
}

/** How a contact is stored on the lead: "Telegram: @name". */
export const formatContact = (method: string, value: string) => `${method}: ${value.trim()}`;

/** The reverse, for leads written either way — old ones hold a bare handle. */
export function parseContact(stored: string | null): { method: string; value: string } | null {
  if (!stored) return null;
  const match = /^([^:]{2,20}):\s*(.+)$/.exec(stored);
  if (match && (contactMethods as readonly string[]).includes(match[1])) {
    return { method: match[1], value: match[2] };
  }
  const value = stored.trim();
  return { method: value.startsWith('+') ? 'Телефон' : 'Telegram', value };
}

export const contactMessages: Record<ContactProblem, string> = {
  required: 'Оставьте контакт',
  email: 'Кажется, в адресе почты опечатка',
  phone: 'Проверьте номер — в нём мало цифр',
  short: 'Слишком коротко для имени пользователя',
};

export const briefSchema = z
  .object({
    projectType: z.enum(projectTypes, { message: 'Выберите, что нужно' }),
    /** Optional since 2026-11-24: the owner would rather have the request than the paragraph. */
    details: z.string().trim().max(4000, 'Слишком длинно — до 4000 знаков').optional().or(z.literal('')),
    questions: z.string().trim().max(2000, 'Слишком длинно').optional().or(z.literal('')),
    /** Required by the forms, optional here so the bot's older dialogue still validates. */
    priority: z.union([z.enum(priorities), z.literal('')], { message: 'Выберите, что важнее' }).optional(),
    budget: z.string().trim().max(200, 'Слишком длинно').optional().or(z.literal('')),
    name: z.string().trim().min(2, 'Как вас зовут?').max(120, 'Слишком длинное имя'),
    contactMethod: z.enum(contactMethods, { message: 'Выберите, где вам ответить' }),
    contact: z.string().trim().min(1, contactMessages.required).max(200, 'Слишком длинно'),

    /** A honeypot: people never see it and leave it empty. */
    website: z.literal('').optional(),
    /** When the form was opened; faster than a person could type is refused. */
    startedAt: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    const problem = checkContact(data.contactMethod, data.contact);
    if (problem) ctx.addIssue({ code: 'custom', path: ['contact'], message: contactMessages[problem] });
  });

export type BriefInput = z.infer<typeof briefSchema>;

/**
 * Screens, in order: 0 what they need · 1 a few lines and questions · 2 what
 * matters most · 3 budget · 4 name and where to reply.
 */
export const BRIEF_SCREENS = 5;

/** Which screen each field is asked on, so a server complaint lands on the right one. */
export const briefStepOf: Record<string, number> = {
  projectType: 0,
  details: 1,
  questions: 1,
  priority: 2,
  budget: 3,
  name: 4,
  contactMethod: 4,
  contact: 4,
};

/*
 * Every word the form says, in one shape. The site's English lives in
 * lib/i18n/en.ts; the Russian is here, because the Mini App and the bot ask
 * in Russian too and must say exactly what the site says.
 */
export type BriefCopy = {
  projectType: { question: string; hint: string };
  options: Record<string, { label: string }>;
  details: { question: string; hint: string };
  fields: {
    details: { label: string; placeholder: string };
    questions: { label: string; placeholder: string };
  };
  priority: { question: string; hint: string };
  priorities: Record<Priority, { label: string; note: string }>;
  budget: { question: string; hint: string };
  budgets: Record<BudgetRange, { label: string }>;
  /** The last screen: a name and where to reply, together. */
  reply: { question: string; hint: string };
  name: { question: string; label: string; hint: string; placeholder: string };
  contact: { question: string; label: string; hint: string };
  methods: Record<ContactMethod, { label: string; placeholder: string }>;
  /** Label of the thin strip above the questions; the value is in placeholders-forms.ts. */
  lastProject: string;
  /** The main promise, from PROMISE in site.ts — one line above the send button. */
  promise: string;
  /** The step counter's word: «2 из 5». */
  of: string;
  optional: string;
  note: string;
  errors: Record<ContactProblem | 'name' | 'method' | 'type' | 'priority' | 'budget' | 'check' | 'failed' | 'offline', string>;
  next: string;
  back: string;
  send: string;
  sending: string;
  honeypot: string;
  done: {
    title: string;
    message: string;
    prices: string;
    work: string;
    refLabel: string;
    codeLabel: string;
    track: string;
    trackChat: string;
    /** The Mini App's screen after sending: «Готово!» over his photo… */
    ready: string;
    /** …the line under it… */
    personal: string;
    /** …and the one button, to the cases. */
    latest: string;
    close: string;
  };
};

export const briefCopyRu: BriefCopy = {
  projectType: {
    question: 'Что нужно сделать?',
    hint: 'Выберите, что ближе. Не уверены — нажмите «Не знаю», подскажу.',
  },
  options: Object.fromEntries(projectTypes.map((value) => [value, { label: value }])),
  details: {
    question: 'Расскажите, что нужно',
    hint: 'Своими словами, можно коротко. Или пропустите — обсудим в переписке.',
  },
  fields: {
    details: {
      label: 'Что нужно сделать',
      placeholder: 'Например: сайт для кофейни, чтобы принимать заказы онлайн',
    },
    questions: { label: 'Ваши вопросы', placeholder: 'Если хотите что-то спросить' },
  },
  priority: {
    question: 'Что для вас сейчас важнее?',
    hint: 'Одно, главное. Так я пойму, с чего начать.',
  },
  priorities: {
    Скорость: { label: 'Скорость', note: 'Запуститься как можно скорее' },
    Качество: { label: 'Качество', note: 'Чтобы было не стыдно показать' },
    Цена: { label: 'Цена', note: 'Уложиться в бюджет' },
  },
  budget: {
    question: 'Какой бюджет?',
    hint: 'Примерно — чтобы предложить решение, которое в него впишется.',
  },
  budgets: {
    'до 3 000 сомони': { label: 'до 3 000 сомони' },
    '3 000–7 000 сомони': { label: '3 000–7 000 сомони' },
    '7 000–15 000 сомони': { label: '7 000–15 000 сомони' },
    'Пока не знаю': { label: 'Пока не знаю' },
  },
  reply: {
    question: 'Куда вам ответить?',
    hint: 'Отвечаю лично, в течение дня.',
  },
  name: {
    question: 'Как вас зовут?',
    label: 'Как вас зовут',
    hint: 'Просто имя, этого достаточно.',
    placeholder: 'Ваше имя',
  },
  contact: {
    question: 'Где вам ответить?',
    label: 'Где удобнее ответить',
    hint: 'Выберите, где удобнее, и оставьте контакт.',
  },
  methods: {
    Telegram: { label: 'Telegram', placeholder: '@username' },
    WhatsApp: { label: 'WhatsApp', placeholder: '+992 900 00 00 00' },
    Instagram: { label: 'Instagram', placeholder: '@username' },
    Email: { label: 'Почта', placeholder: 'name@gmail.com' },
    Телефон: { label: 'Телефон', placeholder: '+992 900 00 00 00' },
  },
  lastProject: 'Последний проект',
  promise: PROMISE.full,
  of: 'из',
  optional: 'необязательно',
  note: 'Отправляя заявку, вы соглашаетесь, что я свяжусь с вами по этому проекту.',
  errors: {
    name: 'Как вас зовут?',
    method: 'Выберите, где вам ответить',
    required: contactMessages.required,
    email: contactMessages.email,
    phone: contactMessages.phone,
    short: contactMessages.short,
    type: 'Выберите, что нужно',
    priority: 'Выберите, что важнее',
    budget: 'Выберите бюджет — можно «Пока не знаю»',
    check: 'Проверьте этот ответ',
    failed: 'Не получилось отправить. Попробуйте ещё раз.',
    offline: 'Интернет пропал. Проверьте связь и нажмите ещё раз.',
  },
  next: 'Дальше',
  back: 'Назад',
  send: 'Отправить заявку',
  sending: 'Отправляю…',
  honeypot: 'Не заполняйте это поле',
  done: {
    title: 'Спасибо! Заявка у меня.',
    message: 'Я уже взялся за ваш проект: прочитаю всё внимательно и отвечу в течение дня.',
    prices: 'Посмотреть цены',
    work: 'Посмотреть кейсы',
    refLabel: 'Номер заявки',
    codeLabel: 'Код для бота',
    track: 'Статус можно узнать у бота в Telegram',
    trackChat: 'Номер заявки пришёл вам в чат с ботом — туда же придут новости о проекте.',
    ready: 'Готово!',
    personal: 'Я лично прочитаю заявку и напишу вам сегодня.',
    latest: 'Пока посмотрите 3 последних проекта',
    close: 'Закрыть',
  },
};
