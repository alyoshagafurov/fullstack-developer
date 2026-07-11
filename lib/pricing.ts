/*
 * Tariff plans — base price in Tajik somoni (converted to the active currency
 * at render). Names, taglines and feature lists live in the i18n dictionaries
 * under pricing.tariffs (same order).
 */

export type TariffMeta = { id: string; price: number; popular?: boolean };

export const TARIFFS: TariffMeta[] = [
  { id: 'start', price: 1500 },
  { id: 'business', price: 4000, popular: true },
  { id: 'pro', price: 9000 },
];
