import 'server-only';
import type { Currency } from '@/lib/content/finance';

/*
 * How much one currency is worth in another, today.
 *
 * The owner is paid in somoni, dollars and roubles, and wants one total in
 * whichever of the three he picks. So every amount is stored as it arrived and
 * converted only when shown, at today's rate. A rate that moves never rewrites
 * what was recorded; it only changes what the total reads as today.
 *
 * The source is ExchangeRate-API's open endpoint: no key, one update a day, and
 * — this is why it and not another — it carries the somoni. The European
 * Central Bank's feed, which most free services re-serve, does not list TJS at
 * all. Their terms ask for a credit wherever the rates are shown, and the money
 * screen carries one.
 *
 * Fetched at most twice a day per server, through Next's data cache. If the
 * source is down the answer is null, and the screen shows each currency on its
 * own rather than a total built from a guessed rate: a wrong figure that looks
 * right is worse than no figure.
 */

export type Rates = {
  /** Units of each currency per one US dollar. */
  perUsd: Record<Currency, number>;
  /** When the source last updated them. */
  updatedAt: Date;
};

const SOURCE = 'https://open.er-api.com/v6/latest/USD';
const TWELVE_HOURS = 12 * 60 * 60;

export async function getRates(): Promise<Rates | null> {
  try {
    const response = await fetch(SOURCE, { next: { revalidate: TWELVE_HOURS } });
    if (!response.ok) return null;

    const body = (await response.json()) as {
      result?: string;
      time_last_update_unix?: number;
      rates?: Record<string, number>;
    };
    const tjs = body.rates?.TJS;
    const rub = body.rates?.RUB;

    // Anything implausible is treated as no answer at all.
    if (body.result !== 'success' || !(tjs && tjs > 0) || !(rub && rub > 0)) return null;

    return {
      perUsd: { USD: 1, TJS: tjs, RUB: rub },
      updatedAt: new Date((body.time_last_update_unix ?? Date.now() / 1000) * 1000),
    };
  } catch {
    return null;
  }
}
