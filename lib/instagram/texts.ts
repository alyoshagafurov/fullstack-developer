import { site } from '@/lib/content/site';

/**
 * What a first-time Instagram DM gets back.
 *
 * Unlike lib/telegram/texts.ts, this is not the owner's own wording — he
 * asked for the behavior (greet, point to the Telegram bot, fall back to the
 * site), not for exact words. This is a first draft; edit it here if the
 * voice is off.
 *
 * English first: most of the people writing to him now are English speakers.
 * The bot asks its questions in Russian, so the English half leads with the
 * English form on the site and offers Telegram second; the Russian half keeps
 * the order he asked for.
 */
export function instagramGreeting(botUsername: string): string {
  return [
    'Hi! This is aly 👋 Thanks for your message.',
    `The quickest way to get a quote is this short form: ${site.url}/start`,
    `Or message me on Telegram: https://t.me/${site.contact.telegram}`,
    '',
    '—',
    '',
    'Привет! Это aly 👋 Увидел ваше сообщение в Instagram.',
    `Заявку удобнее всего оставить через Telegram-бота — там я отвечаю быстрее: https://t.me/${botUsername}`,
    `Если Telegram нет — можно прямо на сайте: ${site.url}/ru/start`,
  ].join('\n');
}
