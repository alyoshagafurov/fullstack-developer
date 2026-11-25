import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/server';
import { notFoundMetadata } from '@/lib/seo/metadata';

/*
 * Anything under a language that no page claims.
 *
 * The proxy sends every unknown public address into the `[lang]` tree, and
 * without this an unmatched path would fall out of the site's root layout and
 * show a bare 404 with no header, no footer and the wrong language. Throwing
 * here renders ../not-found.tsx inside the site, in the visitor's language.
 *
 * Its head says "page not found" and borrows nothing from the home page. If
 * Next ever resolves a 404's head from not-found.tsx instead of this page, the
 * layout no longer carries a canonical or a share card to inherit either.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return notFoundMetadata(t);
}

export default function UnknownPage() {
  notFound();
}
