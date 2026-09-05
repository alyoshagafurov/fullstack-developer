'use client';

import Logo from '@/components/ui/Logo';
import { Led } from '@/components/ui/Panel';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Footer — the floor of the room.
 *
 * The wordmark set large as the closing object, the index and the two
 * channels beside it. Deepest surface on the site with a lit edge above it,
 * so the page visibly ends.
 */

const LINKS = [
  { href: '/work', key: 'work' as const },
  { href: '/#services', key: 'services' as const },
  { href: '/#process', key: 'process' as const },
  { href: '/#studio', key: 'about' as const },
  { href: '/#start', key: 'contact' as const },
];

export default function SiteFooter() {
  const { t } = useI18n();
  // Telegram and email — the two channels the owner answers first.
  const channels = t.contact.channels.slice(0, 2);

  return (
    <footer data-light="" className="relative bg-base-deep pb-10 pt-16 md:pt-20">
      <Led />
      <Shell grid className="gap-y-12">
        <div className="col-span-12 md:col-span-5">
          <a href="#top" aria-label="aly — наверх" className="inline-flex min-h-[44px] items-center">
            <Logo className="h-16 w-auto md:h-24" />
          </a>
          <p className="mt-6 max-w-[30ch] text-[14px] leading-[1.6] text-ink-2">{t.footer.tagline}</p>
          <p className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-3">
            <span className="h-1.5 w-1.5 bg-copper" aria-hidden />
            {t.footer.location}
          </p>
        </div>

        <nav className="col-span-12 xs:col-span-6 md:col-span-3 md:col-start-7" aria-label={t.footer.navTitle}>
          <p className="label mb-3">{t.footer.navTitle}</p>
          <ul className="m-0 list-none p-0">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="lnk inline-flex min-h-[44px] items-center text-[14px] text-ink-2 hover:text-ink"
                >
                  {t.nav[l.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-12 xs:col-span-6 md:col-span-3">
          <p className="label mb-3">{t.footer.contactTitle}</p>
          <ul className="m-0 list-none p-0">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="lnk inline-flex min-h-[44px] items-center break-all text-[14px] text-ink-2 hover:text-ink"
                >
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 mt-4 flex flex-wrap items-center justify-between gap-4">
          <span aria-hidden className="h-px w-full bg-edge" />
          <span className="text-[11px] uppercase tracking-[0.16em] text-ink-3">{t.footer.rights}</span>
          <a
            href="#top"
            className="lnk inline-flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.16em] text-ink-3 hover:text-ink"
          >
            {t.footer.up}
          </a>
        </div>
      </Shell>
    </footer>
  );
}
