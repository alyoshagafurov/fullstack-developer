import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { site } from '@/lib/content/site';

/*
 * The footer closes the page on black, so the last thing a visitor sees is the
 * wordmark rather than a form. Links only; nothing is sold down here.
 */

const columns = [
  {
    title: 'Работа',
    links: [
      { href: '/work', label: 'Проекты' },
      { href: '/services', label: 'Услуги' },
      { href: '/#process', label: 'Процесс' },
    ],
  },
  {
    title: 'Связаться',
    links: [
      { href: '/about', label: 'Кто я' },
      { href: '/contacts', label: 'Контакты' },
      { href: '/start', label: 'Оставить заявку' },
    ],
  },
];

const quiet = 'inline-flex min-h-8 items-center text-sm text-paper/50 transition-colors hover:text-paper';

export function Footer() {
  const { contact } = site;

  return (
    <footer className="w-full bg-void text-paper">
      <div className="shell pt-20 pb-12 md:pt-28">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            {/* The wordmark is cut black, so it is inverted to sit on the void. */}
            <Logo className="h-8 w-auto invert md:h-10" />
            <p className="mt-5 text-sm leading-relaxed text-paper/50">{site.shortStatement}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="label mb-5 text-paper/35">{column.title}</p>
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
            <p className="label mb-5 text-paper/35">Связь</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${contact.email}`} className={quiet}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://t.me/${contact.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quiet}
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quiet}
                >
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

        <div className="mt-16 flex flex-col gap-3 border-t border-white/12 pt-6 text-xs text-paper/35 md:flex-row md:items-center md:justify-between">
          <p>{site.footerLegal}</p>
          <p>{site.hours}</p>
        </div>
      </div>
    </footer>
  );
}
