import { Finale } from '@/components/home/Showroom';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/* The way in that ends every inner page: the same "Shall we start?" as the home. */
export function Closing({ lang, t }: { lang: Locale; t: Dictionary }) {
  const s = t.showroom;
  return (
    <Finale
      title={s.finalTitle}
      sub={s.finalSub}
      cta={s.cta}
      ctaHref={startHref(lang)}
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
