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
 * The confirmation, and the one thing the client should do next.
 *
 * The reference number is here because "we got it" without a number is not
 * something anyone can act on later. But the number alone leaves the client
 * waiting in silence, so the page hands them the bot: it answers what stage
 * the project is at and writes to them when the stage changes.
 *
 * The bot is the big button, not the owner's personal Telegram. Sending a
 * client to a person for a status they can have on demand costs the owner an
 * interruption and the client a wait; his own account stays here as the
 * quieter second option, for when there is something to actually say.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; code?: string }>;
}) {
  const { ref, code } = await searchParams;
  const codeValid = code && /^[a-f0-9]{32}$/.test(code) ? code : null;
  const bot = `https://t.me/${site.contact.bot}?start=status`;

  return (
    <Band tone="ground" innerClassName="flex min-h-[100svh] flex-col justify-center py-28 md:py-32">
      <div className="grid items-start gap-14 md:grid-cols-[1fr_14rem] md:gap-20">
        <div>
          <p className="label mb-6">Готово</p>
          <h1 className="max-w-2xl text-[clamp(1.875rem,4.6vw,3.25rem)] leading-[1.12] tracking-[-0.035em]">
            {thanksMessage}
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-ink-2">
            Отвечаю {site.responseTime.toLowerCase()}.
          </p>

          {/*
            The next step, given its own surface so it does not read as one
            more paragraph: the bot, the number, and the code, together.
          */}
          <div className="mt-12 rounded-2xl bg-paper p-7 shadow-[0_1px_2px_rgba(11,11,11,0.05)] md:p-9">
            <p className="label mb-4">Следите за работой в Telegram</p>

            <p className="max-w-lg text-base leading-relaxed">
              Откройте бота — он покажет, на каком этапе ваш проект, и напишет вам сам, когда этап
              сменится.
            </p>

            {ref && (
              <dl className="mt-7 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
                <div>
                  <dt className="label mb-2">Номер заявки</dt>
                  <dd className="tabular text-[1.375rem] tracking-[-0.02em]">{ref}</dd>
                </div>
                {codeValid && (
                  <div className="min-w-0">
                    <dt className="label mb-2">Код для бота</dt>
                    <dd className="font-mono text-[0.8125rem] break-all text-ink-2">{codeValid}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-8">
              <CTA href={bot} size="lg">
                Открыть бота в Telegram
              </CTA>
            </div>

            {codeValid && (
              <p className="mt-5 text-sm leading-relaxed text-ink-3">
                Бот спросит номер заявки и код. Сохраните их: код показывается один раз.
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <PillLink href={`https://t.me/${site.contact.telegram}`} variant="outline">
              Написать мне лично
            </PillLink>
            <PillLink href="/" variant="outline">
              На главную
            </PillLink>
          </div>
        </div>

        <div className="relative aspect-square w-40 justify-self-start md:w-full md:justify-self-end">
          <StudioObject src="/objects/laptop.webp" alt="" sizes="(min-width: 768px) 14rem, 10rem" />
        </div>
      </div>
    </Band>
  );
}
