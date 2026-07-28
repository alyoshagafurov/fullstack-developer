import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/*
 * Open to everyone, and EXPLICITLY welcome AI answer engines so the site can be
 * cited by ChatGPT, Claude, Gemini, Perplexity, Copilot and Google AI Overviews.
 */
const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'GoogleOther', 'Applebot', 'Applebot-Extended',
  'Bingbot', 'CCBot', 'cohere-ai', 'Amazonbot', 'DuckDuckBot', 'YandexBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
