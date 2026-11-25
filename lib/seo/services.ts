import { cache } from 'react';
import { PROMISE } from '@/lib/content/site';
import { services as allServices } from '@/lib/content/services';
import { fill, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';
import { getPriceList, type PricedService } from '@/lib/prices';
import { lowerFirst, lowestPrice, parsePrice, priceFromText, upperFirst, type PriceFigure } from './price';

/*
 * The words a search result shows for a service: what it is and where, the
 * real starting price and time, and the promise. All of it read from the same
 * price list the page shows — when the owner changes a price in the admin, the
 * title and the snippet change with it.
 */

/** The price list once per request: the layout, a page's head and its JSON-LD all ask for it. */
export const cachedPriceList = cache((lang: Locale) => getPriceList(lang));

/** «от 1 500 сомони» — the lowest starting price on the list, or the owner's own list if the admin hides them all. */
export function startingPrice(lang: Locale, t: Dictionary, list: PricedService[]): string | null {
  const amount = lowestPrice(list.map((row) => row.price)) ?? lowestPrice(allServices.map((row) => row.budget));
  return amount ? priceFromText(lang, t, amount) : null;
}

export type ServiceSeo = {
  title: string;
  /**
   * True when the title carries the price. It is then used without the
   * «| Алишер Гафуров» suffix: a Russian title with a price already runs to
   * ~50 characters, and the suffix only pushed the price towards the cut.
   * The site's name still shows above the result, from the WebSite markup.
   */
  absolute: boolean;
  description: string;
  figure: PriceFigure | null;
};

/**
 * «Telegram-бот на заказ в Душанбе — от 1 500 сомони» and
 * «Бот с меню, заявками… От 1 500 сомони. Срок: от 3 дней до 2 недель. Первый набросок…».
 */
export function serviceSeo({
  lang,
  t,
  slug,
  fallbackTitle,
  fallbackSummary,
  price,
  term,
  shown,
}: {
  lang: Locale;
  t: Dictionary;
  slug: string;
  /** The service's own name and tagline, for a service the meta block has no words for. */
  fallbackTitle: string;
  fallbackSummary: string;
  /** As the page shows it: the admin's figure, or the owner's original one. */
  price: string | null | undefined;
  term: string | null | undefined;
  /**
   * How the page itself shows a price (lib/price-display.ts): somoni in
   * Russian, dollars in English. The snippet says the figure the page says,
   * so a searcher never clicks «From 3,000 TJS» to land on «~$270».
   */
  shown?: (figure: string) => string | null;
}): ServiceSeo {
  const words = t.meta.services[slug];
  const figure = parsePrice(price);
  const from = figure && figure.kind !== 'upTo' ? priceFromText(lang, t, figure.amount) : null;

  const named = words?.title ?? fallbackTitle;
  const title = from ? fill(t.meta.serviceTitle, { title: named, price: from }) : named;
  const said = price ? (shown?.(price) ?? price) : null;

  const promise = lang === 'ru' ? PROMISE.full : PROMISE.en.full;
  const parts = [
    words?.summary ?? fallbackSummary,
    said ? `${upperFirst(said.trim()).replace(/\.$/, '')}.` : null,
    term ? `${t.meta.termLabel}: ${lowerFirst(term.trim()).replace(/\.$/, '')}.` : null,
    promise,
  ];

  return { title, absolute: title !== named, description: parts.filter(Boolean).join(' '), figure };
}
