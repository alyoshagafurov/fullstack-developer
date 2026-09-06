/*
 * Every string on this site is the owner's own words, taken verbatim from his
 * answers in docs/rebuild/02-ВОПРОСЫ.md. Nothing here is written or rewritten
 * by a model. The comment above each field names the question it came from, so
 * a later edit can be traced back to what he actually said.
 *
 * A field with no answer stays empty and the section that would render it is
 * not built. It is never filled with something plausible.
 */

export const site = {
  /** 1.1 */
  name: 'Алишер Гафуров',
  /** 1.3 — lowercase, always */
  brand: 'aly',
  /** 1.2 */
  role: 'Full-stack разработчик',
  /** 12.2 */
  domain: 'aly.lat',
  url: 'https://aly.lat',

  /** 2.1 — the manifesto, set large */
  statement:
    'Я создаю не сайты, а впечатления — от первого экрана до последней кнопки. Собираю из кода и дизайна продукты, которые выглядят как искусство, а работают как швейцарские часы.',

  /** 2.2 */
  shortStatement: 'Цифровые продукты, с характером',

  /**
   * 2.4 — the single button on the first screen.
   * The answer landed one field down, in 2.5; taken from there.
   */
  heroCta: 'Оставить заявку',

  /** 3.1 — why him rather than an agency or another freelancer */
  why: [
    'Потому что мне важно не просто выполнить задачу, а понять, зачем она бизнесу. Я смотрю на проект глазами владельца: что должно измениться после запуска, как сайт будет продавать и почему пользователь должен доверять. Поэтому я часто предлагаю решения, о которых клиент даже не думал, но которые реально двигают результат.',
    'Потому что я делаю продукты, которые выглядят дороже, чем стоят, и думаю о них как о своём бизнесе. Мне важен результат, а не просто сданный проект.',
  ],

  /** 3.2 — the one concrete difference */
  difference:
    'Собираю продукт целиком: от идеи и дизайна до сервера и запуска — без посредников и передачи «в другие руки».',

  /** 3.3 — what he turns down */
  refuse: [
    'Не берусь за задачи, где сайт нужен «для галочки», а не как инструмент, который должен что-то менять. Если клиенту не важен результат после запуска — нам не по пути.',
    'Стараюсь не брать проекты, где решение уже принято без меня, а от меня ждут просто руки. Я не кодер на подхвате — мне важно участвовать в том, каким продукт будет.',
  ],

  /** 8.1 — real figures only */
  stats: [
    { value: '50+', label: 'проектов на фрилансе' },
    { value: '10+', label: 'технологий' },
    { value: '2 года', label: 'работы разработчиком' },
  ],

  /** 10.1–10.3 */
  contact: {
    email: 'gafurovalyosha@gmail.com',
    telegram: 'alishergafurovv',
    instagram: 'alygafurov',
    phone: '+992 918 79 32 31',
    phoneHref: '+992918793231',
    github: 'https://github.com/alyoshagafurov',
    /** 14.2 — the bot, as Telegram registered it */
    bot: 'alygafurov_bot',
  },

  /** 10.4 */
  hours: 'Пн–Сб, примерно 10:00–23:00. Часовой пояс UTC+5, Душанбе.',
  /** 10.5 */
  responseTime: 'В течение дня',
  /** 10.6 */
  contactInvite: 'Есть идея? Давайте превратим её в что-то настоящее.',

  /** 12.1 */
  footerLegal: '© 2026 aly. Все права защищены.',

  /** 12.3 */
  seo: {
    title: 'aly — Веб-разработчик и создатель цифровых продуктов',
    description:
      'Сайты, приложения и цифровые продукты под реальные задачи — от идеи до готового проекта.',
  },
} as const;

export type Site = typeof site;
