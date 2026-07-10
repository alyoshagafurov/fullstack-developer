/*
 * Case-study data — single source of truth for the Projects section and the
 * /work/[slug] detail pages. Text-first (no screenshots).
 *
 * ▸ TODO (Alisher): replace the placeholder copy, metrics and links below with
 *   your REAL projects. Keep the shape identical — the section and the detail
 *   page update automatically.
 */

export type CaseStudy = {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  liveUrl?: string;
  result: { value: string; label: string };
  problem: string;
  solution: string;
  features: string[];
  stack: string[];
};

export const projects: CaseStudy[] = [
  {
    slug: 'landing',
    index: '01',
    title: 'Продуктовый лендинг',
    category: 'Landing / Brand',
    year: '2025',
    summary:
      'Одностраничный сайт для запуска продукта: чёткая структура, акцент на заявки и быстрая загрузка.',
    liveUrl: '#',
    result: { value: '+63%', label: 'рост заявок после запуска' },
    problem:
      'У продукта не было точки входа, которая за секунды объясняла бы ценность и вела к действию. Старая страница грузилась медленно и не конвертировала трафик из рекламы.',
    solution:
      'Собрал быстрый одностраничник с ясной иерархией: сильный первый экран, блоки выгод, социальное доказательство и заметный призыв к действию. Всё построено на Next.js с оптимизацией изображений и анимациями, которые помогают восприятию, а не отвлекают.',
    features: [
      'Адаптивная вёрстка под все устройства',
      'Оптимизация Core Web Vitals (LCP, CLS)',
      'Формы заявок с валидацией',
      'SEO-разметка и Open Graph',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    slug: 'business',
    index: '02',
    title: 'Корпоративный сайт',
    category: 'Corporate / Multi-page',
    year: '2025',
    summary:
      'Многостраничный сайт компании с продуманной структурой, SEO и формами заявок.',
    liveUrl: '#',
    result: { value: 'ТОП-3', label: 'по ключевым запросам за 3 мес.' },
    problem:
      'Компания была почти невидима в поиске, а сайт не отражал уровень услуг. Клиенты не находили нужную информацию и уходили к конкурентам.',
    solution:
      'Спроектировал понятную структуру страниц под путь клиента, внедрил техническое SEO (метатеги, Schema.org, sitemap) и подключил CMS, чтобы контент можно было обновлять без разработчика.',
    features: [
      'Многостраничная архитектура и навигация',
      'Техническое SEO и микроразметка',
      'CMS для самостоятельного управления контентом',
      'Формы заказа с уведомлениями',
    ],
    stack: ['Next.js', 'TypeScript', 'Headless CMS', 'PostgreSQL', 'Vercel'],
  },
  {
    slug: 'webapp',
    index: '03',
    title: 'Full-Stack веб-приложение',
    category: 'Web App / SaaS',
    year: '2026',
    summary:
      'Индивидуальное решение: админ-панель, база данных, личные кабинеты и бронирование.',
    liveUrl: '#',
    result: { value: '×2', label: 'скорость внутренних процессов' },
    problem:
      'Бизнес вёл заказы и клиентов вручную в таблицах — данные терялись, а команда тратила часы на рутину.',
    solution:
      'Разработал полноценное веб-приложение с авторизацией, ролями, базой данных и админ-панелью. Автоматизировал заявки, бронирование и отчётность — всё в одном интерфейсе, доступном с любого устройства.',
    features: [
      'Авторизация и роли пользователей',
      'Админ-панель и работа с базой данных',
      'Бронирование, заявки, уведомления',
      'REST API и интеграции',
    ],
    stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'Docker'],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
