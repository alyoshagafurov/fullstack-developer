'use client';

import Shell from '@/components/ui/Shell';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';

/*
 * 09 — Footer.
 *
 * Composition: a colophon. The wordmark is set large at the foot of the page
 * as the closing object, with the index and contacts as mono columns beside
 * it. Deepest surface on the site, so the page visibly ends.
 */

const LINKS = [
  // A route, not an anchor: the case register left the landing page and now
  // has its own address, so this link has to work from /work itself too.
  { href: '/work', key: 'work' as const },
  { href: '/#services', key: 'services' as const },
  { href: '#process', key: 'process' as const },
  { href: '#studio', key: 'about' as const },
  { href: '#start', key: 'contact' as const },
];

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="relative bg-base-deep border-t border-line pt-rhythm-s pb-12">
      <Shell grid className="gap-y-12">
        <div className="col-span-12 md:col-span-5">
          <a href="#top" aria-label="ALY" className="inline-flex items-center min-h-[44px] opacity-90 hover:opacity-100 transition-opacity">
            <Logo className="h-7 md:h-9 w-auto" />
          </a>
          <p className="text-body text-ink-2 mt-6 max-w-[28ch]">{t.footer.tagline}</p>
          <p className="mt-6 inline-flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">
            <span className="w-1.5 h-1.5 rounded-full bg-signal" aria-hidden />
            {t.footer.location}
          </p>
        </div>

        <nav className="col-span-6 md:col-span-3 md:col-start-7" aria-label={t.footer.navTitle}>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3 mb-5">
            {t.footer.navTitle}
          </p>
          <ul className="space-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex items-center min-h-[44px] text-body text-ink-2 hover:text-signal transition-colors">
                  {t.nav[l.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-6 md:col-span-3">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3 mb-5">
            {t.footer.contactTitle}
          </p>
          <ul className="space-y-3">
            <li>
              <a href="mailto:gafurovalyosha@gmail.com" className="inline-flex items-center min-h-[44px] text-body text-ink-2 hover:text-signal transition-colors break-all">
                gafurovalyosha@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://t.me/alishergafurovv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] text-body text-ink-2 hover:text-signal transition-colors"
              >
                @alishergafurovv
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-12 mt-8 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">
            {t.footer.rights}
          </span>
          <a href="#top" className="inline-flex items-center min-h-[44px] font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3 hover:text-signal transition-colors">
            {t.footer.up}
          </a>
        </div>
      </Shell>
    </footer>
  );
}
