import type { Metadata, Viewport } from 'next';
import { TelegramProvider } from '@/components/mini/telegram';

/*
 * The Telegram Mini App's shell.
 *
 * A sibling of app/(site), and deliberately not a child of it: this group takes
 * the document, the typeface and the design tokens from the root layout and
 * none of the site's chrome. A header reading "Проекты, Услуги, Обо мне" across
 * a window opened over a chat would look like a browser that got loose, and a
 * footer under a form the reader is meant to finish is an invitation to leave.
 *
 * What is inherited matters as much as what is not, so two things are turned
 * back off here. The root sets `robots: { index: true }` and a canonical of
 * '/', which every page in this group would otherwise claim — these are the
 * site's own brief and review forms in a second coat, and they have no business
 * competing with /start and /reviews/new for the same words. And the root's
 * title template would name the window "Заявка — Алишер Гафуров (aly)", an SEO
 * line in the one place no search engine will ever read.
 *
 * The viewport settings are not preferences. A Mini App has no address bar, so
 * a page that zooms cannot be un-zoomed: without `maximumScale` a double tap on
 * a field leaves the reader stranded at 150% with no way back. And without
 * `interactiveWidget: 'resizes-content'` the on-screen keyboard is laid over
 * the page instead of being measured into it, so the field being typed into
 * ends up underneath it.
 */

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content',
  themeColor: '#050505',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: { absolute: 'aly' },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function MiniLayout({ children }: { children: React.ReactNode }) {
  return <TelegramProvider>{children}</TelegramProvider>;
}
