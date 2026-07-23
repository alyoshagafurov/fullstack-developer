'use client';

import { useRef } from 'react';
import { Send, Instagram, Mail, Phone } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import SectionBg from './SectionBg';
import RequestWizard from './RequestWizard';
import { useI18n } from '@/lib/i18n';

const CHANNEL_ICONS = [Send, Mail, Instagram, Phone];

export default function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="contact" ref={ref} className="relative isolate py-28 md:py-44">
      <SectionBg src="/bg-contact.jpg" opacity={0.35} focus="50% 60%" />
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-start">
          {/* Left — pitch + direct channels */}
          <div>
            <div data-reveal="0" className="label mb-6">{c.eyebrow}</div>
            <SplitText as="h2" className="display-tight text-ink text-[12vw] md:text-[4.4rem] max-w-xl">
              {c.title1}
              <br /><span className="text-dim">{c.title2}</span>
            </SplitText>
            <p data-reveal="1" className="mt-7 text-ink-2 text-lg leading-relaxed max-w-md">{c.sub}</p>

            <div data-reveal="2" className="mt-10 grid sm:grid-cols-2 gap-3">
              {c.channels.map((ch, i) => {
                const Icon = CHANNEL_ICONS[i] ?? Send;
                return (
                  <a key={ch.label} href={ch.href} target="_blank" rel="noopener noreferrer" data-hover
                    className="glass !rounded-2xl p-4 flex items-center gap-3.5 group">
                    <span className="w-10 h-10 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink shrink-0">
                      <Icon size={17} strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0">
                      <span className="block label text-[10px] mb-0.5">{ch.label}</span>
                      <span className="block text-ink text-[14px] truncate group-hover:text-white transition-colors">{ch.value}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right — tap-first request wizard */}
          <div data-reveal="1">
            <RequestWizard />
          </div>
        </div>
      </div>
    </section>
  );
}
