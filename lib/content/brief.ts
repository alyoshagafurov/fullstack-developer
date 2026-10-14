import { z } from 'zod';

/*
 * The request form, as the owner cut it down: a name, one way to reach the
 * person, what they need, and a few lines about it — budget only if they want.
 * Four screens, the same on the site, in the Telegram Mini App and in the bot.
 *
 * The zod schema is the single source of truth for the request body. The forms
 * and /api/lead both import it, so a field can never be checked in the browser
 * and skipped on the server.
 *
 * The Lead table keeps its old columns (the database is shared and is never
 * pushed to — see prisma/schema.prisma), so `createLead` maps these answers
 * onto them: the way to reach them goes to `contact` ("Telegram: @name"), an
 * email address also to `email`, what they need to `description`, their
 * questions to `extra`.
 */

/** 11.2 — the owner's list, his order and his wording. Stored as written. */
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
] as const;

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
    name: z.string().trim().min(2, 'Как вас зовут?').max(120, 'Слишком длинное имя'),
    contactMethod: z.enum(contactMethods, { message: 'Выберите, где вам ответить' }),
    contact: z.string().trim().min(1, contactMessages.required).max(200, 'Слишком длинно'),
    projectType: z.enum(projectTypes, { message: 'Выберите, что нужно' }),
    details: z
      .string()
      .trim()
      .min(5, 'Напишите хотя бы пару слов о том, что нужно')
      .max(4000, 'Слишком длинно — до 4000 знаков'),
    questions: z.string().trim().max(2000, 'Слишком длинно').optional().or(z.literal('')),
    budget: z.string().trim().max(200, 'Слишком длинно').optional().or(z.literal('')),

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

/** Which screen each field is asked on, so a server complaint lands on the right one. */
export const briefStepOf: Record<string, number> = {
  name: 0,
  contactMethod: 1,
  contact: 1,
  projectType: 2,
  details: 3,
  questions: 3,
  budget: 3,
};

export const BRIEF_SCREENS = 4;

/*
 * Every word the form says, in one shape. The site's English lives in
 * lib/i18n/en.ts; the Russian is here, because the Mini App and the bot ask
 * in Russian too and must say exactly what the site says.
 */
export type BriefCopy = {
  name: { question: string; hint: string; placeholder: string };
  contact: { question: string; hint: string };
  methods: Record<ContactMethod, { label: string; placeholder: string }>;
  projectType: { question: string; hint: string };
  options: Record<string, { label: string }>;
  details: { question: string; hint: string };
  fields: {
    details: { label: string; placeholder: string };
    questions: { label: string; placeholder: string };
    budget: { label: string; placeholder: string };
  };
  optional: string;
  note: string;
  errors: Record<ContactProblem | 'name' | 'method' | 'type' | 'details' | 'check' | 'failed' | 'offline', string>;
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
  };
};

export const briefCopyRu: BriefCopy = {
  name: { question: 'Как вас зовут?', hint: 'Просто имя, этого достаточно.', placeholder: 'Алишер' },
  contact: {
    question: 'Где вам ответить?',
    hint: 'Выберите, где удобнее, и оставьте контакт.',
  },
  methods: {
    Telegram: { label: 'Telegram', placeholder: '@username' },
    WhatsApp: { label: 'WhatsApp', placeholder: '+992 900 00 00 00' },
    Instagram: { label: 'Instagram', placeholder: '@username' },
    Email: { label: 'Почта', placeholder: 'name@gmail.com' },
    Телефон: { label: 'Телефон', placeholder: '+992 900 00 00 00' },
  },
  projectType: {
    question: 'Что нужно сделать?',
    hint: 'Выберите, что ближе. Не уверены — берите похожее, разберёмся.',
  },
  options: Object.fromEntries(projectTypes.map((value) => [value, { label: value }])),
  details: {
    question: 'Расскажите, что нужно',
    hint: 'Своими словами. Можно коротко.',
  },
  fields: {
    details: {
      label: 'Что нужно сделать',
      placeholder: 'Например: сайт для кофейни, чтобы принимать заказы онлайн',
    },
    questions: { label: 'Ваши вопросы', placeholder: 'Если хотите что-то спросить' },
    budget: { label: 'Бюджет', placeholder: 'Например: 3 000 сомони' },
  },
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
    details: 'Напишите хотя бы пару слов о том, что нужно',
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
    trackChat: 'Номер и код я отправил вам в чат.',
  },
};
