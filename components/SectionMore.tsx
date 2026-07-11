'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/*
 * "Learn more" button appended at the bottom of a full landing section. Shown
 * only when a section is given a `moreHref` (i.e. on the landing) — on the
 * dedicated pages the sections render without it.
 */
export default function SectionMore({ href, label }: { href: string; label?: string }) {
  const { t } = useI18n();
  return (
    <div className="mt-14 md:mt-20 flex justify-center">
      <Link
        href={href}
        data-hover
        data-cursor={label || t.common.more}
        className="group inline-flex items-center gap-3 rounded-full border border-line-2 bg-white/[0.02] px-7 py-4 text-ink text-[15px] hover:bg-white/[0.06] transition-colors"
      >
        {label || t.common.more}
        <span className="w-8 h-8 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all duration-500">
          <ArrowRight size={15} />
        </span>
      </Link>
    </div>
  );
}
