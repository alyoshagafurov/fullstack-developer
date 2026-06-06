import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Алишер Гафуров — Full-Stack разработчик',
  description:
    'Портфолио Алишера Гафурова — Full-Stack веб-разработчик из Душанбе. Создаю современные, быстрые и функциональные сайты под ключ.',
  openGraph: {
    title: 'Алишер Гафуров — Full-Stack разработчик',
    description: 'Современные сайты под ключ — быстро, чисто и профессионально.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#F4F1EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* If JS is disabled, never keep reveal content hidden. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
