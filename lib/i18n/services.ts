import type { Service } from '@/lib/content/services';
import type { Dictionary } from './en';

/*
 * A service in the page's language.
 *
 * lib/content/services.ts stays the owner's original list — the bot, the Mini
 * App and the admin read it — and supplies what never changes with language:
 * the slug, the number, the object. The words come from the dictionary.
 */
export function localizeService(service: Service, t: Dictionary): Service {
  const copy = t.services.items[service.slug];
  return copy ? { ...service, ...copy } : service;
}
