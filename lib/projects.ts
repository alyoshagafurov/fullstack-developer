/*
 * Structural project list (order, index, year, live link). The translatable
 * text (title, summary, problem, solution, …) lives in the i18n dictionaries
 * under `cases[slug]` so it switches with the language.
 */

export type ProjectMeta = { slug: string; index: string; year: string; liveUrl?: string };

export const projects: ProjectMeta[] = [
  { slug: 'landing', index: '01', year: '2025', liveUrl: '#' },
  { slug: 'business', index: '02', year: '2025', liveUrl: '#' },
  { slug: 'webapp', index: '03', year: '2026', liveUrl: '#' },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
