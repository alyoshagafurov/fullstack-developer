'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useI18n } from './i18n';
import type { Lang } from './i18n';

/*
 * Currency: prices are stored in Tajik somoni (TJS) and converted to the
 * currency that matches the active language — TJ→сомонӣ, RU→₽, EN→$ — using
 * live rates from /api/rates (with a static fallback so it never breaks).
 */

type Rates = { TJS: number; RUB: number; USD: number };
const FALLBACK: Rates = { TJS: 1, RUB: 8.9, USD: 0.092 };

const RatesContext = createContext<Rates>(FALLBACK);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<Rates>(FALLBACK);
  useEffect(() => {
    let alive = true;
    fetch('/api/rates')
      .then((r) => r.json())
      .then((d) => { if (alive && d?.rates) setRates(d.rates); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return <RatesContext.Provider value={rates}>{children}</RatesContext.Provider>;
}

const CUR: Record<Lang, 'TJS' | 'RUB' | 'USD'> = { tg: 'TJS', ru: 'RUB', en: 'USD' };
const STEP: Record<'TJS' | 'RUB' | 'USD', number> = { TJS: 1, RUB: 100, USD: 5 };

function roundNice(v: number, step: number) {
  return Math.max(step, Math.round(v / step) * step);
}

function group(n: number) {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

/*
 * Returns a formatter: money(700) → "700 сомонӣ" / "≈ 6 200 ₽" / "≈ $64".
 * Pass a base TJS amount (number, or a string like "30 000" / "30 000+").
 */
export function useMoney() {
  const { lang } = useI18n();
  const rates = useContext(RatesContext);
  const cur = CUR[lang] ?? 'TJS';

  return (amount: number | string) => {
    let plus = false;
    let base: number;
    if (typeof amount === 'string') {
      plus = amount.includes('+');
      base = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    } else {
      base = amount;
    }
    const converted = base * (rates[cur] ?? 1);
    const rounded = roundNice(converted, STEP[cur]);
    const num = group(rounded) + (plus ? '+' : '');
    if (cur === 'USD') return `≈ $${num}`;
    if (cur === 'RUB') return `≈ ${num} ₽`;
    return `${num} сомонӣ`;
  };
}
