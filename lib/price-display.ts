import 'server-only';
import { getRates } from '@/lib/rates';
import type { Locale } from '@/lib/i18n';

/*
 * A price as the visitor reads it.
 *
 * The owner sets every price in somoni. Russian keeps it that way; the English
 * site is read by people who think in dollars, so the same figure is shown
 * converted at today's rate and rounded to a friendly ten, with a tilde so
 * nobody mistakes it for a quote. When the rate is unavailable the somoni stay:
 * a wrong dollar figure that looks right is worse than an honest TJS.
 */

const AMOUNT = /(\d[\d\s,. ]*\d|\d)\s*(TJS|сомони)/gi;

export type PriceFormatter = (figure: string | null | undefined) => string | null;

export async function priceFormatter(lang: Locale): Promise<PriceFormatter> {
  if (lang !== 'en') return (figure) => figure ?? null;
  const rates = await getRates();
  const perUsd = rates?.perUsd.TJS;

  return (figure) => {
    if (!figure) return null;
    if (!perUsd) return figure;
    return figure.replace(AMOUNT, (whole, digits: string) => {
      const somoni = Number(digits.replace(/[^\d]/g, ''));
      if (!somoni) return whole;
      const usd = Math.max(10, Math.round(somoni / perUsd / 10) * 10);
      return `~$${usd.toLocaleString('en-US')}`;
    });
  };
}
