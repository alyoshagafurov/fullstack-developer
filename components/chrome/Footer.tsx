import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { site } from '@/lib/content/site';

/*
 * The footer is the clean link table from the first reference: a few short
 * columns, a hairline, and the wordmark set large. Nothing is sold here.
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
    title: 'Обо мне',
    links: [
      { href: '/about', label: 'Кто я' },
      { href: '/start', label: 'Оставить заявку' },
    ],
  },
];

export function Footer() {
  const { contact } = site;

  return (
    <footer className="w-full bg-paper text-ink">
      <div className="shell pt-20 pb-12 md:pt-28">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Logo className="h-8 w-auto md:h-10" />
            <p className="mt-5 text-sm leading-relaxed text-ink-2">{site.shortStatement}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="label mb-5">{column.title}</p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-8 items-center text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="label mb-5">Связь</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-8 items-center text-ink-2 transition-colors hover:text-ink"
                >
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://t.me/${contact.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center text-ink-2 transition-colors hover:text-ink"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center text-ink-2 transition-colors hover:text-ink"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center text-ink-2 transition-colors hover:text-ink"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>{site.footerLegal}</p>
          <p>{site.hours}</p>
        </div>
      </div>
    </footer>
  );
}
