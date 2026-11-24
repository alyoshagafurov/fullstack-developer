import { Finale } from '@/components/home/Showroom';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/* The way in that ends every inner page: the same last screen as the home. */
export function Closing({ lang, t }: { lang: Locale; t: Dictionary }) {
  const s = t.showroom;
  return (
    <Finale
      title={s.finalTitle}
      sub={s.finalSub}
      cta={s.cta}
      ctaHref={startHref(lang)}
      or={s.finalOr}
      whatsapp={t.common.whatsapp}
      whatsappHref={whatsappHref(t)}
      telegram="Telegram"
      telegramHref={`https://t.me/${site.contact.telegram}`}
      links={[
        { label: `Instagram @${site.contact.instagram}`, href: `https://instagram.com/${site.contact.instagram}` },
        { label: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
      ]}
    />
  );
}
