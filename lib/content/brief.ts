import { z } from 'zod';

/*
 * Block 11 of the owner's answers: the fields he needs before a first call, the
 * project types, budget bands and timelines he offers, and what the client sees
 * after sending. Options are his, in his order and his wording.
 *
 * The zod schema is the single source of truth for the request body. The client
 * form and the /api/lead handler both import it, so a field can never be
 * checked in the browser and skipped on the server.
 */

/** 11.2 */
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

/** 11.3 — сомони, as he set them */
export const budgets = [
  { value: 'До 1 000 сомони', note: 'небольшие задачи, простой сайт' },
  { value: '1 000–2 000 сомони', note: 'Landing Page, небольшой сайт' },
  { value: '3 000–5 000 сомони', note: 'корпоративный сайт, интернет-магазин' },
  { value: '5 000–7 000 сомони', note: 'Web-приложение, CRM, сложный проект' },
  { value: '10 000–30 000+ сомони', note: 'крупные системы, стартапы, индивидуальная разработка' },
  { value: 'Пока не знаю', note: 'обсудим на первом разговоре' },
] as const;

/** 11.4 */
export const timelines = [
  { value: 'До 3–5 дней', note: 'небольшие задачи и простые проекты' },
  { value: '1–2 недели', note: 'Landing Page, Telegram-боты, небольшие сайты' },
  { value: '1–3 недели', note: 'сайты, интернет-магазины, небольшие web-приложения' },
  { value: '2–5 недель', note: 'сложные web-приложения, CRM и MVP' },
  { value: '1–3+ месяца', note: 'крупные и нестандартные проекты' },
] as const;

/** 11.5 */
export const thanksMessage = 'Круто! Ваша идея уже у меня — скоро обсудим, что с ней можно сделать.';

/** 11.6 */
export const consentLabel =
  'Согласен на обработку моих персональных данных для связи по поводу проекта.';

const required = (field: string, min = 2, max = 4000) =>
  z
    .string()
    .trim()
    .min(min, `Заполните поле «${field}»`)
    .max(max, `Слишком длинно для поля «${field}»`);

const optional = (max = 4000) => z.string().trim().max(max).optional().or(z.literal(''));

/**
 * The brief, in the order the owner listed his fields in 11.1.
 *
 * `website` is a honeypot: people never see it and leave it empty, so anything
 * in it came from a bot. `startedAt` carries the moment the form was opened; a
 * submission faster than a person could type is refused.
 */
export const briefSchema = z.object({
  name: required('Имя'),
  company: optional(200),
  email: z.string().trim().email('Проверьте адрес почты').max(320),
  contact: required('Контакт для связи', 2, 200),

  projectType: z.enum(projectTypes),
  budget: z.string().trim().min(1, 'Выберите бюджет').max(120),
  timeline: z.string().trim().min(1, 'Выберите срок').max(120),

  goal: required('Главная цель', 2, 2000),
  description: required('Кратко о проекте', 10, 4000),
  audience: optional(1000),
  features: optional(2000),
  links: optional(1000),
  extra: optional(2000),

  consent: z.literal(true, { message: 'Без согласия я не смогу с вами связаться' }),

  website: z.literal('').optional(),
  startedAt: z.number().int().positive().optional(),
});

export type BriefInput = z.infer<typeof briefSchema>;

/** The steps of the form, so the fields and the progress bar always agree. */
export const briefSteps = [
  { id: 'about', title: 'О вас', fields: ['name', 'company', 'email', 'contact'] },
  { id: 'project', title: 'Проект', fields: ['projectType', 'goal', 'description'] },
  { id: 'shape', title: 'Детали', fields: ['audience', 'features', 'links'] },
  { id: 'frame', title: 'Рамки', fields: ['budget', 'timeline', 'extra', 'consent'] },
] as const;
