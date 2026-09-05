/*
 * The vocabulary of the owner's business, from his answers in block 13.
 *
 * Currencies and expense categories are his list, not a table: they describe
 * how he works, and a screen that let him invent a twelfth category on the fly
 * would quietly turn his reporting into free text.
 */

/** 13.3 — the three he works in. Never summed together without a rate he set. */
export const currencies = ['TJS', 'RUB', 'USD'] as const;
export type Currency = (typeof currencies)[number];

export const currencyLabel: Record<Currency, string> = {
  TJS: 'сомони',
  RUB: '₽',
  USD: '$',
};

/** 13.4 — the eleven costs he actually has. */
export const expenseCategories = [
  'Хостинг и серверы',
  'Домены',
  'Сервисы и подписки для разработки',
  'AI-сервисы и инструменты',
  'Реклама и продвижение',
  'Дизайн и платные материалы',
  'Подрядчики и другие специалисты',
  'Техника и оборудование',
  'Обучение и курсы',
  'Комиссии банков и сервисов',
  'Налоги и другие обязательные расходы',
] as const;

/** 13.2 — his chain, plus the three exits he added. */
export const leadStatuses = [
  'NEW',
  'CONTACTED',
  'DISCOVERY',
  'PROPOSAL',
  'IN_PROGRESS',
  'COMPLETED',
  'ON_HOLD',
  'DECLINED',
  'CANCELLED',
] as const;
export type LeadStatusName = (typeof leadStatuses)[number];

/** How the owner sees a status inside the admin. */
export const statusLabel: Record<LeadStatusName, string> = {
  NEW: 'Новая',
  CONTACTED: 'Связался',
  DISCOVERY: 'Обсуждаем',
  PROPOSAL: 'Предложение',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершён',
  ON_HOLD: 'На паузе',
  DECLINED: 'Отказ',
  CANCELLED: 'Отменён',
};

/**
 * 14.6 — how the client sees the same status through the bot.
 * Kept beside the internal labels on purpose: the two must never drift, and a
 * client must never be shown the owner's word for their own project.
 */
export const clientStatusLabel: Record<LeadStatusName, string> = {
  NEW: 'Заявка получена',
  CONTACTED: 'Обсуждаем проект',
  DISCOVERY: 'Продумываем решение',
  PROPOSAL: 'Готовим предложение',
  IN_PROGRESS: 'Проект в работе',
  COMPLETED: 'Готово',
  ON_HOLD: 'Пауза',
  DECLINED: 'Проект закрыт',
  CANCELLED: 'Проект закрыт',
};

/** The path a live deal walks. The three exits are not part of it. */
export const activePipeline: LeadStatusName[] = [
  'NEW',
  'CONTACTED',
  'DISCOVERY',
  'PROPOSAL',
  'IN_PROGRESS',
  'COMPLETED',
];

/** Statuses that mean work is happening right now. */
export const workingStatuses: LeadStatusName[] = ['IN_PROGRESS'];

/** Statuses that closed without a project. */
export const lostStatuses: LeadStatusName[] = ['DECLINED', 'CANCELLED'];

export const paymentKinds = ['PREPAYMENT', 'STAGE', 'FINAL', 'SUPPORT'] as const;
export const paymentKindLabel: Record<(typeof paymentKinds)[number], string> = {
  PREPAYMENT: 'Предоплата',
  STAGE: 'Этап',
  FINAL: 'Финальный платёж',
  SUPPORT: 'Поддержка',
};

/** 13.7 — the periods he asked to see. */
export const periods = [
  { id: 'week', label: 'Неделя', days: 7 },
  { id: 'month', label: 'Месяц', days: 30 },
  { id: 'year', label: 'Год', days: 365 },
  { id: 'all', label: 'Всё время', days: 0 },
] as const;
export type PeriodId = (typeof periods)[number]['id'];

export function periodStart(id: PeriodId): Date | undefined {
  const period = periods.find((p) => p.id === id);
  if (!period || period.days === 0) return undefined;
  return new Date(Date.now() - period.days * 24 * 60 * 60 * 1000);
}

/** Money is formatted, never rounded away. Groups of three, no decimals. */
export function money(amount: number, currency: string): string {
  const grouped = Math.round(amount).toLocaleString('ru-RU');
  const suffix = currencyLabel[currency as Currency] ?? currency;
  return `${grouped} ${suffix}`;
}
