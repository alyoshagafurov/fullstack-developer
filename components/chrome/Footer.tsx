import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The footer closes the page on black, so the last thing a visitor sees is the
 * wordmark rather than a form. Links only; nothing is sold down here.
 *
 * The bottom row stands clear of the floating request button: without the
 * extra space under it, the legal line and the hours would sit beneath the
 * button on a phone with no way to scroll them out.
 */

const quiet = 'inline-flex min-h-8 items-center text-sm text-paper/55 transition-colors hover:text-paper';

export async function Footer() {
  const { lang, t } = await getDictionary();
  const { contact } = site;
  const href = (path: string) => localePath(lang, path);

  const columns = [
    {
      title: t.footer.work,
      links: [
        { href: href('/work'), label: t.nav.work },
        { href: href('/services'), label: t.nav.services },
        { href: href('/prices'), label: t.nav.prices },
        { href: href('/reviews'), label: t.nav.reviews },
        { href: `${href('/')}#process`, label: t.nav.process },
      ],
    },
    {
      title: t.footer.talk,
      links: [
        { href: href('/about'), label: t.nav.about },
        { href: href('/contacts'), label: t.nav.contacts },
        { href: href('/start'), label: t.nav.start },
      ],
    },
  ];

  return (
    <footer className="w-full bg-void text-paper">
      <div className="shell pt-20 pb-32 md:pt-28 md:pb-28">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            {/* The wordmark is cut black, so it is inverted to sit on the void. */}
            <Logo className="h-8 w-auto invert md:h-10" />
            <p className="mt-5 text-sm leading-relaxed text-paper/55">{t.footer.statement}</p>
            {/* The colophon, spelled both ways people look him up: the Latin
                and Cyrillic forms are different strings to a search engine. */}
            <p className="mt-4 text-xs leading-relaxed text-paper/55">{t.footer.colophon}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="label mb-5 text-paper/55">{column.title}</p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={quiet}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="label mb-5 text-paper/55">{t.footer.contact}</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${contact.email}`} className={quiet}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={`https://t.me/${contact.telegram}`} target="_blank" rel="noopener noreferrer" className={quiet}>
                  Telegram
                </a>
              </li>
              <li>
                <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className={quiet}>
                  Instagram
                </a>
              </li>
              <li>
                <a href={contact.github} target="_blank" rel="noopener noreferrer" className={quiet}>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/12 pt-6 text-xs text-paper/55 md:flex-row md:items-center md:justify-between">
          <p>{t.common.legal}</p>
          <p>{t.common.hours}</p>
        </div>
      </div>
    </footer>
  );
}
