/*
 * Every gap on the public site that only the owner can fill, in one file.
 *
 * While the site runs locally (`next dev`) each bracketed value is shown
 * exactly as written, in a dashed frame, so the owner sees what is left to
 * fill. On the live site a block that is still a placeholder is not rendered
 * at all: a visitor never reads "[КЕЙС …]", and never a plausible result
 * nobody measured. A server page filters with visibleText before it hands a
 * value to a client component: props cross into the page's HTML as data, so a
 * placeholder hidden only at render would still be read in the source. Replace the bracketed text with the real words — Russian
 * and English — and it shows everywhere, in dev and on the live site.
 *
 * Nothing here is ever filled in by a model.
 */

export type BeforeAfter = { before: string; after: string };

/*
 * The «было → стало» line under each project on the home page, keyed by the
 * project's slug (the case slug in the admin; `mimi` is the site shown without
 * a case page). Write what the client had before and what changed after the
 * launch — in their words or in real figures, never in guesses.
 */
export const CASE_BEFORE_AFTER: Record<string, { ru: BeforeAfter; en: BeforeAfter }> = {
  'arusdomod-shop': {
    ru: { before: '[КЕЙС: ArusDomod, было → что было у клиента до сайта]', after: '[КЕЙС: ArusDomod, стало → что изменилось после запуска]' },
    en: { before: '[CASE: ArusDomod, before → what the client had before the site]', after: '[CASE: ArusDomod, after → what changed after the launch]' },
  },
  'autoshine-store': {
    ru: { before: '[КЕЙС: AutoShine, было → что было у клиента до сайта]', after: '[КЕЙС: AutoShine, стало → что изменилось после запуска]' },
    en: { before: '[CASE: AutoShine, before → what the client had before the site]', after: '[CASE: AutoShine, after → what changed after the launch]' },
  },
  mimi: {
    ru: { before: '[КЕЙС: mimi, было → что было у клиента до сайта]', after: '[КЕЙС: mimi, стало → что изменилось после запуска]' },
    en: { before: '[CASE: mimi, before → what the client had before the site]', after: '[CASE: mimi, after → what changed after the launch]' },
  },
};

/** The pair for one project; a project with no entry yet gets a placeholder named after it. */
export function beforeAfter(slug: string, lang: 'ru' | 'en', title = slug): BeforeAfter {
  const known = CASE_BEFORE_AFTER[slug]?.[lang];
  if (known) return known;
  return lang === 'ru'
    ? { before: `[КЕЙС: ${title}, было → что было у клиента до сайта]`, after: `[КЕЙС: ${title}, стало → что изменилось после запуска]` }
    : { before: `[CASE: ${title}, before → what the client had before the site]`, after: `[CASE: ${title}, after → what changed after the launch]` };
}

/*
 * Shown under a reviewer's name when the review in the admin has neither a
 * company nor a role. Fill the company and the role on that review in the
 * admin and this disappears on its own; the text here needs no editing.
 */
export const REVIEW_BUSINESS_MISSING = {
  ru: '[ОТЗЫВ: бизнес клиента — компания · роль]',
  en: '[REVIEW: client’s business — company · role]',
} as const;

/** True for text that is still a placeholder, so the page can frame it and nobody mistakes it for a claim. */
export function isPlaceholder(text: string): boolean {
  return /^\[[\s\S]*\]$/.test(text.trim());
}

/*
 * Placeholders are shown while the site runs in development and never in a
 * production build. NODE_ENV is inlined at build time, so this holds in the
 * browser bundle as well as on the server.
 */
export const SHOW_PLACEHOLDERS = process.env.NODE_ENV !== 'production';

/**
 * The text as it should reach the page: a real value always; a placeholder
 * only in development; null when there is nothing to show, so the caller
 * renders nothing for that block.
 */
export function visibleText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  return isPlaceholder(text) && !SHOW_PLACEHOLDERS ? null : text;
}
