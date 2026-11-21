import type { Metadata } from 'next';
import { BriefForm } from '@/components/brief/BriefForm';
import { WhatsAppIcon } from '@/components/museum/Icons';
import { whatsappHref } from '@/components/museum/links';
import { projectTypes } from '@/lib/content/brief';
import { site } from '@/lib/content/site';
import { alternatesFor } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The request. One question per screen, already answered where the visitor
 * picked a direction on the way in (?type=…). For anyone who would rather
 * talk than fill a form, WhatsApp and Telegram wait in the corner.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.start.metaTitle,
    description: `${t.closing.invite} ${t.closing.hint}`,
    alternates: alternatesFor(lang, '/start'),
  };
}

export default async function StartPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { lang, t } = await getDictionary();
  const { type } = await searchParams;
  const initialType = (projectTypes as readonly string[]).includes(type ?? '') ? type : undefined;

  return (
    <section className="relative min-h-[100svh] bg-wall">
      <div className="hall flex min-h-[100svh] flex-col pt-28 pb-16 md:pt-32">
        <div className="flex-1">
          <BriefForm lang={lang} copy={t.brief} initialType={initialType} />
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-seam pt-8 md:flex-row md:items-end md:justify-between">
          <p className="wall-note">{t.start.unsure}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm md:justify-end">
            <a href={whatsappHref(t)} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex items-center gap-2">
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
            <a href={`https://t.me/${site.contact.telegram}`} target="_blank" rel="noopener noreferrer" className="link-quiet">
              Telegram @{site.contact.telegram}
            </a>
            <a href={`mailto:${site.contact.email}`} className="link-quiet">
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
