import type { Metadata } from 'next';
import { Manrope, Nunito_Sans, Unbounded } from 'next/font/google';
import '../../globals.css';

/*
 * The lab: five design concepts for the site, side by side, on the owner's
 * real photos and work, so he can point at the one he likes. Not linked from
 * the site and not indexed.
 */

const nunito = Nunito_Sans({ subsets: ['latin', 'cyrillic'], variable: '--font-nunito', display: 'swap' });
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], variable: '--font-unbounded', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'aly — варианты дизайна',
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${nunito.variable} ${unbounded.variable} ${manrope.variable}`}>
      <body style={{ fontFamily: 'var(--font-nunito)', margin: 0 }}>{children}</body>
    </html>
  );
}
