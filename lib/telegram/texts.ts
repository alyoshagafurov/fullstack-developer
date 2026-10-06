import { consentLabel, budgets, projectTypes, timelines } from '@/lib/content/brief';
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
 * What a visitor reads first — the owner's own words.
 *
 * The bot does not take the brief itself. Two buttons are links out, to the
 * portfolio and to the owner's own Telegram; the other two open the Mini App,
 * which is the site's own brief and review forms running inside Telegram. The
 * in-bot brief dialogue still exists in bot.ts and still answers, but nothing
 * on this screen opens it any more.
 *
 * The sentence is his, with one item added for the review the fourth button
 * now takes — a greeting that lists three things over four buttons reads as a
 * bug.
 */
export const visitorGreeting =
  'Привет! Я бот aly. Проекты сам не делаю — мне пока доверили только кнопки 😄 ' +
  'Зато могу показать портфолио, отправить к Алишеру в Telegram, ' +
  'помочь оставить заявку и принять отзыв о работе.\n\n' +
  'Выбирай, куда нажать:';

/**
 * What the owner sees on /start and whenever his message matches nothing.
 *
 * It used to be the visitor's text: the owner was told "покажи мне идею, а
 * дальше разберёмся вместе", which is addressed to a client and useless to him.
 * This names what the keyboard underneath actually does, grouped the way its
 * rows are, because that keyboard is persistent and carries no explanation of
 * its own beyond nine button labels.
 */
export const ownerGreeting =
  '<b>Панель владельца.</b> Кнопки внизу работают без команд.\n\n' +
  '<b>Заявки</b>\n' +
  '🔔 новые · 📋 все — покажут списком\n' +
  '👤 карточка · 🔄 статус · 📝 заметка — спросят номер заявки\n\n' +
  '<b>Деньги и цифры</b> — за текущий месяц\n' +
  '📊 статистика · 💰 финансы · 📈 доход\n\n' +
  '<b>⚙️ Настройки</b> — связь с ботом: вебхук, очередь, ошибки\n\n' +
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
  work: '🧩 Заглянуть в мои проекты',
  about: '👤 Познакомиться со мной',
  /** The four on the greeting, in the order the owner listed them. */
  site: '🌐 Посмотреть портфолио',
  dm: '💬 Написать в Telegram',
  /** These two open the Mini App rather than a browser tab. */
  brief: '📝 Оставить заявку',
  review: '⭐ Оставить отзыв',
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
  extra: '💬 Дополнительные пожелания',
  createdAt: '🕐 Дата и время отправки заявки',
  source: '🌐 Источник заявки',
} as const;

/** 14.3 — the buttons under it. */
export const notificationButtons = {
  open: 'Открыть заявку',
  contact: 'Связаться',
  status: 'Изменить статус',
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
  { command: 'start', description: 'Меню' },
  { command: 'new', description: 'Новые заявки' },
  { command: 'waiting', description: 'Ждут ответа' },
  { command: 'work', description: 'В работе' },
  { command: 'leads', description: 'Все заявки' },
  { command: 'lead', description: 'Карточка по номеру: /lead ALY-2026-001' },
  { command: 'money', description: 'Финансы' },
  { command: 'stats', description: 'Статистика' },
  { command: 'id', description: 'Мой Telegram id' },
] as const;

export const ownerMenu = {
  leads: '📋 Мои заявки',
  fresh: '🔔 Новые заявки',
  status: '🔄 Изменить статус',
  note: '📝 Добавить заметку',
  card: '👤 Карточка клиента',
  stats: '📊 Статистика',
  money: '💰 Финансы',
  income: '📈 Доход за месяц',
  settings: '⚙️ Настройки',
} as const;

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
  key:
    | 'name'
    | 'company'
    | 'email'
    | 'contact'
    | 'projectType'
    | 'goal'
    | 'description'
    | 'audience'
    | 'features'
    | 'links'
    | 'budget'
    | 'timeline'
    | 'extra'
    | 'consent';
  label: string;
  hint: string;
  optional?: boolean;
  choices?: readonly string[];
  consent?: boolean;
};

/**
 * The brief, one question per message, in the order of the site's form and
 * with the same labels and hints (block 11).
 */
export const briefSteps: BriefStep[] = [
  { key: 'name', label: 'Как вас зовут', hint: 'Просто имя, этого достаточно.' },
  {
    key: 'company',
    label: 'Компания или проект',
    hint: 'Если названия ещё нет — пропустите.',
    optional: true,
  },
  { key: 'email', label: 'Почта', hint: 'Сюда пришлю ответ и предложение.' },
  { key: 'contact', label: 'Telegram или WhatsApp', hint: 'Так отвечаю быстрее всего.' },
  {
    key: 'projectType',
    label: 'Что нужно сделать',
    hint: 'Выберите, что ближе. Не уверены — берите похожее, на созвоне разберёмся.',
    choices: projectTypes,
  },
  {
    key: 'goal',
    label: 'Что должно измениться после запуска',
    hint: 'Например: «хочу принимать заказы через сайт, а не в переписке» или «клиенты меня не находят в интернете».',
  },
  {
    key: 'description',
    label: 'Расскажите о проекте',
    hint: 'Своими словами: чем занимаетесь, кто ваши клиенты, что уже есть. Двух-трёх предложений хватит.',
  },
  {
    key: 'audience',
    label: 'Кто будет этим пользоваться',
    hint: 'Кто ваши клиенты: чем занимаются, из какого города, сколько им лет.',
    optional: true,
  },
  {
    key: 'features',
    label: 'Что должно уметь',
    hint: 'Например: корзина и оплата картой, личный кабинет, запись на приём, отправка заявки в Telegram.',
    optional: true,
  },
  {
    key: 'links',
    label: 'Что вам нравится',
    hint: 'Ссылки на сайты, которые по душе. Можно просто названия.',
    optional: true,
  },
  {
    key: 'budget',
    label: 'Примерный бюджет',
    hint: 'Это ориентир, а не обязательство. Не знаете — выберите последний пункт.',
    choices: budgets.map((band) => band.value),
  },
  {
    key: 'timeline',
    label: 'Когда хотелось бы запуститься',
    hint: 'Тоже ориентир.',
    choices: timelines.map((band) => band.value),
  },
  { key: 'extra', label: 'Что-нибудь ещё', hint: 'Всё, что не влезло в поля выше.', optional: true },
  { key: 'consent', label: consentLabel, hint: '', consent: true },
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
  forwarded: 'Передал.',
  stopped: 'Уведомления выключены.',
  resumed: 'Уведомления включены.',
  tooMany: 'Слишком много заявок за сегодня.',
  failed: 'Не получилось. Попробуйте ещё раз.',
  noAccess: 'Эта команда недоступна.',
  askRef: 'Номер заявки?',
  askNote: 'Текст заметки:',
  noteSaved: 'Заметка сохранена.',
  notFound: 'Заявка не найдена.',
  nothing: 'Пусто.',
  replied: 'Отмечено: ответил.',
  yourId: 'Ваш Telegram ID:',
  from: 'Сообщение от',
  status: 'Статус',
  note: 'Заметка',
  replied_btn: 'Ответил',
  openAdmin: 'Открыть в админке',
  more: 'Все заявки — в админке.',
} as const;
