'use client';

import Link from 'next/link';
import { ArrowUp, Send, Instagram, Mail, Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const SOCIAL = [
  { icon: Send, label: 'Telegram', href: 'https://t.me/alishergafurovv' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/alishergafurow' },
  { icon: Mail, label: 'Email', href: 'mailto:gafurovalyosha@gmail.com' },
  { icon: Phone, label: 'Phone', href: 'tel:+992918793231' },
];

export default function Footer({ home = true }: { home?: boolean }) {
  const { t } = useI18n();

  const NAV = [
    { id: 'work', label: t.nav.work },
    { id: 'services', label: t.nav.services },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];

  const top = () => {
    const lenis = (window as any).lenis;
    if (lenis?.scrollTo) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto max-w-wide px-6 md:px-10 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="display text-ink text-3xl md:text-4xl tracking-tight">
              Alisher<span className="text-dim">/</span>Gafurov
            </div>
            <p className="mt-4 text-ink-2 text-[15px] max-w-xs leading-relaxed">{t.footer.tagline}</p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" data-hover aria-label={s.label}
                  className="w-10 h-10 rounded-xl border border-line bg-white/[0.02] grid place-items-center text-ink-2 hover:text-ink hover:border-line-2 transition-colors">
                  <s.icon size={17} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="label mb-5">{t.footer.navTitle}</div>
            <ul className="space-y-3">
              {NAV.map((n) => (
                <li key={n.id}>
                  {home ? (
                    <a href={`#${n.id}`} data-hover className="text-ink-2 hover:text-ink text-[15px] link-underline transition-colors">{n.label}</a>
                  ) : (
                    <Link href={`/#${n.id}`} data-hover className="text-ink-2 hover:text-ink text-[15px] link-underline transition-colors">{n.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="label mb-5">{t.footer.contactTitle}</div>
            <a href="mailto:gafurovalyosha@gmail.com" data-hover className="block text-ink hover:text-white text-[15px] link-underline mb-3">gafurovalyosha@gmail.com</a>
            <a href="https://t.me/alishergafurovv" data-hover className="block text-ink-2 hover:text-ink text-[15px] link-underline mb-6">@alishergafurovv</a>
            <div className="label text-[10px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white pulse-soft" /> {t.footer.location}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="label text-[10px]">{t.footer.rights}</span>
          <button onClick={top} data-hover className="group inline-flex items-center gap-2 text-ink-2 hover:text-ink text-[13px] transition-colors">
            {t.footer.up}
            <span className="w-8 h-8 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all">
              <ArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
