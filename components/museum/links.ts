import { site } from '@/lib/content/site';
import { localePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/** A WhatsApp chat with the owner, opened with a first line already typed. */
export function whatsappHref(t: Pick<Dictionary, 'common'>): string {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(t.common.whatsappText)}`;
}

/** The request form, optionally with the project type already chosen. */
export function startHref(lang: Locale, type?: string): string {
  const base = localePath(lang, '/start');
  return type ? `${base}?type=${encodeURIComponent(type)}` : base;
}

/** Which answer of the request form each service stands for. */
export const SERVICE_TYPE: Record<string, string> = {
  sites: 'Сайт',
  landing: 'Landing Page',
  corporate: 'Корпоративный сайт',
  ecommerce: 'Интернет-магазин',
  'web-apps': 'Web-приложение',
  crm: 'CRM-система',
  automation: 'Автоматизация',
  redesign: 'Редизайн',
  mvp: 'MVP стартапа',
  android: 'Android-приложение',
  ios: 'iOS-приложение',
  'telegram-bots': 'Telegram-бот',
  'telegram-mini-apps': 'Telegram Mini App',
  support: 'Поддержка и развитие',
};

/** The four halls of the services page, and which services hang in each. */
export const SERVICE_HALLS: { key: string; lead: string; rest: string[] }[] = [
  { key: 'sites', lead: 'sites', rest: ['landing', 'corporate', 'redesign'] },
  { key: 'stores', lead: 'ecommerce', rest: [] },
  { key: 'bots', lead: 'telegram-bots', rest: ['telegram-mini-apps', 'automation'] },
  { key: 'apps', lead: 'web-apps', rest: ['crm', 'mvp', 'android', 'ios', 'support'] },
];
