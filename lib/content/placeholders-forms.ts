/*
 * What the request forms need from the owner and do not have yet.
 *
 * Every value here is a placeholder in square brackets, shown as is on the
 * live form until he replaces it with the real thing. Nothing in this file
 * is invented: a bracket means "fill me in", not "this is true".
 *
 * Used by the site form (components/brief/BriefForm.tsx, Russian and English
 * pages) and the Telegram Mini App form (components/mini/MiniBriefForm.tsx,
 * Russian only).
 */
export const FORM_PLACEHOLDERS = {
  /**
   * The thin strip above the questions: «Последний проект: …» / "Latest project: …".
   * Write the project's name as a client would recognise it, e.g. a shop or a
   * brand. A brand name usually reads the same in both; then write it twice.
   */
  lastProject: {
    ru: '[ПОСЛЕДНИЙ ПРОЕКТ: название]',
    en: '[LATEST PROJECT: name]',
  },
} as const;
