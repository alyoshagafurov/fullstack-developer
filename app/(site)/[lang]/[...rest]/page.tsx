import { notFound } from 'next/navigation';

/*
 * Anything under a language that no page claims.
 *
 * The proxy sends every unknown public address into the `[lang]` tree, and
 * without this an unmatched path would fall out of the site's root layout and
 * show a bare 404 with no header, no footer and the wrong language. Throwing
 * here renders ../not-found.tsx inside the site, in the visitor's language.
 */
export default function UnknownPage() {
  notFound();
}
