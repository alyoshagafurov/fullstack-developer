import type { MetadataRoute } from 'next';
import { DEFAULT_DESCRIPTION } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Alisher Gafurov (ALY) — Full-Stack разработчик',
    short_name: 'ALY',
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ru',
    dir: 'ltr',
    categories: ['business', 'portfolio', 'productivity', 'technology'],
    background_color: '#0C0C0E',
    theme_color: '#0C0C0E',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
