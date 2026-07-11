'use client';

import { useI18n } from '@/lib/i18n';

/*
 * A quiet trust strip: an infinite, edge-faded marquee of the stack. Reads as
 * "here's what I build with" without shouting. Two rows drifting in opposite
 * directions add depth.
 */

const ROW = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS',
  'Framer Motion', 'GSAP', 'Prisma', 'Redis', 'Docker', 'Vercel',
];

export default function Marquee() {
  const { t } = useI18n();
  return (
    <section className="relative py-14 md:py-20 border-y border-line overflow-hidden">
      <div className="mx-auto max-w-wide px-6 md:px-10 mb-8">
        <p className="text-center label">{t.marquee.title}</p>
      </div>
      <div className="mask-fade-x">
        <div className="marquee-track">
          <Row /> <Row />
        </div>
      </div>
      <div className="mask-fade-x mt-6 opacity-50">
        <div className="marquee-track marquee-rev">
          <Row rev /> <Row rev />
        </div>
      </div>
    </section>
  );
}

function Row({ rev }: { rev?: boolean }) {
  const items = rev ? [...ROW].reverse() : ROW;
  return (
    <div className="flex items-center shrink-0">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-7 md:px-9 text-2xl md:text-3xl font-medium tracking-tight text-ink-2 hover:text-ink transition-colors">
            {t}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
        </span>
      ))}
    </div>
  );
}
