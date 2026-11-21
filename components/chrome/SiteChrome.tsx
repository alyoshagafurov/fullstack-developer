'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { Header, type HeaderCopy } from '@/components/chrome/Header';
import { StickyCta } from '@/components/chrome/StickyCta';

/* The header and the floating doors share one piece of state: whether the menu is open. */
export function SiteChrome({ lang, copy, whatsappHref }: { lang: Locale; copy: HeaderCopy; whatsappHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Header lang={lang} copy={copy} open={open} setOpen={setOpen} whatsappHref={whatsappHref} />
      <StickyCta
        lang={lang}
        label={copy.getQuote}
        whatsappLabel={copy.whatsapp}
        whatsappHref={whatsappHref}
        menuOpen={open}
      />
    </>
  );
}
