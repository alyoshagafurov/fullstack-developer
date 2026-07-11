'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, LANGS, type Lang } from '@/lib/i18n';

const SHORT: Record<Lang, string> = { ru: 'RU', tg: 'TJ', en: 'EN' };

/* Language switcher — a compact globe button with a RU / TJ / EN dropdown. */
export default function LangSwitcher({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        data-hover
        aria-label="Сменить язык / Change language"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-3 py-2 text-[13px] text-ink-2 hover:text-ink hover:border-line-2 transition-colors"
      >
        <Globe size={15} strokeWidth={1.6} />
        <span className="tabular-nums tracking-wide">{SHORT[lang]}</span>
      </button>

      <div
        className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-[calc(100%+8px)] w-44 origin-top rounded-2xl border border-line bg-card/95 backdrop-blur-xl p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] transition-all duration-200 ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="listbox"
      >
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => {
              setLang(l);
              setOpen(false);
            }}
            data-hover
            role="option"
            aria-selected={lang === l}
            className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[14px] transition-colors ${
              lang === l ? 'bg-white/[0.06] text-ink' : 'text-ink-2 hover:text-ink hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-[11px] text-muted w-6 tabular-nums">{SHORT[l]}</span>
              {t.langNames[l]}
            </span>
            {lang === l && <Check size={15} />}
          </button>
        ))}
      </div>
    </div>
  );
}
