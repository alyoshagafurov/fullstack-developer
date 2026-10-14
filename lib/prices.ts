import { prisma, safely } from '@/lib/prisma';
import { services, type Service } from '@/lib/content/services';
import type { Locale } from '@/lib/i18n';
import { en } from '@/lib/i18n/en';

/*
 * What each service costs.
 *
 * The figures in lib/content/services.ts are the owner's own answers and stay
 * the source of truth. This table only carries what he has since changed from
 * the admin, keyed by slug, so a service he has never opened still shows the
 * price he first gave — and a wrong row can be deleted to fall back to it
 * rather than having to be retyped.
 *
 * Reads go through `safely`: the table is new, and a page must never 500
 * because a database is a minute behind a deploy.
 */

export type PricedService = Service & {
  price: string | null;
  term: string | null;
  note: string | null;
  /** True when the figure shown came from the admin rather than the content file. */
  edited: boolean;
};

export type PriceOverride = {
  slug: string;
  price: string | null;
  duration: string | null;
  note: string | null;
  hidden: boolean;
};

export async function getOverrides(): Promise<Map<string, PriceOverride>> {
  const rows = await safely<PriceOverride[]>(
    'service prices',
    () =>
      prisma.servicePrice.findMany({
        select: { slug: true, price: true, duration: true, note: true, hidden: true },
      }),
    [],
  );
  return new Map(rows.map((row) => [row.slug, row]));
}

/**
 * What the owner types in the admin is Russian ("От 3 000 сомони", "2–3 недели").
 * The English site reads the common shapes of it in English; anything else is
 * shown as typed, which is still a correct figure.
 */
export function englishFigure(value: string): string {
  return value
    .replace(/^от\s+/i, 'From ')
    .replace(/^до\s+/i, 'Up to ')
    .replace(/\s+до\s+/gi, ' to ')
    .replace(/(\d)\s(?=\d{3}(?!\d))/g, '$1,')
    .replace(/сомони/gi, 'TJS')
    .replace(/недел[а-я]*/gi, 'weeks')
    .replace(/дн(я|ей)|день/gi, 'days')
    .replace(/месяц[а-я]*/gi, 'months')
    .replace(/(^|\s)1 (weeks|days|months)/g, (_, space: string, unit: string) => `${space}1 ${unit.slice(0, -1)}`);
}

/** Every service the owner has not hidden, with the price that applies. */
export async function getPriceList(lang: Locale = 'ru'): Promise<PricedService[]> {
  const overrides = await getOverrides();
  const english = lang === 'en' ? en.services.items : null;

  return services
    .filter((service) => !overrides.get(service.slug)?.hidden)
    .map((service) => {
      const row = overrides.get(service.slug);
      const copy = english?.[service.slug as keyof typeof en.services.items];
      const typedPrice = row?.price?.trim();
      const typedTerm = row?.duration?.trim();
      const price = english
        ? (typedPrice ? englishFigure(typedPrice) : copy?.budget) || null
        : typedPrice || service.budget || null;
      const term = english
        ? (typedTerm ? englishFigure(typedTerm) : copy?.duration) || null
        : typedTerm || service.duration || null;
      return {
        ...service,
        title: copy?.title ?? service.title,
        price,
        term,
        note: row?.note?.trim() || null,
        edited: Boolean(typedPrice),
      };
    });
}

/** The admin's view: every service, hidden ones included, with what was typed. */
export async function getPriceRows() {
  const overrides = await getOverrides();
  return services.map((service) => {
    const row = overrides.get(service.slug);
    return {
      slug: service.slug,
      num: service.num,
      title: service.title,
      fallbackPrice: service.budget ?? '',
      fallbackDuration: service.duration ?? '',
      price: row?.price ?? '',
      duration: row?.duration ?? '',
      note: row?.note ?? '',
      hidden: row?.hidden ?? false,
    };
  });
}
