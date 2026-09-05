import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { BriefForm } from '@/components/brief/BriefForm';
import { kickoff } from '@/lib/content/process';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Оставить заявку',
  description: site.contactInvite,
  alternates: { canonical: '/start' },
};

export default function StartPage() {
  return (
    <>
      <Band tone="ground" innerClassName="pt-36 pb-16 md:pt-44 md:pb-20">
        <p className="label mb-6">Заявка</p>
        <h1 className="max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.04em]">
          {site.contactInvite}
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-2">
          Отвечаю {site.responseTime.toLowerCase()}. {site.hours}
        </p>
      </Band>

      <Band tone="paper" innerClassName="py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          <BriefForm />

          <aside className="lg:pt-4">
            <p className="label mb-6">Что мне пригодится</p>
            <p className="text-sm leading-relaxed text-ink-2">{kickoff.intro}</p>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink-2">
              {kickoff.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-3">{kickoff.outro}</p>

            <div className="mt-12 border-t border-line pt-8">
              <p className="label mb-4">Или просто напишите</p>
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
          </aside>
        </div>
      </Band>
    </>
  );
}
