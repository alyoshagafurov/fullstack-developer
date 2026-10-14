import { revalidatePath } from 'next/cache';
import { locales } from '@/lib/i18n';

/**
 * Refresh a public page in every language after the owner changes something.
 *
 * Visitors see /work and /ru/work, but both are rendered by
 * app/(site)/[lang]/work — the proxy rewrites the bare address to /en/work —
 * and revalidation has to name the route that actually rendered, not the
 * address in the bar. Takes the path as it reads in English: '/', '/work',
 * '/work/my-case'.
 */
export function revalidateSite(...paths: string[]): void {
  for (const path of paths) {
    for (const lang of locales) {
      revalidatePath(path === '/' ? `/${lang}` : `/${lang}${path}`);
    }
  }
}
