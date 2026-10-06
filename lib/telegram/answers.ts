import 'server-only';
import { InlineKeyboard } from 'grammy';
import { site } from '@/lib/content/site';
import { process as stages, kickoff, terms } from '@/lib/content/process';
import { getPriceList, type PricedService } from '@/lib/prices';
import { getPublishedCases } from '@/lib/cases';
import { escapeHtml } from '@/lib/telegram/api';
import type { Intent, ServiceSlug } from '@/lib/telegram/intents';
import { clientButtons, glue } from '@/lib/telegram/texts';

/*
 * What the bot says back, once intents.ts has worked out what was asked.
 *
 * Every fact in here is the owner's own, read from the same modules the site
 * renders, so the bot and the site cannot disagree — and nothing in here is
 * invented to fill a gap. Where his content is silent the answer is not
 * written: the message goes to him, exactly as every message used to.
 *
 * Prices come from `getPriceList`, not from services.ts directly. He can change
 * a price or hide a service from the admin, and a bot quoting last month's
 * figure, or a service he has stopped offering, would be speaking for him with
 * words he has withdrawn. A hidden service is not named at all.
 *
 * Some answers also go to the owner. Someone asking what a thing costs, how
 * long it takes or whether he can do it is as close to buying as a stranger
 * gets, and the bot answering instantly should not mean the owner never hears
 * that they asked. He gets the question with the relay marker, so a reply goes
 * straight back to them — the bot gives the number, he gives the person.
 */

export type Answer = {
  text: string;
  keyboard?: InlineKeyboard;
  /** Pass the question on to the owner as well: this is a buying signal. */
  relay: boolean;
};

const html = (s: string | null | undefined) => escapeHtml(s ?? '');

/* ------------------------------------------------------------- buttons -- */

const apply = () => new InlineKeyboard().webApp(clientButtons.brief, `${site.url}/mini/start`);
const writeTo = (k: InlineKeyboard) => k.url(clientButtons.dm, `https://t.me/${site.contact.telegram}`);

/* -------------------------------------------------------------- prices -- */

/*
 * The content files capitalise each value because each one stands alone on
 * the site — «От 700 сомони», «От 3 дней до 2 недель». Joined into one line of
 * chat they would read «от 700 сомони, От 3 дней», so the first letter comes
 * down where a value follows a dash or a comma.
 */
const lower = (s: string | null) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : null);

/** «Landing Pages — от 700 сомони, 4–6 дней». Nothing said that is not on file. */
function priceLine(s: PricedService): string {
  return `${html(s.title)} — ${html([lower(s.price), lower(s.term)].filter(Boolean).join(', '))}`;
}

function termLine(s: PricedService): string {
  return `${html(s.title)} — ${html(lower(s.term) ?? 'по задаче')}`;
}

/** The services asked about that the owner still offers, in the order asked. */
async function pick(slugs: ServiceSlug[]): Promise<{ all: PricedService[]; asked: PricedService[] }> {
  const all = await getPriceList();
  const asked = slugs
    .map((slug) => all.find((s) => s.slug === slug))
    .filter((s): s is PricedService => Boolean(s));
  return { all, asked };
}

/** process.ts, stage 02 — said once, the same way, wherever a price is quoted. */
const EXACT =
  'Точную стоимость определяем на этапе «План и предложение» — после того как разберём задачу.';

/* -------------------------------------------------------------- answer -- */

/**
 * The reply to an intent, or null when the bot should say nothing of its own
 * and hand the message to the owner instead.
 */
export async function answerFor(intent: Intent): Promise<Answer | null> {
  switch (intent.kind) {
    case 'price': {
      const { all, asked } = await pick(intent.services);
      // Asked about something he no longer offers: not the bot's to answer.
      if (intent.services.length > 0 && asked.length === 0) return null;

      const lines = (asked.length > 0 ? asked : all).map(priceLine);
      const head = asked.length > 0 ? '' : 'Цены на старт:\n';
      return {
        text: `${head}${lines.join('\n')}\n\n${EXACT}`,
        keyboard: apply().row().url(clientButtons.prices, `${site.url}/prices`),
        relay: true,
      };
    }

    case 'timeline': {
      const { asked } = await pick(intent.services);
      if (intent.services.length > 0 && asked.length === 0) return null;

      if (asked.length > 0) {
        return { text: asked.map(termLine).join('\n'), keyboard: apply(), relay: true };
      }
      /*
       * No service named: the stages, which are what a timeline really is.
       * Not every service's term as well — that made a twenty-four line wall,
       * which in a chat is a reason to stop reading. Six lines and an
       * invitation to ask about one thing get a second message instead.
       */
      const route = stages.map((s) => `${html(s.title)} — ${html(s.duration)}`).join('\n');
      return {
        text: `Зависит от проекта. По этапам обычно так:\n\n${route}\n\nНапишите, что именно нужно — скажу срок точнее.`,
        keyboard: apply(),
        relay: true,
      };
    }

    case 'order': {
      const { asked } = await pick(intent.services);
      if (asked.length === 0) return null;
      return {
        text: `Да, это делаю.\n\n${asked.map(priceLine).join('\n')}\n\nЧтобы начать — оставьте заявку, это пара минут. ${html(kickoff.outro)}`,
        keyboard: apply(),
        relay: true,
      };
    }

    case 'discount': {
      // about.ts: «…и я всё равно не снижаю цену». His principle in his words,
      // then what he does instead, from stage 02 of process.ts.
      const plan = stages[1].body;
      return {
        text: `Цену не снижаю. Зато на этапе плана ${html(plan.charAt(0).toLowerCase() + plan.slice(1))}`,
        keyboard: writeTo(apply().row()),
        relay: true,
      };
    }

    case 'payment':
      return { text: html(terms[0].value), keyboard: writeTo(new InlineKeyboard()), relay: true };

    case 'revisions':
      return { text: `${html(terms[1].value)} ${html(terms[2].value)}`, relay: false };

    case 'portfolio': {
      const cases = (await getPublishedCases()).slice(0, 4);
      const keyboard = new InlineKeyboard();
      for (const row of cases) keyboard.url(row.title, `${site.url}/work/${row.slug}`).row();
      keyboard.url(clientButtons.work, `${site.url}/work`);
      const proof = site.stats[0];
      return {
        text: `${cases.length > 0 ? 'Несколько работ — остальные на сайте.' : 'Работы — на сайте.'}\n${html(proof.value)} ${html(proof.label)}.`,
        keyboard,
        relay: false,
      };
    }

    case 'process':
      return {
        text: `${stages
          .map((s) => `${Number(s.num)}. ${html(s.title)} — ${html(s.duration)}`)
          .join('\n')}\n\n${html(terms[0].value)}`,
        keyboard: apply(),
        relay: false,
      };

    case 'about':
      return {
        text: `Алишер Гафуров, ${html(site.role.toLowerCase())} из Душанбе.\n\n${html(site.difference)}\n\n${html(site.stats[0].value)} ${html(site.stats[0].label)}.`,
        keyboard: new InlineKeyboard().url(clientButtons.about, `${site.url}/about`),
        relay: false,
      };

    case 'contacts':
      return {
        text: [
          `Telegram: @${html(site.contact.telegram)}`,
          `Телефон: ${html(site.contact.phone)}`,
          `Почта: ${html(site.contact.email)}`,
          '',
          html(site.hours),
          `Отвечаю ${html(site.responseTime.toLowerCase())}.`,
        ].join('\n'),
        keyboard: writeTo(new InlineKeyboard()),
        relay: false,
      };

    case 'hours':
      return {
        text: `Отвечаю ${html(site.responseTime.toLowerCase())}. ${html(site.hours)}`,
        relay: false,
      };

    case 'services': {
      const all = await getPriceList();
      return {
        text: `${all.map((s) => html(s.title)).join('\n')}\n\nСпросите про любое — цену и срок скажу сразу.`,
        keyboard: apply().row().url(clientButtons.prices, `${site.url}/prices`),
        relay: false,
      };
    }

    case 'service': {
      const { asked } = await pick(intent.services);
      if (asked.length === 0) return null;
      return {
        text: asked
          .map((s) => `<b>${html(s.title)}</b>\n${html(s.tagline)}\n${priceLine(s)}`)
          .join('\n\n'),
        keyboard: apply(),
        relay: false,
      };
    }

    case 'bot-self':
      return {
        text: 'Да, я бот aly. Проекты сам не делаю — мне пока доверили только кнопки 😄 На вопросы про цены, сроки и работу отвечаю сразу, остальное передаю Алишеру.',
        relay: false,
      };

    case 'thanks':
      return { text: glue.welcome, relay: false };

    default:
      // status and greeting are the caller's; `forward` and `unknown` go to
      // the owner untouched.
      return null;
  }
}
