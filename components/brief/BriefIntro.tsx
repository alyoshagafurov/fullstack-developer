'use client';

import { useI18n } from '@/lib/i18n';
import BriefWizard from './BriefWizard';

/*
 * The client half of /brief: an editorial header in the visitor's language,
 * then the wizard. Kept separate so the route stays a server component and
 * still exports metadata.
 *
 * No card, no panel — the brief sits directly on the page, like the rest of
 * the site. That is what stops it reading as an embedded form product.
 */
export default function BriefIntro() {
  const { t } = useI18n();
  const b = t.brief;

  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="max-w-2xl mb-14 md:mb-20">
          <div className="flex items-center gap-3 label text-[10px] text-accent mb-6">
            <span className="w-7 h-px bg-accent/50" />
            {b.eyebrow}
          </div>
          <p className="display text-ink text-[11vw] sm:text-5xl md:text-[3.4rem] leading-[1.02] mb-6">
            {b.title}
          </p>
          <p className="text-ink-2 text-base md:text-lg leading-relaxed max-w-xl">{b.intro}</p>
        </div>

        <BriefWizard />
      </div>
    </section>
  );
}
