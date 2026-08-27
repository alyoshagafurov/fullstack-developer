'use client';

import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Reveal from '@/components/ui/Reveal';
import Frame from '@/components/ui/Frame';
import { useI18n } from '@/lib/i18n';

/*
 * 05 — Personal brand.
 *
 * Composition: two photographs at different scales and different corner
 * treatments, one overlapping the other, held against a text column that
 * starts lower than they do. The facts run underneath as a mono row, so the
 * section ends on data rather than prose.
 *
 * The small frame is square and hard-cornered; the large one is tall and
 * rounded — the brief forbids one shared radius.
 */
export default function Studio() {
  const { t } = useI18n();
  const a = t.about;

  return (
    <section id="studio" className="relative py-rhythm-l bg-base-deep">
      <Shell grid className="gap-y-14 items-start">
        {/* layered photographs */}
        <div className="col-span-12 md:col-span-5 relative">
          <Frame
            src="/lifestyle-macbook.jpg"
            alt="Рабочее место"
            ratio="4/5"
            focus="52% 45%"
            corner="lg"
            tone={0.1}
            sizes="(max-width:768px) 90vw, 40vw"
            className="w-[86%]"
          />
          <Frame
            src="/workspace-detail.jpg"
            alt="Деталь рабочего стола"
            ratio="1/1"
            focus="60% 55%"
            corner="none"
            tone={0.12}
            sizes="(max-width:768px) 40vw, 18vw"
            className="absolute -bottom-10 right-0 w-[44%] ring-1 ring-line-2"
          />
        </div>

        {/* text column, deliberately dropped */}
        <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-20 mt-16 md:mt-0">
          <Meta rule className="mb-6">05 — {a.eyebrow}</Meta>
          <h2 className="display text-d-m text-ink mb-8 max-w-[16ch]">{a.title}</h2>
          <div className="space-y-5 max-w-text">
            <p className="text-body text-ink-2">{a.p1}</p>
            <p className="text-body text-ink-2">{a.p2}</p>
            <p className="text-body text-ink-3">{a.p3}</p>
          </div>
        </div>

        {/* facts as a mono row */}
        <Reveal className="col-span-12 mt-6 md:mt-16">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
            {a.facts.map((f) => (
              <div key={f.k} className="bg-base-deep px-5 py-6">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3 mb-2">{f.k}</dt>
                <dd className="text-body text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Shell>
    </section>
  );
}
