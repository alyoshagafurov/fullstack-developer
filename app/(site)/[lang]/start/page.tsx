import type { Metadata } from 'next';
import { BriefForm } from '@/components/brief/BriefForm';
import { WhatsAppIcon } from '@/components/museum/Icons';
import { whatsappHref } from '@/components/museum/links';
import { projectTypes } from '@/lib/content/brief';
import { site } from '@/lib/content/site';
import { getDictionary } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo/metadata';

/*
 * The request. One question per screen, already answered where the visitor
 * picked a direction on the way in (?type=…). For anyone who would rather
 * talk than fill a form, WhatsApp and Telegram wait in the corner.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  // ?type=… variants are the same form pre-answered: they all canonicalise to /start
  return pageMetadata({ lang, t, path: '/start', title: t.start.metaTitle, description: t.start.metaDescription });
}

export default async function StartPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { lang, t } = await getDictionary();
  const { type } = await searchParams;
  const initialType = (projectTypes as readonly string[]).includes(type ?? '') ? type : undefined;

  return (
    <section className="relative min-h-[100svh] bg-wall">
      <div className="hall flex min-h-[100svh] flex-col pt-28 pb-16 md:pt-32">
        {/*
         * The heading and the form centred as one block. The form's own
         * min-height (it centres itself when it stands alone) is lifted here,
         * or on a tall screen the heading would float far above the question.
         */}
        <div className="flex flex-1 flex-col justify-center [&>form]:min-h-0">
          {/* the page's one heading, quiet over the form: each screen of the form asks its question in an h2 */}
          <h1 className="mb-8 text-center text-[1.0625rem] font-medium text-bone-2">{t.start.title}</h1>
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
