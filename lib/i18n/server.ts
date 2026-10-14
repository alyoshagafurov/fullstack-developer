import { lang as rootLang } from 'next/root-params';
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n';
import { en, type Dictionary } from '@/lib/i18n/en';
import { ru } from '@/lib/i18n/ru';

/*
 * The language of the page being rendered, read from the `[lang]` segment the
 * site's root layout sits under — so any server component can ask for it
 * without the page passing it down. The admin and the Mini App have root
 * layouts of their own with no such segment; there it reads `undefined`, which
 * is why the answer is normalised rather than trusted.
 */

const dictionaries: Record<Locale, Dictionary> = { en, ru };

export async function getLang(): Promise<Locale> {
  const value = await rootLang();
  return isLocale(value) ? value : defaultLocale;
}

/** The language and every word for it, in one call. */
export async function getDictionary(): Promise<{ lang: Locale; t: Dictionary }> {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}

export function dictionaryFor(lang: Locale): Dictionary {
  return dictionaries[lang];
}
