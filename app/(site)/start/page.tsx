import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { BriefForm } from '@/components/brief/BriefForm';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Оставить заявку',
  description: site.contactInvite,
  alternates: { canonical: '/start' },
};

/*
 * The brief page.
 *
 * The greeting carries no button: the visitor already pressed the one that
 * brought them here, and a second pointing at the same place is noise.
 *
 * The column beside the form answers what people actually want to know before
 * filling one in — how long it takes, what happens next, what to do when they
 * do not know an answer — rather than listing what the owner would like to
 * receive.
 */
export default function StartPage() {
  const steps = [
    {
      step: '1',
      title: 'Вы заполняете форму',
      body: 'Четыре шага, меньше двух минут. Технические слова не нужны.',
    },
    {
      step: '2',
      title: 'Я читаю и отвечаю',
      body: `${site.responseTime}. Напишу на почту или в Telegram — куда вам удобнее.`,
    },
    {
      step: '3',
      title: 'Созваниваемся',
      body: 'Задаю вопросы, предлагаю, как это лучше сделать. Ни к чему не обязывает.',
    },
    {
      step: '4',
      title: 'Присылаю предложение',
      body: 'Что делаем, за сколько и в какой срок. Дальше решаете вы.',
    },
  ];

  return (
    <>
      <PageOpening
        eyebrow="Заявка"
        title={site.contactInvite}
        lede={`Четыре коротких шага. Отвечаю ${site.responseTime.toLowerCase()}.`}
        cta={false}
      />

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          <BriefForm />

          <aside className="lg:pt-4">
            <p className="label mb-6">Как это работает</p>

            <ol className="space-y-6">
              {steps.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="tabular mt-0.5 shrink-0 text-sm text-ink-3">{item.step}</span>
                  <span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                      {item.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-12 border-t border-line pt-8">
              <p className="text-sm leading-relaxed text-ink-2">
                Не знаете, что писать в каком-то поле? Пропустите его или напишите как есть.
                Разберёмся вместе — так бывает почти всегда.
              </p>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <p className="label mb-4">Написать напрямую</p>
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
