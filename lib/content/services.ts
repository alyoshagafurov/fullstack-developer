/*
 * The fourteen services, verbatim from the owner's answers (block 4 of
 * docs/rebuild/02-ВОПРОСЫ.md). Titles, one-liners, audiences, deliverables,
 * durations and prices are his; nothing is paraphrased.
 *
 * `object` names the studio object that stands for the service in the vitrine
 * and on its own page. Devices go to the services that produce a screen; the
 * sculptural figures carry the ones that do not.
 */

export type Service = {
  num: string;
  slug: string;
  /** 🔴 Название */
  title: string;
  /** 🔴 Одна строка, что это */
  tagline: string;
  /** 🔴 Кому это нужно */
  who: string;
  /** 🔴 Что получает на выходе */
  deliverable: string;
  /** ⚪ Сроки */
  duration?: string;
  /** ⚪ Бюджет */
  budget?: string;
  /** File under /public/objects */
  object: string;
  featured?: boolean;
};

export const services: Service[] = [
  {
    num: '01',
    slug: 'sites',
    title: 'Сайты под ключ',
    tagline: 'Полностью создаю сайт с нуля — от идеи и дизайна до разработки и запуска.',
    who: 'Бизнесу, предпринимателям, экспертам, личным брендам и компаниям.',
    deliverable:
      'Готовый сайт с дизайном, адаптивом, анимациями, необходимым функционалом, формами, интеграциями и публикацией.',
    duration: '1–2 недели',
    budget: 'От 2 000 сомони',
    object: '/objects/laptop.webp',
    featured: true,
  },
  {
    num: '02',
    slug: 'landing',
    title: 'Landing Pages',
    tagline:
      'Одностраничный сайт, который быстро и понятно презентует продукт и приводит клиента к действию.',
    who: 'Бизнесу, экспертам, новым продуктам, рекламным кампаниям и мероприятиям.',
    deliverable:
      'Уникальный дизайн, адаптивная версия, анимации, формы заявок, подключение аналитики и готовый опубликованный лендинг.',
    duration: '4–6 дней',
    budget: 'От 700 сомони',
    object: '/objects/phone.webp',
  },
  {
    num: '03',
    slug: 'corporate',
    title: 'Корпоративные сайты',
    tagline:
      'Полноценный сайт компании, который представляет бизнес, услуги, команду и помогает получать клиентов.',
    who: 'Компаниям и организациям, которым нужен серьёзный онлайн-представитель.',
    deliverable:
      'Главная, страницы услуг, о компании, команда, проекты, контакты, блог при необходимости, админка и другие нужные разделы.',
    duration: '1–3 недели',
    budget: 'От 5 000 сомони',
    object: '/objects/fig-stack.webp',
  },
  {
    num: '04',
    slug: 'ecommerce',
    title: 'Интернет-магазины',
    tagline: 'Онлайн-магазин, где клиент может выбрать товар, оформить заказ и оставить свои данные.',
    who: 'Магазинам, брендам и предпринимателям, которые хотят продавать товары онлайн.',
    deliverable:
      'Каталог, категории, поиск, карточки товаров, корзина, оформление заказа, личный кабинет при необходимости, админ-панель и адаптив.',
    duration: '1–3 недели',
    budget: 'От 5 000 сомони',
    object: '/objects/tablet-phone.webp',
  },
  {
    num: '05',
    slug: 'web-apps',
    title: 'Web-приложения',
    tagline:
      'Создаю полноценные онлайн-сервисы, которыми пользователи могут пользоваться как отдельным продуктом.',
    who: 'Стартапам, бизнесу и предпринимателям со своей идеей сервиса.',
    deliverable:
      'Интерфейс, frontend, backend, база данных, авторизация, личные кабинеты, роли пользователей и нужный функционал.',
    duration: 'От 2–5 недель',
    budget: 'От 7 000 сомони',
    object: '/objects/cluster.webp',
    featured: true,
  },
  {
    num: '06',
    slug: 'crm',
    title: 'CRM-системы',
    tagline:
      'Создаю CRM под конкретные процессы бизнеса, а не заставляю бизнес подстраиваться под готовую систему.',
    who: 'Компаниям, отделам продаж и бизнесам с большим количеством клиентов и заявок.',
    deliverable:
      'Клиенты, заявки, сделки, статусы, сотрудники, роли, задачи, уведомления, аналитика и другие нужные функции.',
    duration: '2–3 недели',
    budget: 'От 5 000 сомони',
    object: '/objects/fig-cube.webp',
  },
  {
    num: '07',
    slug: 'automation',
    title: 'Автоматизация',
    tagline: 'Убираю лишнюю ручную работу и связываю процессы бизнеса между собой.',
    who: 'Бизнесу, где сотрудники постоянно повторяют одни и те же действия вручную.',
    deliverable:
      'Автоматические заявки, уведомления, обработка данных, интеграции между сервисами, боты и другие решения под конкретный процесс.',
    duration: 'От нескольких дней до недели',
    budget: 'От 700 сомони',
    object: '/objects/fig-ring.webp',
  },
  {
    num: '08',
    slug: 'redesign',
    title: 'Редизайн',
    tagline: 'Беру существующий сайт или приложение и полностью обновляю его внешний вид и удобство.',
    who: 'Бизнесу с устаревшим, неудобным или визуально слабым продуктом.',
    deliverable:
      'Новый дизайн, улучшенную структуру, адаптив, современный UI и при необходимости новую версию самого сайта.',
    duration: '1–2 недели',
    budget: 'От 2 000 сомони',
    object: '/objects/fig-ribbon.webp',
  },
  {
    num: '09',
    slug: 'mvp',
    title: 'MVP стартапов',
    tagline: 'Помогаю быстро превратить идею стартапа в первую рабочую версию продукта.',
    who: 'Основателям стартапов и предпринимателям, которые хотят проверить идею на реальных пользователях.',
    deliverable:
      'Рабочий продукт с основными функциями, необходимыми для первого запуска и проверки идеи.',
    duration: 'От 2–4 недель',
    budget: 'От 7 000 сомони',
    object: '/objects/display.webp',
    featured: true,
  },
  {
    num: '10',
    slug: 'support',
    title: 'Поддержка и развитие',
    tagline:
      'Продолжаю работать с проектом после запуска — исправляю, улучшаю и добавляю новые функции.',
    who: 'Владельцам сайтов, приложений и цифровых продуктов.',
    deliverable:
      'Исправления, обновления, новые функции, оптимизацию, техническую поддержку и дальнейшее развитие проекта.',
    duration: 'Постоянно или по отдельным задачам',
    budget: 'Отдельно рассчитывается под задачу',
    object: '/objects/fig-sphere.webp',
  },
  {
    num: '11',
    slug: 'android',
    title: 'Android Apps',
    tagline: 'Разрабатываю мобильные приложения под Android с нуля.',
    who: 'Бизнесу, стартапам и сервисам, которым нужен собственный мобильный продукт.',
    deliverable:
      'Готовое Android-приложение с нужным функционалом, дизайном, backend-интеграциями и подготовкой к публикации.',
    duration: 'От 2 недель',
    budget: 'От 7 000 сомони',
    object: '/objects/phone-watch.webp',
  },
  {
    num: '12',
    slug: 'ios',
    title: 'iOS Apps',
    tagline: 'Разрабатываю мобильные приложения для iPhone и iPad.',
    who: 'Бизнесу, стартапам и сервисам, которым нужен мобильный продукт для пользователей Apple.',
    deliverable:
      'Готовое iOS-приложение, подключение backend, необходимые функции и подготовка к публикации в App Store.',
    duration: 'От 2 недель',
    budget: 'От 7 000 сомони',
    object: '/objects/phone.webp',
  },
  {
    num: '13',
    slug: 'telegram-bots',
    title: 'Telegram Bots',
    tagline:
      'Создаю Telegram-ботов, которые могут общаться с клиентами и выполнять задачи автоматически.',
    who: 'Бизнесу, сервисам, сообществам и предпринимателям.',
    deliverable:
      'Бот с командами, меню, заявками, базой данных, уведомлениями, интеграциями и нужной логикой.',
    duration: 'От 3 дней до 2 недель',
    budget: 'От 700 сомони',
    object: '/objects/fig-prism.webp',
  },
  {
    num: '14',
    slug: 'telegram-mini-apps',
    title: 'Telegram Mini Apps',
    tagline: 'Создаю полноценные мини-приложения, которые открываются прямо внутри Telegram.',
    who: 'Стартапам, бизнесу, сервисам и проектам, которые хотят дать пользователю полноценный интерфейс прямо в Telegram.',
    deliverable:
      'Интерфейс Mini App, frontend, backend, база данных, авторизация через Telegram и необходимый функционал.',
    duration: 'От 1–2 недель',
    budget: 'От 3 000 сомони',
    object: '/objects/tablet-phone.webp',
  },
];

/** 4.9 — the three he named as his main ones. */
export const featuredServices = services.filter((s) => s.featured);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
