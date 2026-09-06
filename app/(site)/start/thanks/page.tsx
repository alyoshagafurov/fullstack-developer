import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { thanksMessage } from '@/lib/content/brief';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Заявка отправлена',
  robots: { index: false, follow: false },
};

/*
 * The confirmation carries the reference number, because "we got it" without a
 * number is not something a client can act on later.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; code?: string }>;
}) {
  const { ref, code } = await searchParams;
  const codeValid = code && /^[a-f0-9]{32}$/.test(code) ? code : null;

  return (
    <Band tone="ground" innerClassName="flex min-h-[100svh] flex-col justify-center py-32">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_16rem] md:gap-20">
        <div>
          <p className="label mb-6">Готово</p>
          <h1 className="max-w-2xl text-[clamp(1.875rem,4.6vw,3.25rem)] leading-[1.12] tracking-[-0.035em]">
            {thanksMessage}
          </h1>

          {ref && (
            <div className="mt-12 border-t border-line pt-6">
              <p className="label mb-3">Номер заявки</p>
              <p className="tabular text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.02em]">{ref}</p>
              <p className="mt-3 text-sm text-ink-2">
                Сохраните его — по нему я быстро найду вашу заявку.
              </p>
              {codeValid && (
                <div className="mt-8">
                  <p className="label mb-3">Код для проверки статуса в Telegram</p>
                  <p className="tabular font-mono text-sm break-all">{codeValid}</p>
                  <p className="mt-3 text-sm text-ink-2">
                    Напишите боту{' '}
                    <a
                      href={`https://t.me/${site.contact.bot}?start=status`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      @{site.contact.bot}
                    </a>{' '}
                    номер заявки и этот код — он ответит, на каком этапе проект. Код показывается
                    один раз.
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="mt-10 max-w-md text-base leading-relaxed text-ink-2">
            Отвечаю {site.responseTime.toLowerCase()}. Если нужно срочно — напишите в Telegram.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CTA href={`https://t.me/${site.contact.telegram}`}>Написать в Telegram</CTA>
            <PillLink href="/" variant="outline">
              На главную
            </PillLink>
          </div>
        </div>

        <div className="relative aspect-square w-40 justify-self-start md:w-full md:justify-self-end">
          <StudioObject src="/objects/laptop.webp" alt="" sizes="(min-width: 768px) 16rem, 10rem" />
        </div>
      </div>
    </Band>
  );
}
