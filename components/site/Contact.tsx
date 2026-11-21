'use client';

import Link from 'next/link';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { Rise, Words } from '@/components/site/Reveal';

/* The way in that ends the home page and every inner page: one headline, WhatsApp, the form. */
export function Contact({
  title,
  note,
  form,
  formHref,
  whatsapp,
  whatsappHref,
  links,
}: {
  title: string;
  note: string;
  form: string;
  formHref: string;
  whatsapp: string;
  whatsappHref: string;
  links: { label: string; href: string }[];
}) {
  return (
    <section data-doors aria-labelledby="contact-title" className="relative overflow-hidden py-32 md:py-48">
      <div className="hall flex flex-col items-center text-center">
        <Words id="contact-title" text={title} className="hall-title max-w-[12ch] text-[clamp(3rem,9vw,9rem)]" />
        <Rise delay={0.15}>
          <p className="lead-line mx-auto mt-6 max-w-md">{note}</p>
        </Rise>
        <Rise delay={0.25} className="mt-12 flex flex-wrap justify-center gap-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-bone group bg-whatsapp! text-[#0b0b0c]!">
            <WhatsAppIcon className="size-5" />
            {whatsapp}
          </a>
          <Link href={formHref} className="btn-line group">
            {form}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </Rise>
        <Rise delay={0.35}>
          <ul className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-light">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="link-quiet">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Rise>
      </div>
    </section>
  );
}
