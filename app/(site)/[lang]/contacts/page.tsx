import type { Metadata } from 'next';
import Link from 'next/link';
import { HallHead } from '@/components/museum/HallHead';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import { alternatesFor, fill } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The ways to reach him. WhatsApp and Telegram are the two big doors, set as
 * large as headlines; the rest — email, phone, Instagram, GitHub — are small
 * labels in the corner for whoever needs them.
 */

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

export default async function ContactsPage() {
  const { lang, t } = await getDictionary();
  const { contact } = site;
  const c = t.contacts.channels;

  const doors = [
    { label: c.whatsapp.label, note: c.whatsapp.note, value: contact.phone, href: whatsappHref(t), icon: true },
    { label: c.telegram.label, note: c.telegram.note, value: `@${contact.telegram}`, href: `https://t.me/${contact.telegram}`, icon: false },
  ];

  const small = [
    { label: c.email.label, value: contact.email, href: `mailto:${contact.email}` },
    { label: c.phone.label, value: contact.phone, href: `tel:${contact.phoneHref}` },
    { label: c.instagram.label, value: `@${contact.instagram}`, href: `https://instagram.com/${contact.instagram}` },
    { label: c.github.label, value: 'alyoshagafurov', href: contact.github },
  ];

  return (
    <>
      <HallHead title={t.contacts.title} script={t.common.responseTime} note={`${t.common.replyWithin} ${t.common.hours}`}>
        <Link href={startHref(lang)} className="btn-bone group">
          {t.common.getQuote}
          <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </HallHead>

      <section className="hall pb-28 md:pb-40">
        <ul className="border-t border-seam">
          {doors.map((door) => (
            <li key={door.label} className="border-b border-seam">
              <a
                href={door.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[1fr_auto] items-center gap-6 py-10 md:py-14"
              >
                <span>
                  <span className="font-display flex items-center gap-4 text-[clamp(2.25rem,5vw,4rem)] leading-tight font-extrabold transition-colors duration-500 group-hover:underline group-hover:decoration-brass group-hover:decoration-2 group-hover:underline-offset-8">
                    {door.icon && <WhatsAppIcon className="size-[0.6em] shrink-0" />}
                    {door.label}
                  </span>
                  <span className="mt-4 block text-base text-bone-2">
                    {door.value} <span className="text-bone-3">· {door.note}</span>
                  </span>
                </span>
                <span className="inline-flex size-14 items-center justify-center rounded-full border border-seam-2 transition-colors duration-500 group-hover:border-brass group-hover:bg-brass group-hover:text-wall md:size-20">
                  <ArrowIcon className="size-5" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <dl className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {small.map((item) => (
            <div key={item.label}>
              <dt className="wall-label">{item.label}</dt>
              <dd className="mt-2">
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="link-quiet text-sm break-all"
                >
                  {item.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
