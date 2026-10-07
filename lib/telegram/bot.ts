import 'server-only';
import { Bot, InlineKeyboard, type Context } from 'grammy';
import { prisma } from '@/lib/prisma';
import { briefSchema } from '@/lib/content/brief';
import { site } from '@/lib/content/site';
import { featuredServices } from '@/lib/content/services';
import { getPublishedCases } from '@/lib/cases';
import { money, type LeadStatusName } from '@/lib/content/finance';
import { getBriefing } from '@/lib/admin/queries';
import { getPriceList } from '@/lib/prices';
import { answerFor } from '@/lib/telegram/answers';
import { classify } from '@/lib/telegram/intents';
import {
  adminIds,
  botToken,
  escapeHtml,
  isAdmin,
  relayTag,
  relayTarget,
  sendWithRetry,
  setMenuButton,
} from '@/lib/telegram/api';
import { createLead, tokenMatches } from '@/lib/telegram/leads';
import { briefReceipt, notifyNewLead } from '@/lib/telegram/notify';
import {
  type BriefStep,
  briefSteps,
  clientButtons,
  clientStatusLine,
  glue,
  ownerGreeting,
  visitorGreeting,
} from '@/lib/telegram/texts';

/*
 * The bot.
 *
 * Two people talk to it and they get two different bots. Anyone whose Telegram
 * id is in TELEGRAM_ADMIN_IDS is the owner: he is told about leads, opens them,
 * moves them along the chain, adds notes, reads the month's numbers. Everyone
 * else is a visitor: they read the greeting, look at the services and the
 * work, leave a brief question by question, and ask after their project with
 * the number and code they were given. The two never overlap — every message
 * and every button press is checked against the id list, not just /start.
 *
 * The bot remembers as little as it can. What it must keep between two webhook
 * calls — where a half-finished brief is, whether a chat asked for silence,
 * how many status checks it has tried this hour — lives in `BotChat`. Leads,
 * statuses and notes are written through exactly the code the admin uses.
 */

/* ------------------------------------------------------------- state -- */

type BriefState = {
  mode: 'brief';
  step: number;
  data: Partial<Record<BriefStep['key'], string>>;
};
type WaitState = { mode: 'lead' | 'note-ref' | 'status' | 'status-ref' };
type NoteState = { mode: 'note'; leadId: string };
type State = BriefState | WaitState | NoteState;

const STATE_TTL_MS = 60 * 60 * 1000;
const STATUS_ATTEMPTS_PER_HOUR = 5;
const BRIEFS_PER_DAY = 3;

async function readState(chatId: string): Promise<State | null> {
  const chat = await prisma.botChat.findUnique({ where: { chatId } });
  if (!chat?.state || !chat.stateUpdatedAt) return null;
  if (Date.now() - chat.stateUpdatedAt.getTime() > STATE_TTL_MS) return null;
  try {
    return JSON.parse(chat.state) as State;
  } catch {
    return null;
  }
}

async function writeState(chatId: string, state: State | null): Promise<void> {
  const value = state ? JSON.stringify(state) : null;
  await prisma.botChat.upsert({
    where: { chatId },
    create: { chatId, state: value, stateUpdatedAt: new Date() },
    update: { state: value, stateUpdatedAt: new Date() },
  });
}

async function setNotify(chatId: string, notify: boolean): Promise<void> {
  await prisma.botChat.upsert({
    where: { chatId },
    create: { chatId, notify },
    update: { notify },
  });
}

/* ----------------------------------------------------------- helpers -- */

const REF = /^ALY-\d{4}-\d{3}$/i;

const html = { parse_mode: 'HTML' as const };

const when = (date: Date) =>
  date.toLocaleString('ru-RU', {
    timeZone: 'Asia/Dushanbe',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/*
 * The visitor's menu: four buttons, nothing else.
 *
 * The owner's decision — the bot routes people rather than pretending to be the
 * funnel. Not one of these costs the webhook a round trip, so all four keep
 * working even while the bot itself is down.
 *
 * The first two are plain links out, to the portfolio and to his own Telegram.
 * The last two are `web_app`: Telegram opens them as a Mini App, in a window
 * over the chat rather than in a browser, and hands the page a signed
 * `initData` naming the person who pressed. That signature is why the Mini App
 * is worth more here than the link it replaces — a brief that arrives through
 * it is already attached to a Telegram chat, so status changes reach the client
 * without anyone typing a number, and a review arrives from someone Telegram
 * has vouched for rather than from an anonymous form.
 *
 * `web_app` buttons work only in private chats, which is the only place this
 * bot talks to anyone.
 *
 * The in-bot brief dialogue is still wired up in this file and still answers,
 * but nothing here opens it; treat it as dormant rather than live.
 */
function clientKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .webApp(clientButtons.brief, `${site.url}/mini/start`)
    .row()
    .url(clientButtons.work, `${site.url}/work`)
    .url(clientButtons.dm, `https://t.me/${site.contact.telegram}`)
    .row()
    .text(clientButtons.status, 'c:status')
    .webApp(clientButtons.review, `${site.url}/mini/review`);
}

/* ------------------------------------------------------------ owner -- */

/**
 * What the owner gets for /start.
 *
 * Two messages, and the first one has a job beyond its words. Telegram keeps a
 * persistent reply keyboard on the client, so deleting the nine buttons from
 * this file does not take them off his phone — he would still be looking at
 * them, still pressing them, and getting nothing back. `remove_keyboard` is
 * what actually clears them, and it cannot travel with the panel button,
 * because a removal and an inline keyboard cannot share one `reply_markup`.
 */
async function ownerStart(ctx: Context): Promise<void> {
  let text = ownerGreeting;
  try {
    text = briefingText(await getBriefing());
  } catch {
    // No database: the greeting alone. /start answers whatever happens.
  }
  /*
   * One message and no buttons under it. The blue button at the bottom of the
   * chat opens the panel now, and two inline buttons repeating it were exactly
   * what the owner sent a screenshot of and asked to be rid of.
   * `remove_keyboard` stays: it is what clears the nine old buttons from a
   * phone that still has them.
   */
  await ctx.reply(text, { ...html, reply_markup: { remove_keyboard: true } });
}

/**
 * The briefing, in order of what it costs him to leave it.
 *
 * Only the parts that are not zero. A line reading "Просрочено: 0" is a line he
 * has to read to learn there is nothing to read.
 *
 * The oldest waiting lead is flagged once it is past a day, because "отвечаю в
 * течение дня" is what the site and this bot promise every client. The bot
 * holding him to his own promise is worth more than any number on this screen.
 */
function briefingText(b: Awaited<ReturnType<typeof getBriefing>>): string {
  const urgent: string[] = [];

  if (b.waiting > 0) {
    let line = `<b>Ждут ответа: ${b.waiting}</b>`;
    if (b.oldestWaiting) {
      const hours = Math.floor((Date.now() - b.oldestWaiting.getTime()) / 3_600_000);
      const age = hours < 24 ? `${Math.max(1, hours)} ч` : `${Math.floor(hours / 24)} дн`;
      line += `, самая старая — ${age}${hours >= 24 ? ' — уже больше суток' : ''}`;
    }
    urgent.push(line);
  }
  const overdue = b.overdue.reduce((n, row) => n + row.count, 0);
  if (overdue > 0) {
    urgent.push(`Просрочено оплат: ${overdue} на ${b.overdue.map((r) => money(r.total, r.currency)).join(' · ')}`);
  }
  if (b.reviews > 0) urgent.push(`Отзывов на проверке: ${b.reviews}`);

  const steady = [
    b.active > 0 ? `В работе: ${b.active}` : null,
    b.week > 0 ? `За 7 дней заявок: ${b.week}` : null,
    b.tasksToday > 0 ? `Дел на сегодня: ${b.tasksToday}` : null,
  ].filter(Boolean);

  const head = urgent.length > 0 ? urgent.join('\n') : 'Тихо: новых заявок нет, отзывы разобраны, долгов нет.';
  return [head, steady.length ? steady.join(' · ') : null, '', 'Всё остальное — в синей кнопке «Админка» внизу.', 'Ответить клиенту — реплаем на его сообщение.']
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * The owner's reply to a forwarded question, sent back to whoever asked it.
 *
 * This is the one thing the panel does worse than the chat, so it stayed: an
 * answer arrives where the question did, in the same conversation, with nothing
 * to open. Moving it into the Mini App would also mean storing the exchange,
 * and `visitorText` deliberately does not — a question relayed is not a
 * transcript kept.
 *
 * Which chat it goes to is the part that had to change. It used to be read
 * straight out of the message being replied to, with a plain `#chat<id>`, and
 * that message is full of text other people wrote. Two ways in followed from
 * it. A visitor could put `#chat…` in the name on their own Telegram account,
 * which lands ahead of the real marker in the relay line, and the first match
 * won. And a lead card carries a four-thousand-character description straight
 * off the public form, with no legitimate marker anywhere in it — so anything
 * an attacker wrote there was the only match, and the owner's reply to a new
 * lead went wherever they chose.
 *
 * Now the marker carries a short code over the chat id, keyed on the bot token.
 * Every candidate in the text is checked and the forgeries simply fail, so a
 * planted one no longer shadows the real one — it is skipped.
 */
async function ownerText(ctx: Context, text: string): Promise<boolean> {
  const target = relayTarget(ctx.message?.reply_to_message?.text ?? '');
  if (!target) return false;

  const ok = await sendWithRetry(target, escapeHtml(text));
  await ctx.reply(ok ? glue.forwarded : glue.failed);
  return true;
}

async function visitorStart(ctx: Context): Promise<void> {
  /*
   * Prices from the list he edits in the admin, never from this file. If the
   * database is unreachable the greeting still goes out, just without figures:
   * /start must always answer.
   */
  let prices = { landing: null as string | null, sites: null as string | null };
  try {
    const list = await getPriceList();
    prices = {
      landing: list.find((s) => s.slug === 'landing')?.price ?? null,
      sites: list.find((s) => s.slug === 'sites')?.price ?? null,
    };
  } catch {
    /* greeting without prices */
  }
  await ctx.reply(visitorGreeting(prices), { reply_markup: clientKeyboard() });
}

function stepKeyboard(step: BriefStep, index: number, username?: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  if (step.choices) {
    step.choices.forEach((choice, i) => {
      keyboard.text(choice, `pick:${index}:${i}`);
      if (i % 2 === 1) keyboard.row();
    });
    keyboard.row();
  }
  if (step.key === 'contact' && username) keyboard.text(glue.useUsername(username), `use:${index}`).row();
  if (step.consent) keyboard.text(glue.agree, `consent:${index}`).row();
  if (step.optional) keyboard.text(glue.skip, `skip:${index}`);
  keyboard.text(glue.cancel, 'cancel:brief');
  return keyboard;
}

async function briefPrompt(ctx: Context, state: BriefState): Promise<void> {
  const step = briefSteps[state.step];
  const head = `<b>${escapeHtml(step.label)}</b> · ${glue.stepOf(state.step + 1, briefSteps.length)}`;
  const body = step.hint ? `\n${escapeHtml(step.hint)}` : '';
  await ctx.reply(`${head}${body}`, {
    ...html,
    reply_markup: stepKeyboard(step, state.step, ctx.from?.username),
  });
}

async function briefAdvance(
  ctx: Context,
  chatId: string,
  state: BriefState,
  value: string,
): Promise<void> {
  const step = briefSteps[state.step];

  if (!step.consent) {
    const field = briefSchema.shape[step.key];
    const parsed = field.safeParse(value);
    if (!parsed.success) {
      await ctx.reply(parsed.error.issues[0]?.message ?? glue.failed);
      await briefPrompt(ctx, state);
      return;
    }
  }

  const data = { ...state.data, [step.key]: value };
  const nextIndex = state.step + 1;

  if (nextIndex >= briefSteps.length) {
    await briefSubmit(ctx, chatId, data);
    return;
  }

  const next: BriefState = { mode: 'brief', step: nextIndex, data };
  await writeState(chatId, next);
  await briefPrompt(ctx, next);
}

async function briefSubmit(
  ctx: Context,
  chatId: string,
  data: BriefState['data'],
): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = await prisma.lead.count({ where: { telegramChatId: chatId, createdAt: { gte: since } } });
  if (today >= BRIEFS_PER_DAY) {
    await writeState(chatId, null);
    await ctx.reply(glue.tooMany);
    return;
  }

  const parsed = briefSchema.safeParse({ ...data, consent: true });
  if (!parsed.success) {
    await writeState(chatId, null);
    await ctx.reply(glue.failed);
    return;
  }

  const lead = await createLead(parsed.data, 'telegram', chatId);
  await writeState(chatId, null);
  await setNotify(chatId, true);

  // The same receipt the Mini App's briefs get, from the one place it is worded.
  await ctx.reply(briefReceipt(lead.ref, lead.trackingToken), html);
  await notifyNewLead(lead.id);
}

async function statusCheck(ctx: Context, chatId: string, text: string): Promise<void> {
  const chat = await prisma.botChat.findUnique({ where: { chatId } });
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const fresh = !chat?.tokenAttemptsAt || chat.tokenAttemptsAt.getTime() < hourAgo;
  const attempts = fresh ? 0 : chat?.tokenAttempts ?? 0;

  // Past the limit the bot says nothing at all — not even that there is a limit.
  if (attempts >= STATUS_ATTEMPTS_PER_HOUR) return;

  await prisma.botChat.upsert({
    where: { chatId },
    create: { chatId, tokenAttempts: 1, tokenAttemptsAt: new Date() },
    update: { tokenAttempts: attempts + 1, tokenAttemptsAt: fresh ? new Date() : undefined },
  });

  const match = text.trim().match(/^(ALY-\d{4}-\d{3})\s+([a-f0-9]{32})$/i);
  const lead = match
    ? await prisma.lead.findUnique({
        where: { ref: match[1].toUpperCase() },
        select: { id: true, status: true, trackingToken: true, telegramChatId: true, events: { orderBy: { createdAt: 'desc' }, take: 1 }, createdAt: true },
      })
    : null;

  if (!match || !lead || !tokenMatches(match[2], lead.trackingToken)) {
    await ctx.reply(glue.notFound);
    return;
  }

  // Holding the code proves the chat belongs to the client: attach it once so
  // status changes reach them here from now on.
  if (!lead.telegramChatId) {
    await prisma.lead.update({ where: { id: lead.id }, data: { telegramChatId: chatId } });
  }

  const changed = lead.events[0]?.createdAt ?? lead.createdAt;
  await ctx.reply(
    `${escapeHtml(clientStatusLine[lead.status as LeadStatusName])}\n${glue.updated}: ${when(changed)}`,
  );
}

async function visitorText(ctx: Context, chatId: string, text: string): Promise<void> {
  const state = await readState(chatId);

  if (state?.mode === 'brief') {
    await briefAdvance(ctx, chatId, state, text.trim());
    return;
  }

  if (state?.mode === 'status') {
    await writeState(chatId, null);
    await statusCheck(ctx, chatId, text);
    return;
  }

  /*
   * Work out what was asked. Most messages are one of a dozen questions whose
   * answers the owner has already written down — see intents.ts for how, and
   * for the traps a word search falls into in Russian.
   */
  const intent = classify(text);

  if (intent.kind === 'status-code') {
    await statusCheck(ctx, chatId, text);
    return;
  }
  if (intent.kind === 'status') {
    await writeState(chatId, { mode: 'status' });
    await ctx.reply(`${glue.statusHow}\n${glue.statusAsk}`);
    return;
  }
  if (intent.kind === 'greeting') {
    await visitorStart(ctx);
    return;
  }

  let answer: Awaited<ReturnType<typeof answerFor>> = null;
  try {
    answer = await answerFor(intent);
  } catch {
    // A failed lookup must not swallow the question: it goes to the owner.
    answer = null;
  }

  if (answer) {
    await ctx.reply(answer.text, { ...html, reply_markup: answer.keyboard });
    if (answer.relay) await relayToOwner(ctx, chatId, text, true);
    return;
  }

  // Nothing written down covers it. It is relayed, not stored.
  await relayToOwner(ctx, chatId, text, false);
  await ctx.reply(`${glue.forwarded} Отвечаю ${site.responseTime.toLowerCase()}.`);
}

/**
 * A visitor's message, on to the owner.
 *
 * `answered` says the bot has already replied — with a price, a timeline, a
 * yes — so the header tells him so. He is not being asked to answer from
 * scratch; he is being told someone is close to buying, and a reply to this
 * message goes straight back to them if he wants to add the human part.
 */
async function relayToOwner(ctx: Context, chatId: string, text: string, answered: boolean): Promise<void> {
  const admins = adminIds();
  if (admins.size === 0) return;
  const from = ctx.from;
  const who = `${escapeHtml(from?.first_name ?? '')}${from?.username ? ` (@${escapeHtml(from.username)})` : ''}`;
  const head = answered ? '🔥 Спросили — бот уже ответил' : escapeHtml(glue.from);
  const relay = `<b>${head}</b> ${who} · ${relayTag(chatId)}\n\n${escapeHtml(text)}`;
  await Promise.all([...admins].map((id) => sendWithRetry(id, relay)));
}

async function visitorCallback(ctx: Context, chatId: string, data: string): Promise<boolean> {
  const [kind, a, b] = data.split(':');

  switch (kind) {
    case 'c': {
      if (a === 'idea') {
        const state: BriefState = { mode: 'brief', step: 0, data: {} };
        await writeState(chatId, state);
        await ctx.answerCallbackQuery();
        await briefPrompt(ctx, state);
        return true;
      }
      if (a === 'services') {
        const text = featuredServices
          .map((s) => `<b>${escapeHtml(s.title)}</b>\n${escapeHtml(s.tagline)}`)
          .join('\n\n');
        await ctx.answerCallbackQuery();
        await ctx.reply(text, {
          ...html,
          reply_markup: new InlineKeyboard().url(clientButtons.services, `${site.url}/services`),
        });
        return true;
      }
      if (a === 'work') {
        const cases = await getPublishedCases();
        const keyboard = new InlineKeyboard();
        for (const row of cases.slice(0, 4)) keyboard.url(row.title, `${site.url}/work/${row.slug}`).row();
        keyboard.url(clientButtons.work, `${site.url}/work`);
        const text = cases.length
          ? cases.slice(0, 4).map((row) => `<b>${escapeHtml(row.title)}</b>${row.client ? ` · ${escapeHtml(row.client)}` : ''}`).join('\n')
          : 'Кейсы скоро появятся здесь.';
        await ctx.answerCallbackQuery();
        await ctx.reply(text, { ...html, reply_markup: keyboard });
        return true;
      }
      if (a === 'about') {
        await ctx.answerCallbackQuery();
        await ctx.reply(`${escapeHtml(site.difference)}\n\n${escapeHtml(site.why[1])}`, {
          ...html,
          reply_markup: new InlineKeyboard().url(clientButtons.about, `${site.url}/about`),
        });
        return true;
      }
      if (a === 'status') {
        await writeState(chatId, { mode: 'status' });
        await ctx.answerCallbackQuery();
        await ctx.reply(`${glue.statusHow}\n${glue.statusAsk}`);
        return true;
      }
      return false;
    }
    case 'cancel': {
      await writeState(chatId, null);
      await ctx.answerCallbackQuery();
      await ctx.reply(glue.cancelled, { reply_markup: clientKeyboard() });
      return true;
    }
    case 'pick':
    case 'skip':
    case 'use':
    case 'consent': {
      const state = await readState(chatId);
      const index = Number.parseInt(a ?? '', 10);
      if (state?.mode !== 'brief' || state.step !== index) {
        await ctx.answerCallbackQuery();
        return true;
      }
      const step = briefSteps[index];
      let value = '';
      if (kind === 'pick') value = step.choices?.[Number.parseInt(b ?? '', 10)] ?? '';
      if (kind === 'use') value = ctx.from?.username ? `@${ctx.from.username}` : '';
      if (kind === 'consent') value = 'true';
      if (kind === 'skip' && !step.optional) value = '';
      if ((kind === 'pick' || kind === 'use') && !value) {
        await ctx.answerCallbackQuery();
        return true;
      }
      await ctx.answerCallbackQuery();
      await briefAdvance(ctx, chatId, state, value);
      return true;
    }
    default:
      return false;
  }
}

/* --------------------------------------------------------------- bot -- */

let instance: Bot | undefined;

export function getBot(): Bot {
  if (instance) return instance;
  const token = botToken();
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  const bot = new Bot(token);
  register(bot);
  instance = bot;
  return bot;
}

function register(bot: Bot): void {
  /*
   * Telegram redelivers an update it did not get a 200 for. Recording the id
   * first turns a redelivery into a no-op. Old rows are pruned now and then.
   */
  bot.use(async (ctx, next) => {
    try {
      await prisma.botUpdate.create({ data: { updateId: ctx.update.update_id } });
    } catch (error) {
      if ((error as { code?: string })?.code === 'P2002') return;
      throw error;
    }
    if (Math.random() < 0.05) {
      void prisma.botUpdate
        .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
        .catch(() => undefined);
    }
    await next();
  });

  bot.catch((err) => {
    console.error(`[bot] handler failed: ${err.error?.constructor?.name ?? 'Error'}`);
  });

  bot.command('id', async (ctx) => {
    await ctx.reply(`${glue.yourId} <code>${ctx.from?.id ?? '—'}</code>`, html);
  });

  bot.command('start', async (ctx) => {
    if (!ctx.chat) return;
    const chatId = String(ctx.chat.id);
    const owner = isAdmin(ctx.from?.id);
    await setNotify(chatId, true);
    await writeState(chatId, null);
    /*
     * The blue button, installed for this chat on the way in. Not awaited
     * ahead of the reply: the person pressed /start to be answered, and a slow
     * Telegram call should not stand between them and the first message.
     */
    void setMenuButton(ctx.chat.id, owner);
    if (owner) {
      await ownerStart(ctx);
      return;
    }
    // The confirmation page links here with ?start=status.
    if (String(ctx.match ?? '').trim() === 'status') {
      await writeState(chatId, { mode: 'status' });
      await ctx.reply(`${glue.statusHow}\n${glue.statusAsk}`);
      return;
    }
    await visitorStart(ctx);
  });

  bot.command('stop', async (ctx) => {
    if (!ctx.chat) return;
    await setNotify(String(ctx.chat.id), false);
    await ctx.reply(glue.stopped);
  });

  bot.command('cancel', async (ctx) => {
    if (!ctx.chat) return;
    await writeState(String(ctx.chat.id), null);
    await ctx.reply(glue.cancelled);
  });

  bot.command('status', async (ctx) => {
    if (!ctx.chat) return;
    const chatId = String(ctx.chat.id);
    const rest = String(ctx.match ?? '').trim();
    if (rest) await statusCheck(ctx, chatId, rest);
    else {
      await writeState(chatId, { mode: 'status' });
      await ctx.reply(`${glue.statusHow}\n${glue.statusAsk}`);
    }
  });

  const ownerOnly =
    (run: (ctx: Context) => Promise<void>) =>
    async (ctx: Context): Promise<void> => {
      if (!isAdmin(ctx.from?.id)) {
        await ctx.reply(glue.noAccess);
        return;
      }
      await run(ctx);
    };

  /*
   * The owner's own commands used to be seven, each a thinner version of a
   * screen in the admin: a list of ten leads, a card by reference, a month of
   * figures printed as a paragraph. They are gone, and `ownerOnly` stays —
   * `/panel` is the single one left, and the wrapper is what keeps a visitor
   * who guesses the word from getting an answer.
   */
  bot.command('panel', ownerOnly(ownerStart));

  bot.on('callback_query:data', async (ctx) => {
    if (!ctx.chat) return;

    if (await visitorCallback(ctx, String(ctx.chat.id), ctx.callbackQuery.data)) return;

    // A visitor pressing an owner's button, or a button left over from before
    // the panel existed: nothing happens, and nothing is said about why.
    await ctx.answerCallbackQuery();
  });

  bot.on('message:text', async (ctx) => {
    if (!ctx.chat) return;
    const chatId = String(ctx.chat.id);
    const text = ctx.message.text;

    if (isAdmin(ctx.from?.id)) {
      // A reply to a forwarded question goes back to whoever asked it.
      if (await ownerText(ctx, text)) return;
      // Anything else he types: where things stand. The panel is the blue
      // button under the chat, so there is nothing to repeat here.
      await ownerStart(ctx);
      return;
    }

    await visitorText(ctx, chatId, text);
  });
}
