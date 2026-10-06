import 'server-only';
import { Bot, InlineKeyboard, type Context } from 'grammy';
import { prisma } from '@/lib/prisma';
import { briefSchema } from '@/lib/content/brief';
import { site } from '@/lib/content/site';
import { featuredServices } from '@/lib/content/services';
import { getPublishedCases } from '@/lib/cases';
import { type LeadStatusName } from '@/lib/content/finance';
import {
  adminIds,
  botToken,
  escapeHtml,
  isAdmin,
  relayTag,
  relayTarget,
  sendWithRetry,
} from '@/lib/telegram/api';
import { createLead, tokenMatches } from '@/lib/telegram/leads';
import { briefReceipt, notifyNewLead } from '@/lib/telegram/notify';
import {
  type BriefStep,
  briefSteps,
  clientButtons,
  clientStatusLine,
  glue,
  ownerButtons,
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
 * The owner's one button: the panel.
 *
 * There used to be nine, pinned under the chat. They could print a list and ask
 * for a reference number, and that was the ceiling — a keyboard is a remote
 * control with nine fixed buttons, which is right for a machine with nine
 * functions and wrong for a business. Everything they did now lives in the Mini
 * App at /mini/admin, where a lead can be read, moved and annotated on one
 * screen, and a review can be put on the site with a tap.
 *
 * `web_app` rather than `url` matters here. A url button opens Telegram's own
 * browser, which carries no admin session, so it would land on the login form
 * every single time. A web_app button opens a window over the chat and hands
 * the page the signature proving who pressed it.
 */
function ownerPanelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().webApp(ownerButtons.panel, `${site.url}/mini/admin`);
}

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
    .url(clientButtons.site, site.url)
    .row()
    .url(clientButtons.dm, `https://t.me/${site.contact.telegram}`)
    .row()
    .webApp(clientButtons.brief, `${site.url}/mini/start`)
    .row()
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
  await ctx.reply(ownerGreeting, { ...html, reply_markup: { remove_keyboard: true } });
  await ctx.reply(glue.openPanel, { reply_markup: ownerPanelKeyboard() });
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
  await ctx.reply(visitorGreeting, { reply_markup: clientKeyboard() });
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

  // Anything else is a question for the owner. It is relayed, not stored.
  const admins = adminIds();
  if (admins.size === 0) return;
  const from = ctx.from;
  const who = `${escapeHtml(from?.first_name ?? '')}${from?.username ? ` (@${escapeHtml(from.username)})` : ''}`;
  const relay = `<b>${escapeHtml(glue.from)}</b> ${who} · ${relayTag(chatId)}\n\n${escapeHtml(text)}`;
  await Promise.all([...admins].map((id) => sendWithRetry(id, relay)));
  await ctx.reply(`${glue.forwarded} Отвечаю ${site.responseTime.toLowerCase()}.`);
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
    await setNotify(chatId, true);
    await writeState(chatId, null);
    if (isAdmin(ctx.from?.id)) {
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
      // Anything else he types: the panel, rather than a menu of commands.
      await ctx.reply(glue.openPanel, { reply_markup: ownerPanelKeyboard() });
      return;
    }

    await visitorText(ctx, chatId, text);
  });
}
