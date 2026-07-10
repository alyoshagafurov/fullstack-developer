import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Алишер Гафуров — Full-Stack разработчик',
    short_name: 'A. Gafurov',
    description: 'Современные сайты и веб-приложения под ключ.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070707',
    theme_color: '#070707',
    icons: [{ src: '/icon', sizes: 'any', type: 'image/png' }],
  };
}
