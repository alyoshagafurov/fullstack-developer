import Link from 'next/link';
import { Badge } from '@/components/site/Badge';
import { ArrowIcon } from '@/components/museum/Icons';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The way out (concept D): on black, one warm rounded block with the question,
 * the request button and the turning WhatsApp badge. Ends every page.
 */
export function Closing({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section data-doors data-tone="dark" className="bg-wall px-3 py-16 md:px-6 md:py-24" aria-labelledby="close-title">
      <div data-tone="light" className="mx-auto max-w-[1440px] rounded-[36px] bg-wall px-6 py-20 md:px-16 md:py-28">
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="close-title" data-rise className="hall-title text-[clamp(2.5rem,8vw,7.5rem)]">
              <span className="line-mask">
                <span>{t.home.closeTitle[0]}</span>
              </span>
            </h2>
            <p className="lead-line mt-5 max-w-lg">{t.home.closeNote}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={startHref(lang)} className="btn-bone group">
                {t.common.getQuote}
                <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <a href={`https://t.me/${site.contact.telegram}`} target="_blank" rel="noopener noreferrer" className="btn-line">
                Telegram
              </a>
            </div>
          </div>
          <Badge href={whatsappHref(t)} text={t.home.badge} label={t.common.whatsapp} />
        </div>
      </div>
    </section>
  );
}
