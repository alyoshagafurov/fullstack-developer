'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

/*
 * Landing teaser — a short intro to a section on the home page with a button
 * that opens the full dedicated page. Optional bullets shown as glass chips.
 */
export default function Teaser({
  eyebrow, title, text, bullets, href, cta, alt,
}: {
  eyebrow: string; title: string; text: string; bullets?: string[];
  href: string; cta: string; alt?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} className={`relative py-24 md:py-32 ${alt ? 'bg-bg-2/30' : ''}`}>
      <div className="mx-auto max-w-wide px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <div data-reveal="0" className="label mb-6">{eyebrow}</div>
          <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.4rem] max-w-xl mb-6">{title}</SplitText>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-md mb-9">{text}</p>
          <Link href={href} data-hover data-cursor={cta} className="group inline-flex items-center gap-3 text-ink text-[15px]">
            {cta}
            <span className="w-10 h-10 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all duration-500">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        {bullets && bullets.length > 0 && (
          <div data-reveal="2" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bullets.map((b, i) => (
              <div key={i} className="glass !rounded-2xl px-5 py-4 flex items-center gap-3 text-ink-2 text-[14px]">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                {b}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
