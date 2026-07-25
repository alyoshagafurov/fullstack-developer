/*
 * Structural project list (order, index, year, live link, cover screenshot).
 * The translatable text lives in the i18n dictionaries under cases[slug].
 */

export type ProjectMeta = { slug: string; index: string; year: string; liveUrl?: string; cover: string };

export const projects: ProjectMeta[] = [
  { slug: 'obi', index: '01', year: '2026', liveUrl: 'https://obibackend-production.up.railway.app', cover: '/work-obi.jpg' },
  { slug: 'pixeloff', index: '02', year: '2025', liveUrl: 'https://pixeloff.ru', cover: '/work-pixeloff.jpg' },
  { slug: 'mimi', index: '03', year: '2026', liveUrl: 'https://www.mimitj.agency', cover: '/work-mimi.jpg' },
  { slug: 'aly', index: '04', year: '2025', liveUrl: 'https://aly-web-page.vercel.app', cover: '/work-aly.jpg' },
  { slug: 'sibirpivo', index: '05', year: '2025', liveUrl: 'https://sibirpivo.ru', cover: '/work-sibirpivo.jpg' },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
