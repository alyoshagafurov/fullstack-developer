import { fill, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * A price as a search engine is told it.
 *
 * The owner types his prices as words — «От 3 000 сомони», «1 500–3 000
 * сомони», «Считается под задачу» — and the English price list reads them as
 * «From 3,000 TJS». This reads the figure back out of either, so a title can
 * say «от 3 000 сомони» and the structured data can carry 3000 TJS, both from
 * the same row the page itself shows. Anything without a somoni figure in it
 * is not a price here, and nothing is said rather than a guess.
 */

export type PriceFigure = {
  /** The figure in somoni. */
  amount: number;
  /** The top of a range, when one was given. */
  max?: number;
  /** «от N» starts a range, «до N» ends one, a bare N is the price. */
  kind: 'from' | 'upTo' | 'exact';
};

const NUMBER = /\d[\d\s  ,.]*\d|\d/g;

export function parsePrice(text: string | null | undefined): PriceFigure | null {
  if (!text || !/(сомони|смн|TJS)/i.test(text)) return null;
  const numbers = (text.match(NUMBER) ?? [])
    .map((part) => Number(part.replace(/[^\d]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  const [first, second] = numbers;
  if (!first) return null;

  // `\b` is ASCII-only in JavaScript, so the Cyrillic words are matched by the space after them.
  if (/^\s*(до|up to)(?=\s)/i.test(text)) return { amount: first, kind: 'upTo' };
  if (second && second > first && /\d\s*[–—-]\s*\d/.test(text)) return { amount: first, max: second, kind: 'from' };
  if (/^\s*(от|from)(?=\s)/i.test(text)) return { amount: first, kind: 'from' };
  return { amount: first, kind: 'exact' };
}

/** The smallest figure a service can start at, across a price list. */
export function lowestPrice(prices: (string | null | undefined)[]): number | null {
  const amounts = prices
    .map(parsePrice)
    .filter((figure): figure is PriceFigure => figure !== null && figure.kind !== 'upTo')
    .map((figure) => figure.amount);
  return amounts.length > 0 ? Math.min(...amounts) : null;
}

/** «от 1 500 сомони» / «from 1,500 TJS» — the start of a range, in the page's language. */
export function priceFromText(lang: Locale, t: Dictionary, amount: number): string {
  return fill(t.meta.priceFrom, { amount: amount.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US') });
}

export const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
export const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
