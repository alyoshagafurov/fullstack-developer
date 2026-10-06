/*
 * What a visitor's message is about, worked out without a language model.
 *
 * Until this file existed every free-text message took the same road: relayed
 * to the owner, with "Передал. Отвечаю в течение дня." sent back. Someone who
 * asked how much a landing page costs waited a day for a number that was
 * sitting in lib/content/services.ts the whole time. Most of what people type
 * into a developer's bot is one of a dozen questions, and the answers to all of
 * them are already written down — prices, timings, how payment works, who he is.
 *
 * So this file reads the message and says which question it is. It decides
 * nothing about the answer: that is assembled in bot.ts from the owner's own
 * content, and anything this file cannot place is still relayed exactly as
 * before. Getting it wrong costs more than not answering — a bot that quotes a
 * landing price at someone asking about Tilda looks foolish and speaks for the
 * owner — so when in doubt it says `forward`.
 *
 * Three traps shaped the code below, and all three are invisible in a quick
 * test with tidy phrases:
 *
 *   `\b` does not work on Cyrillic in JavaScript, even with the `u` flag: a
 *   word boundary is defined over ASCII word characters. So nothing here
 *   searches a string; the text is split into words and words are compared.
 *
 *   The short stems hide inside other words. «цен» is in «оценка», «бот» is in
 *   «работа» and «суббота», «пример» is in «например», «стоит» is in «не
 *   стоит». Every trigger is a whole word or a deliberately chosen prefix.
 *
 *   People negate. «не лендинг, а многостраничник», «без магазина», «сайт уже
 *   есть». A service preceded by не/без/нет/кроме is not the one they want.
 */

export type ServiceSlug =
  | 'sites'
  | 'landing'
  | 'corporate'
  | 'ecommerce'
  | 'web-apps'
  | 'crm'
  | 'automation'
  | 'redesign'
  | 'mvp'
  | 'support'
  | 'android'
  | 'ios'
  | 'telegram-bots'
  | 'telegram-mini-apps';

export type Intent =
  | { kind: 'status-code' }
  | { kind: 'status' }
  | { kind: 'bot-self' }
  | { kind: 'forward' }
  | { kind: 'discount' }
  | { kind: 'payment' }
  | { kind: 'revisions' }
  | { kind: 'price'; services: ServiceSlug[] }
  | { kind: 'timeline'; services: ServiceSlug[] }
  | { kind: 'order'; services: ServiceSlug[] }
  | { kind: 'portfolio' }
  | { kind: 'process' }
  | { kind: 'about' }
  | { kind: 'contacts' }
  | { kind: 'hours' }
  | { kind: 'services' }
  | { kind: 'service'; services: ServiceSlug[] }
  | { kind: 'thanks' }
  | { kind: 'greeting' }
  | { kind: 'unknown' };

/* ------------------------------------------------------------- reading -- */

type Words = {
  raw: string;
  list: string[];
  has: (...words: string[]) => boolean;
  starts: (...stems: string[]) => boolean;
  phrase: (...words: string[]) => boolean;
};

function read(text: string): Words {
  const raw = text.toLowerCase().replace(/ё/g, 'е');
  const list = raw
    // «приииивет» and «сайтттт» are the same word as the tidy one.
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

  return {
    raw,
    list,
    has: (...words) => words.some((w) => list.includes(w)),
    starts: (...stems) => stems.some((s) => list.some((w) => w.startsWith(s))),
    phrase: (...words) => {
      for (let i = 0; i + words.length <= list.length; i += 1) {
        if (words.every((w, j) => list[i + j] === w)) return true;
      }
      return false;
    },
  };
}

const NEGATION = new Set(['не', 'без', 'нет', 'кроме']);

/** True when the word at `index` is negated by one of the two before it. */
function negated(list: string[], index: number): boolean {
  return NEGATION.has(list[index - 1] ?? '') || NEGATION.has(list[index - 2] ?? '');
}

/** Whether any word passes the test without being negated. */
function positive(list: string[], test: (word: string) => boolean): boolean {
  return list.some((word, i) => test(word) && !negated(list, i));
}

/* ------------------------------------------------------------ services -- */

const BOT_FORMS = new Set([
  'бот', 'бота', 'боту', 'ботом', 'боте', 'боты', 'ботов', 'ботам', 'ботик', 'чатбот',
  'тгбот', 'bot', 'bots', 'chatbot',
]);

const SITE_FORMS = new Set([
  'сайт', 'сайта', 'сайту', 'сайтом', 'сайте', 'сайты', 'сайтов', 'сайтик', 'саит', 'site',
  'website', 'многостраничник',
]);

/**
 * Which of the owner's services a message names.
 *
 * More specific services suppress the general one: «корпоративный сайт» is a
 * corporate site, not "a site", and quoting both would read as the bot not
 * having understood. Two services that are genuinely both possible —
 * «магазин в телеграме» could be a bot or a Mini App — are both returned, and
 * the answer shows both prices instead of guessing for the person.
 */
function servicesIn(w: Words): ServiceSlug[] {
  const { list } = w;
  const found = new Set<ServiceSlug>();
  const at = (stems: string[]) => positive(list, (word) => stems.some((s) => word.startsWith(s)));
  const exact = (forms: Set<string>) => positive(list, (word) => forms.has(word));

  if (at(['лендинг', 'лэндинг', 'лендос', 'landing'])) found.add('landing');

  const hasSite = exact(SITE_FORMS);
  if ((w.starts('корпоратив') && hasSite) || w.phrase('сайт', 'компании') || w.phrase('сайт', 'фирмы')) {
    found.add('corporate');
  }

  const shopWord = at(['магазин', 'магаз']);
  const online = w.has('интернет', 'онлайн', 'инет', 'online');
  if (w.starts('интернетмагазин', 'ecommerce') || (shopWord && (online || hasSite))) {
    found.add('ecommerce');
  }

  if (
    w.phrase('веб', 'приложение') ||
    w.starts('вебприлож', 'webapp') ||
    w.phrase('web', 'app') ||
    w.phrase('веб', 'сервис')
  ) {
    found.add('web-apps');
  }
  if (w.has('crm', 'срм', 'црм', 'срмка', 'црмка')) found.add('crm');
  if (at(['автоматиз', 'интеграц'])) found.add('automation');
  if (
    at(['редизайн', 'редезайн']) ||
    w.phrase('переделать', 'сайт') ||
    w.phrase('обновить', 'сайт') ||
    w.phrase('обновить', 'дизайн')
  ) {
    found.add('redesign');
  }
  if (w.has('mvp', 'мвп') || at(['стартап'])) found.add('mvp');
  // «поддержка», not «поддержать» — the second is usually a donation.
  if (at(['поддержк', 'техподдерж', 'сопровожд', 'доработ'])) found.add('support');
  if (w.has('андроид', 'андройд', 'android')) found.add('android');
  if (w.has('ios', 'айос', 'иос', 'айфон', 'iphone', 'ipad', 'айпад')) found.add('ios');

  const telegram = w.starts('телеграм', 'телеге', 'телегу', 'telegram') || w.has('тг', 'tg');
  const miniApp =
    w.phrase('mini', 'app') ||
    w.has('miniapp', 'миниапп') ||
    w.phrase('мини', 'апп') ||
    w.phrase('мини', 'приложение') ||
    (w.starts('приложени') && telegram);
  if (miniApp) found.add('telegram-mini-apps');

  if (exact(BOT_FORMS)) found.add('telegram-bots');

  // A shop inside Telegram is honestly either of two things.
  if (shopWord && telegram && !online && !hasSite) {
    found.delete('ecommerce');
    found.add('telegram-bots');
    found.add('telegram-mini-apps');
  }

  // «приложение» with no platform named: show the platforms rather than pick —
  // but only when they want one. «в приложении к письму», «приложение банка».
  const platformNamed = ['telegram-mini-apps', 'android', 'ios', 'web-apps'].some((s) =>
    found.has(s as ServiceSlug),
  );
  if (
    w.starts('приложени') &&
    !platformNamed &&
    w.has('нужно', 'нужен', 'нужна', 'хочу', 'сделать', 'разработать', 'стоит', 'сколько')
  ) {
    for (const s of ['web-apps', 'android', 'ios', 'telegram-mini-apps'] as const) found.add(s);
  }

  const specific = ['landing', 'corporate', 'ecommerce', 'redesign'] as const;
  if (hasSite && !specific.some((s) => found.has(s))) found.add('sites');

  return [...found];
}

/* ------------------------------------------------------------- intents -- */

/**
 * Things the owner has not written down, so the bot must not answer them.
 *
 * Other platforms and other people's prices first: «сколько стоит сайт на
 * Тильде» is not a question about his price, and answering it with his price is
 * answering a comparison he never made. Then everything his content is silent
 * on — domains, hosting, SEO, logos, crypto, contracts, instalments, urgency.
 */
const ELSEWHERE = [
  'тильд', 'tilda', 'wix', 'викс', 'wordpress', 'вордпресс', 'битрикс', 'bitrix', 'amocrm',
  'shopify', 'конструктор', 'агентств', 'фрилансер', 'домен', 'хостинг', 'seo', 'сео',
  'продвижен', 'реклам', 'таргет', 'smm', 'логотип', 'брендинг', 'крипт', 'рассрочк', 'договор',
  'nda', 'whatsapp', 'ватсап', 'вотсап', 'срочн',
];

export function classify(text: string): Intent {
  // Number and code together: answer at once, no questions asked.
  if (/ALY-\d{4}-\d{3}\s+[a-f0-9]{32}/i.test(text)) return { kind: 'status-code' };

  const w = read(text);
  if (w.list.length === 0) return { kind: 'unknown' };

  const services = servicesIn(w);
  const asking = w.raw.includes('?');

  /* ------------------------------------------ about a project already */
  if (/ALY-\d{4}-\d{3}/i.test(text)) return { kind: 'status' };
  if (
    (w.has('статус') && (w.starts('заявк', 'проект') || w.has('мой', 'моей', 'моя', 'мою', 'моего'))) ||
    w.phrase('на', 'каком', 'этапе') ||
    w.phrase('номер', 'заявки')
  ) {
    return { kind: 'status' };
  }

  /* -------------------------------------------------- about the bot */
  const you = w.list.findIndex((word) => word === 'ты' || word === 'вы' || word === 'это');
  if (you >= 0 && ['бот', 'робот', 'живой', 'человек', 'нейросеть'].includes(w.list[you + 1] ?? '')) {
    return { kind: 'bot-self' };
  }
  if (w.phrase('с', 'кем', 'я') || w.phrase('кто', 'отвечает')) return { kind: 'bot-self' };

  /* ----------------------------------- outside what is written down */
  if (w.starts(...ELSEWHERE)) return { kind: 'forward' };

  /* -------------------------------------------------- money, terms */
  if (
    w.starts('скидк', 'дешевл', 'подешевл', 'дороговат', 'торг', 'уступ', 'сбав') ||
    w.has('дорого') ||
    w.phrase('снизить', 'цену')
  ) {
    return { kind: 'discount' };
  }

  // «нужна оплата картой» is a feature of the project, not a question about
  // how to pay him — the brief's own hint lists exactly that.
  const paymentAsFeature =
    w.starts('подключ', 'приним', 'прием', 'приём', 'эквайр') || w.has('картой', 'корзина', 'корзиной');
  if (
    !paymentAsFeature &&
    (w.starts('предоплат', 'аванс') ||
      w.phrase('как', 'платить') ||
      w.phrase('как', 'оплатить') ||
      w.phrase('50', 'на', '50') ||
      w.raw.includes('50/50') ||
      w.has('частями') ||
      (w.starts('оплат') && (asking || w.has('как', 'когда'))))
  ) {
    return { kind: 'payment' };
  }

  // «правок» as well as «правки»: the genitive plural drops into a fleeting
  // vowel, so «сколько правок» never starts with «правк».
  if (w.starts('правк', 'правок', 'гаранти') || w.phrase('после', 'сдачи') || w.phrase('после', 'запуска')) {
    return { kind: 'revisions' };
  }

  /* ------------------------------------------ price, time, ordering */
  const price =
    w.phrase('сколько', 'стоит') ||
    w.phrase('сколько', 'стоят') ||
    w.phrase('сколько', 'будет', 'стоить') ||
    w.phrase('скок', 'стоит') ||
    w.phrase('стоит', 'сколько') ||
    w.has('цена', 'цену', 'цены', 'ценник', 'ценой', 'стоимость', 'стоимости', 'прайс', 'почем', 'price') ||
    w.starts('расценк', 'прайслист');
  if (price) return { kind: 'price', services };

  const time =
    w.phrase('сколько', 'времени') ||
    w.phrase('сколько', 'дней') ||
    w.phrase('сколько', 'недель') ||
    w.phrase('как', 'долго') ||
    w.phrase('за', 'сколько') ||
    w.phrase('как', 'быстро') ||
    w.phrase('когда', 'будет', 'готово') ||
    w.has('срок', 'сроки', 'сроков', 'сроках', 'срока');
  if (time) return { kind: 'timeline', services };

  const want = w.has(
    'хочу', 'хотим', 'нужен', 'нужна', 'нужно', 'надо', 'заказать', 'закажу', 'сделать',
    'сделаешь', 'сделаете', 'сделайте', 'разработать', 'создать',
  );
  if (want && services.length > 0) return { kind: 'order', services };

  /* ------------------------------------------------- who and how */
  if (
    w.has('портфолио', 'портфолию', 'кейсы', 'кейс', 'кейсов', 'portfolio') ||
    w.phrase('примеры', 'работ') ||
    (w.has('работы', 'работ') && w.has('твои', 'ваши', 'покажи', 'покажите', 'примеры')) ||
    w.phrase('что', 'уже', 'сделал') ||
    w.phrase('что', 'ты', 'сделал')
  ) {
    return { kind: 'portfolio' };
  }

  if (
    w.phrase('как', 'проходит') ||
    w.phrase('как', 'работаешь') ||
    w.phrase('как', 'работаете') ||
    w.phrase('с', 'чего', 'начать') ||
    w.phrase('как', 'начать') ||
    w.phrase('порядок', 'работы') ||
    w.phrase('как', 'это', 'работает') ||
    (w.has('этапы', 'этап', 'процесс') && services.length === 0)
  ) {
    return { kind: 'process' };
  }

  if (
    w.phrase('кто', 'ты') ||
    w.phrase('кто', 'вы') ||
    w.phrase('ты', 'кто') ||
    w.phrase('о', 'себе') ||
    w.phrase('кто', 'такой') ||
    w.phrase('кто', 'делает') ||
    w.phrase('ты', 'один') ||
    w.has('команда', 'командой')
  ) {
    return { kind: 'about' };
  }

  if (
    w.starts('контакт', 'телефон', 'позвон', 'инстаграм', 'instagram', 'почт') ||
    w.has('email', 'mail', 'связаться', 'номер')
  ) {
    return { kind: 'contacts' };
  }

  if (
    w.phrase('когда', 'ответишь') ||
    w.phrase('когда', 'ответите') ||
    w.phrase('часы', 'работы') ||
    w.phrase('до', 'скольки') ||
    w.phrase('во', 'сколько') ||
    w.starts('график', 'выходн', 'воскресен')
  ) {
    return { kind: 'hours' };
  }

  if (
    w.phrase('что', 'делаешь') ||
    w.phrase('что', 'делаете') ||
    w.phrase('что', 'умеешь') ||
    w.phrase('что', 'можешь') ||
    w.phrase('чем', 'занимаешься') ||
    w.phrase('какие', 'услуги') ||
    w.has('услуги', 'услуг')
  ) {
    return { kind: 'services' };
  }

  if (services.length > 0) return { kind: 'service', services };

  /* ----------------------------------------------------- courtesies */
  // Only on their own: «спасибо, а сколько…» was answered above.
  const short = w.list.length <= 4 && !asking;
  if (short && (w.starts('спасиб', 'благодар', 'пасиб') || w.has('спс', 'рахмат', 'ташаккур', 'thanks', 'thx'))) {
    return { kind: 'thanks' };
  }
  if (
    short &&
    (w.starts('привет', 'здравств', 'здрасьт', 'здрасте') ||
      w.has('салом', 'салам', 'hi', 'hello', 'hey') ||
      w.phrase('добрый', 'день') ||
      w.phrase('добрый', 'вечер') ||
      w.phrase('доброе', 'утро'))
  ) {
    return { kind: 'greeting' };
  }

  return { kind: 'unknown' };
}
