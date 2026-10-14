'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { Header, type HeaderCopy } from '@/components/chrome/Header';
import { StickyCta } from '@/components/chrome/StickyCta';

/*
 * The fixed parts of every page: the header at the top, the request button at
 * the bottom. They live together because they share one fact — whether the
 * menu is open — and the button has to sink out of sight the moment it is.
 */
export function SiteChrome({ lang, copy }: { lang: Locale; copy: HeaderCopy }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A link out of the menu changes the page; the menu goes with the old one.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Header lang={lang} copy={copy} open={open} setOpen={setOpen} />
      <StickyCta lang={lang} label={copy.getQuote} menuOpen={open} />
    </>
  );
}
