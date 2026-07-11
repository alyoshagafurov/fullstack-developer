import { NextResponse } from 'next/server';

/*
 * Live FX rates with TJS (Tajik somoni) as the base — prices on the site are
 * defined in somoni and converted to ₽ / $ depending on the chosen language.
 *
 * Source: open.er-api.com (free, no key). Cached for 1h. Falls back to static
 * approximate rates so prices always render even if the API is unreachable.
 */

const FALLBACK = { TJS: 1, RUB: 8.9, USD: 0.092 };

export const revalidate = 3600;

export async function GET() {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/TJS', { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`rates ${r.status}`);
    const data = await r.json();
    const rates = data?.rates;
    if (!rates?.RUB || !rates?.USD) throw new Error('missing rates');
    return NextResponse.json({
      base: 'TJS',
      rates: { TJS: 1, RUB: rates.RUB, USD: rates.USD },
      updated: data.time_last_update_unix ?? null,
      live: true,
    });
  } catch {
    return NextResponse.json({ base: 'TJS', rates: FALLBACK, updated: null, live: false });
  }
}
