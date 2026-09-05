import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { PageOpening } from '@/components/ui/PageOpening';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Контакты',
  description: `Написать напрямую: ${site.contact.email}, Telegram @${site.contact.telegram}.`,
  alternates: { canonical: '/contacts' },
};

/*
 * Contacts, on their own page.
 *
 * The brief form is the front door and this is the side one: for people who
 * would rather write two lines than fill in four steps. Every channel the owner
 * listed, each a real link, nothing invented.
 */
export default function ContactsPage() {
  const { contact } = site;

  const channels = [
    {
      label: 'Telegram',
      value: `@${contact.telegram}`,
      note: 'Отвечаю здесь быстрее всего',
      href: `https://t.me/${contact.telegram}`,
    },
    {
      label: 'Почта',
      value: contact.email,
      note: 'Для писем и документов',
      href: `mailto:${contact.email}`,
    },
    {
      label: 'WhatsApp',
      value: contact.phone,
      note: 'Если удобнее там',
      href: `https://wa.me/${contact.phoneHref.replace(/\D/g, '')}`,
    },
    {
      label: 'Телефон',
      value: contact.phone,
      note: 'Звонок в рабочие часы',
      href: `tel:${contact.phoneHref}`,
    },
    {
      label: 'Instagram',
      value: `@${contact.instagram}`,
      note: 'Что делаю прямо сейчас',
      href: `https://instagram.com/${contact.instagram}`,
    },
    {
      label: 'GitHub',
      value: 'alyoshagafurov',
      note: 'Код и проекты',
      href: contact.github,
    },
  ];

  return (
    <>
      <PageOpening
        eyebrow="Контакты"
        title="Напишите напрямую"
        lede={`Отвечаю ${site.responseTime.toLowerCase()}. ${site.hours}`}
        cta={false}
      />

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <ul className="grid gap-x-14 md:grid-cols-2">
          {channels.map((channel) => (
            <li key={channel.label} className="border-t border-line">
              <a
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex min-h-24 items-center justify-between gap-6 py-7"
              >
                <span className="min-w-0">
                  <span className="label mb-2 block">{channel.label}</span>
                  <span className="block truncate text-xl tracking-[-0.01em] transition-opacity group-hover:opacity-60">
                    {channel.value}
                  </span>
                  <span className="mt-1 block text-sm text-ink-3">{channel.note}</span>
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-ink-3 transition-transform duration-300 ease-[var(--ease-studio)] group-hover:translate-x-1 group-hover:text-ink"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="void" innerClassName="py-24 text-center md:py-32">
        <p className="display-2 mx-auto max-w-4xl text-paper uppercase">{site.contactInvite}</p>
        <CTA href="/start" tone="dark" size="lg" className="mt-12">
          {site.heroCta}
        </CTA>
        <p className="mt-6 text-xs text-paper/45">
          Четыре коротких шага. Ни к чему не обязывает.
        </p>
      </Band>
    </>
  );
}
