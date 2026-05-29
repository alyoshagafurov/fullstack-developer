import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Алишер Гафуров — Full-Stack разработчик · MMA боец',
  description:
    'Портфолио Алишера Гафурова — Full-Stack веб-разработчик из Душанбе. Создаю современные, быстрые и функциональные сайты.',
  openGraph: {
    title: 'Алишер Гафуров — Full-Stack разработчик',
    description: 'Современные сайты под ключ. Два мира, один характер.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
