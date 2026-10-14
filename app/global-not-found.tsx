import type { Metadata } from 'next';
import '@fontsource-variable/onest';
import './globals.css';

/*
 * The 404 for addresses that belong to no part of the app at all.
 *
 * With three root layouts — the site, the admin, the Mini App — there is no
 * single document a stray URL could fall back to, so Next renders this one
 * directly. Public paths never get here: the proxy sends them into the site,
 * whose own not-found speaks the visitor's language. This catches the rest —
 * a mistyped /admin path, a file that does not exist.
 */

export const metadata: Metadata = {
  title: '404 — aly',
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="bg-ground text-ink">
        <main className="shell flex min-h-[100svh] flex-col justify-center py-32">
          <p className="label mb-6">404</p>
          <h1 className="max-w-2xl text-[clamp(2rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.04em]">
            This page doesn’t exist
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-2" lang="ru">
            Такой страницы нет.
          </p>
          <a
            href="/"
            className="mt-10 inline-flex min-h-14 w-fit items-center rounded-full bg-ink px-8 text-[0.875rem] font-semibold text-paper transition-colors hover:bg-ink-2"
          >
            Back to home
          </a>
        </main>
      </body>
    </html>
  );
}
