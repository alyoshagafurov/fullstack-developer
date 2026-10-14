import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { site } from '@/lib/content/site';
import { alternatesFor, fill } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.contacts.metaTitle,
    description: fill(t.contacts.metaDescription, {
      email: site.contact.email,
      telegram: site.contact.telegram,
    }),
    alternates: alternatesFor(lang, '/contacts'),
  };
}

/*
 * Contacts, on their own page.
 *
 * The brief form is the front door and this is the side one: for people who
 * would rather write two lines than fill in four steps. Every channel the owner
 * listed, each a real link, nothing invented.
 */
export default async function ContactsPage() {
  const { t } = await getDictionary();
  const { contact } = site;
  const copy = t.contacts.channels;

  const channels = [
    {
      ...copy.telegram,
      value: `@${contact.telegram}`,
      href: `https://t.me/${contact.telegram}`,
    },
    {
      ...copy.email,
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      ...copy.whatsapp,
      value: contact.phone,
      href: `https://wa.me/${contact.phoneHref.replace(/\D/g, '')}`,
    },
    {
      ...copy.phone,
      value: contact.phone,
      href: `tel:${contact.phoneHref}`,
    },
    {
      ...copy.instagram,
      value: `@${contact.instagram}`,
      href: `https://instagram.com/${contact.instagram}`,
    },
    {
      ...copy.github,
      value: 'alyoshagafurov',
      href: contact.github,
    },
  ];

  return (
    <>
      <PageOpening
        eyebrow={t.contacts.eyebrow}
        title={t.contacts.title}
        lede={`${t.common.replyWithin} ${t.common.hours}`}
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

      <Invite />
    </>
  );
}
