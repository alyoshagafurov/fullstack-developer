import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { BriefForm } from '@/components/brief/BriefForm';
import { site } from '@/lib/content/site';
import { alternatesFor } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.start.metaTitle,
    description: `${t.closing.invite} ${t.closing.hint}`,
    alternates: alternatesFor(lang, '/start'),
  };
}

/*
 * The brief page.
 *
 * The greeting carries no button: the visitor already pressed the one that
 * brought them here, and a second pointing at the same place is noise. The
 * floating request button sinks out of view on this page for the same reason.
 *
 * Nothing stands beside the form any more. A column of explanation next to a
 * question is a second thing to read while answering the first, and the form
 * now asks one question to a screen precisely so there is only ever one. What
 * that column said still needs saying, so it says it underneath, where a
 * visitor who wants it can go and look and nobody else has to.
 */
export default async function StartPage() {
  const { lang, t } = await getDictionary();

  return (
    <>
      <PageOpening
        eyebrow={t.start.eyebrow}
        title={t.closing.invite}
        lede={t.common.replyWithin}
        stage={false}
      />

      <Band tone="ground" innerClassName="py-14 md:py-20">
        <BriefForm lang={lang} copy={t.brief} />
      </Band>

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:gap-20">
          <div>
            <p className="label mb-8">{t.start.howItWorks}</p>

            <ol className="space-y-6">
              {t.start.steps.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="tabular mt-0.5 shrink-0 text-sm text-ink-3">{index + 1}</span>
                  <span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                      {item.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-sm leading-relaxed text-ink-2">{t.start.unsure}</p>

            <div className="mt-10 border-t border-line pt-8">
              <p className="label mb-4">{t.start.writeDirectly}</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`https://t.me/${site.contact.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center transition-opacity hover:opacity-60"
                  >
                    Telegram @{site.contact.telegram}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="inline-flex min-h-8 items-center transition-opacity hover:opacity-60"
                  >
                    {site.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}
