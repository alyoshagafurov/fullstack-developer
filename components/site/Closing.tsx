import { Contact } from '@/components/site/Contact';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/* The way in that ends every page: one headline, WhatsApp, the form. */
export function Closing({ lang, t }: { lang: Locale; t: Dictionary }) {
  const l = t.landing;
  return (
    <Contact
      title={l.closeTitle}
      note={l.closeNote}
      form={l.closeForm}
      formHref={startHref(lang)}
      whatsapp={t.common.whatsapp}
      whatsappHref={whatsappHref(t)}
      links={[
        { label: `Telegram @${site.contact.telegram}`, href: `https://t.me/${site.contact.telegram}` },
        { label: `Instagram @${site.contact.instagram}`, href: `https://instagram.com/${site.contact.instagram}` },
        { label: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
      ]}
    />
  );
}
