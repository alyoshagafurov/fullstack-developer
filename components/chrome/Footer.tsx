import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { DUSHANBE_PATH, dushanbeCopy } from '@/lib/content/dushanbe';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { whatsappHref } from '@/components/museum/links';

/* Quiet until pointed at: grey, then white and underlined. Each row is a full 44px tap target. */
const footerLink =
  'inline-flex min-h-11 items-center text-sm text-bone-2 underline-offset-4 transition-colors hover:text-bone hover:underline';

/*
 * The museum's back wall: the wordmark, the halls, the ways to reach him, and
 * the colophon spelled both ways people search for his name. Graphite, so every
 * page ends dark after the black last screen, the way the home does.
 */
export async function Footer() {
  const { lang, t } = await getDictionary();
  const { contact } = site;
  const href = (path: string) => localePath(lang, path);

  const halls = [
    { href: href('/work'), label: t.nav.work },
    { href: href('/services'), label: t.nav.services },
    { href: href('/prices'), label: t.nav.prices },
    { href: href('/reviews'), label: t.nav.reviews },
    { href: href('/about'), label: t.nav.about },
    { href: href('/contacts'), label: t.nav.contacts },
  ];

  const ways = [
    { href: whatsappHref(t), label: 'WhatsApp' },
    { href: `https://t.me/${contact.telegram}`, label: 'Telegram' },
    { href: `mailto:${contact.email}`, label: contact.email },
    { href: `https://instagram.com/${contact.instagram}`, label: 'Instagram' },
    { href: contact.github, label: 'GitHub' },
  ];

  return (
    <footer data-tone="dark" className="bg-wall-2 text-[0.8125rem] text-bone">
      <div className="hall pt-14 pb-32 md:pb-12">
        <div className="flex flex-col gap-14 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo className="h-6 w-auto dark:invert" />
            <p className="wall-note mt-6">{t.footer.statement}</p>
            {/*
             * The local page, linked from every page so it is never an orphan.
             * Under the statement rather than among the halls: its label is
             * long enough to crowd the email out of the two columns on a phone.
             */}
            <Link href={href(DUSHANBE_PATH)} className={`${footerLink} mt-3`}>
              {dushanbeCopy(lang).footer}
            </Link>
          </div>

          <div className="flex gap-16 md:gap-24">
            <nav aria-label={t.footer.work}>
              <ul>
                {halls.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <ul aria-label={t.footer.contact}>
              {ways.map((way) => (
                <li key={way.label}>
                  <a
                    href={way.href}
                    target={way.href.startsWith('http') ? '_blank' : undefined}
                    rel={way.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`${footerLink} break-all`}
                  >
                    {way.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 text-xs text-bone-3 md:flex-row md:items-center md:justify-between">
          <p>{t.common.legal}</p>
          <p>{t.footer.colophon}</p>
          <p>{t.common.hours}</p>
        </div>
      </div>
    </footer>
  );
}
