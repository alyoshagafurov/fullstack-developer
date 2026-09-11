import { prisma, safely } from '@/lib/prisma';
import { services, type Service } from '@/lib/content/services';

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

/** Every service the owner has not hidden, with the price that applies. */
export async function getPriceList(): Promise<PricedService[]> {
  const overrides = await getOverrides();

  return services
    .filter((service) => !overrides.get(service.slug)?.hidden)
    .map((service) => {
      const row = overrides.get(service.slug);
      const price = row?.price?.trim() || service.budget || null;
      const term = row?.duration?.trim() || service.duration || null;
      return {
        ...service,
        price,
        term,
        note: row?.note?.trim() || null,
        edited: Boolean(row?.price?.trim()),
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
