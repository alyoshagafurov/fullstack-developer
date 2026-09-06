import 'server-only';
import { Bot, InlineKeyboard, Keyboard, type Context } from 'grammy';
import { prisma } from '@/lib/prisma';
import { briefSchema } from '@/lib/content/brief';
import { site } from '@/lib/content/site';
import { featuredServices } from '@/lib/content/services';
import { getPublishedCases } from '@/lib/cases';
import { getOverview } from '@/lib/admin/queries';
import {
  activePipeline,
  money,
  statusLabel,
  type LeadStatusName,
} from '@/lib/content/finance';
import { adminIds, botToken, escapeHtml, getApi, isAdmin, sendWithRetry } from '@/lib/telegram/api';
import { createLead, markReplied, tokenMatches, transitionLead } from '@/lib/telegram/leads';
import {
  adminLeadUrl,
  contactUrl,
  leadCard,
  notifyClientStatus,
  notifyNewLead,
} from '@/lib/telegram/notify';
import {
  type BriefStep,
  briefSteps,
  clientButtons,
  clientStatusLine,
  confirmation,
  glue,
  greeting,
  notificationButtons,
  ownerMenu,
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

function ownerKeyboard(): Keyboard {
  return new Keyboard()
    .text(ownerMenu.fresh)
    .text(ownerMenu.leads)
    .row()
    .text(ownerMenu.card)
    .text(ownerMenu.status)
    .text(ownerMenu.note)
    .row()
    .text(ownerMenu.stats)
    .text(ownerMenu.money)
    .text(ownerMenu.income)
    .row()
    .text(ownerMenu.settings)
    .resized()
    .persistent();
}

function clientKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(clientButtons.idea, 'c:idea')
    .row()
    .text(clientButtons.services, 'c:services')
    .row()
    .text(clientButtons.work, 'c:work')
    .row()
    .text(clientButtons.about, 'c:about')
    .row()
    .url(clientButtons.site, site.url)
    .row()
    .text('Статус проекта', 'c:status');
}

type LeadRow = NonNullable<Awaited<ReturnType<typeof loadLead>>>;

async function loadLead(where: { id: string } | { ref: string }) {
  return prisma.lead.findUnique({ where });
}

/** The card the owner works from: every field, then the moves he can make. */
function cardKeyboard(lead: LeadRow): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const status = lead.status as LeadStatusName;
  const closed: LeadStatusName[] = ['COMPLETED', 'DECLINED', 'CANCELLED'];
  const targets: LeadStatusName[] = [];

  const next = activePipeline[activePipeline.indexOf(status) + 1];
  if (next) targets.push(next);
  if (status !== 'ON_HOLD' && !closed.includes(status)) targets.push('ON_HOLD');
  if (!closed.includes(status)) targets.push('DECLINED');
  if (status === 'ON_HOLD') targets.unshift('IN_PROGRESS');

  for (const target of targets.slice(0, 3)) {
    keyboard.text(statusLabel[target], `st:${lead.id}:${target}`);
  }
  keyboard.row().text(glue.note, `note:${lead.id}`);
  if (!lead.firstRepliedAt) keyboard.text(glue.replied_btn, `rep:${lead.id}`);
  keyboard.row().url(glue.openAdmin, adminLeadUrl(lead.id));
  const url = contactUrl(lead.contact);
  if (url) keyboard.url(notificationButtons.contact, url);
  return keyboard;
}

function cardText(lead: LeadRow): string {
  return leadCard(lead, `${glue.status}: ${statusLabel[lead.status as LeadStatusName]}`);
}

async function sendCard(ctx: Context, lead: LeadRow): Promise<void> {
  await ctx.reply(cardText(lead), { ...html, reply_markup: cardKeyboard(lead) });
}

type LeadWhere = NonNullable<Parameters<typeof prisma.lead.findMany>[0]>['where'];

async function listLeads(ctx: Context, where: LeadWhere): Promise<void> {
  const rows = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, ref: true, name: true, projectType: true, status: true },
  });
  if (rows.length === 0) {
    await ctx.reply(glue.nothing);
    return;
  }
  const text = rows
    .map(
      (row) =>
        `<code>${escapeHtml(row.ref)}</code> · ${escapeHtml(row.name)} · ${escapeHtml(row.projectType)} · ${statusLabel[row.status as LeadStatusName]}`,
    )
    .join('\n');
  const keyboard = new InlineKeyboard();
  for (const row of rows.slice(0, 4)) keyboard.text(row.ref, `lead:${row.id}`).row();
  await ctx.reply(`${text}\n\n${glue.more}`, { ...html, reply_markup: keyboard });
}

function sums(rows: { currency: string; total: number }[]): string {
  if (rows.length === 0) return '0';
  return rows.map((row) => money(row.total, row.currency)).join(' · ');
}

/* ------------------------------------------------------------ owner -- */

async function ownerStart(ctx: Context): Promise<void> {
  await ctx.reply(greeting, { reply_markup: ownerKeyboard() });
}

async function ownerText(ctx: Context, chatId: string, text: string): Promise<boolean> {
  // A reply to a forwarded question goes back to the visitor who asked it.
  const replied = ctx.message?.reply_to_message?.text ?? '';
  const target = replied.match(/#chat(-?\d+)/);
  if (target) {
    const ok = await sendWithRetry(target[1], escapeHtml(text));
    await ctx.reply(ok ? glue.forwarded : glue.failed);
    return true;
  }

  const state = await readState(chatId);

  if (state?.mode === 'note') {
    const body = text.trim();
    if (body && body.length <= 5000) {
      await prisma.note.create({ data: { leadId: state.leadId, body } });
      await writeState(chatId, null);
      await ctx.reply(glue.noteSaved);
    } else {
      await ctx.reply(glue.failed);
    }
    return true;
  }

  if (state?.mode === 'note-ref' || state?.mode === 'lead' || state?.mode === 'status-ref') {
    if (!REF.test(text.trim())) {
      await ctx.reply(glue.askRef);
      return true;
    }
    const lead = await loadLead({ ref: text.trim().toUpperCase() });
    if (!lead) {
      await ctx.reply(glue.notFound);
      return true;
    }
    if (state.mode === 'note-ref') {
      await writeState(chatId, { mode: 'note', leadId: lead.id });
      await ctx.reply(glue.askNote);
    } else {
      await writeState(chatId, null);
      await sendCard(ctx, lead);
    }
    return true;
  }

  switch (text) {
    case ownerMenu.fresh:
      await listLeads(ctx, { status: 'NEW' });
      return true;
    case ownerMenu.leads:
      await listLeads(ctx, {});
      return true;
    case ownerMenu.card:
    case ownerMenu.status:
      await writeState(chatId, { mode: 'lead' });
      await ctx.reply(glue.askRef);
      return true;
    case ownerMenu.note:
      await writeState(chatId, { mode: 'note-ref' });
      await ctx.reply(glue.askRef);
      return true;
    case ownerMenu.stats: {
      const o = await getOverview('month');
      const funnel = o.funnel
        .map((row) => `${statusLabel[row.status]}: ${row.count}`)
        .join('\n');
      await ctx.reply(
        `<b>${escapeHtml(ownerMenu.stats)}</b>\n${escapeHtml(ownerMenu.fresh)}: ${o.fresh}\nЖдут ответа: ${o.waiting}\nВ работе: ${o.active}\nЗавершены: ${o.completed}\nКонверсия: ${o.conversion}%\n\n${funnel}`,
        html,
      );
      return true;
    }
    case ownerMenu.money: {
      const o = await getOverview('month');
      await ctx.reply(
        `<b>${escapeHtml(ownerMenu.money)}</b>\nДоходы: ${sums(o.received)}\nРасходы: ${sums(o.spent)}\nОжидаемые платежи: ${sums(o.expected)}\nПросрочено: ${sums(o.overdue)}`,
        html,
      );
      return true;
    }
    case ownerMenu.income: {
      const o = await getOverview('month');
      await ctx.reply(`<b>${escapeHtml(ownerMenu.income)}</b>\n${sums(o.received)}`, html);
      return true;
    }
    case ownerMenu.settings: {
      const info = await getApi().getWebhookInfo();
      await ctx.reply(
        `<b>${escapeHtml(ownerMenu.settings)}</b>\nСайт: ${escapeHtml(site.url)}\nАдминов: ${adminIds().size}\nВебхук: ${escapeHtml(info.url || '—')}\nОжидают: ${info.pending_update_count}`,
        html,
      );
      return true;
    }
    default:
      break;
  }

  if (REF.test(text.trim())) {
    const lead = await loadLead({ ref: text.trim().toUpperCase() });
    if (lead) await sendCard(ctx, lead);
    else await ctx.reply(glue.notFound);
    return true;
  }

  return false;
}

async function ownerCallback(ctx: Context, chatId: string, data: string): Promise<boolean> {
  const [kind, leadId, arg] = data.split(':');
  if (!leadId || !['lead', 'st', 'note', 'rep'].includes(kind)) return false;

  // The id came from a button; it is looked up, never trusted.
  const lead = await loadLead({ id: leadId });
  if (!lead) {
    await ctx.answerCallbackQuery({ text: glue.notFound });
    return true;
  }

  switch (kind) {
    case 'lead':
      await sendCard(ctx, lead);
      await ctx.answerCallbackQuery();
      return true;
    case 'st': {
      const result = await transitionLead(lead.id, arg ?? '');
      if (result.status === 'ok') {
        const fresh = await loadLead({ id: lead.id });
        if (fresh) {
          try {
            await ctx.editMessageText(cardText(fresh), { ...html, reply_markup: cardKeyboard(fresh) });
          } catch {
            await sendCard(ctx, fresh);
          }
        }
        await ctx.answerCallbackQuery({ text: statusLabel[result.to] });
        void notifyClientStatus(lead.id, result.to);
      } else {
        await ctx.answerCallbackQuery({ text: result.status === 'same' ? statusLabel[lead.status as LeadStatusName] : glue.failed });
      }
      return true;
    }
    case 'note':
      await writeState(chatId, { mode: 'note', leadId: lead.id });
      await ctx.answerCallbackQuery();
      await ctx.reply(glue.askNote);
      return true;
    case 'rep':
      await markReplied(lead.id);
      await ctx.answerCallbackQuery({ text: glue.replied });
      return true;
    default:
      return false;
  }
}

/* ----------------------------------------------------------- visitor -- */

async function visitorStart(ctx: Context): Promise<void> {
  await ctx.reply(greeting, { reply_markup: clientKeyboard() });
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

  await ctx.reply(
    `${escapeHtml(confirmation)}\n\n${glue.ref}: <code>${escapeHtml(lead.ref)}</code>\n${glue.code}: <code>${lead.trackingToken}</code>\n\n${escapeHtml(glue.statusHow)}`,
    html,
  );
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
  const relay = `<b>${escapeHtml(glue.from)}</b> ${who} · #chat${chatId}\n\n${escapeHtml(text)}`;
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

  bot.command('new', ownerOnly((ctx) => listLeads(ctx, { status: 'NEW' })));
  bot.command('leads', ownerOnly((ctx) => listLeads(ctx, {})));
  bot.command('waiting', ownerOnly((ctx) => listLeads(ctx, { status: 'NEW', firstRepliedAt: null })));
  bot.command('work', ownerOnly((ctx) => listLeads(ctx, { status: 'IN_PROGRESS' })));
  bot.command('money', ownerOnly((ctx) => ownerText(ctx, String(ctx.chat!.id), ownerMenu.money).then(() => undefined)));
  bot.command('stats', ownerOnly((ctx) => ownerText(ctx, String(ctx.chat!.id), ownerMenu.stats).then(() => undefined)));
  bot.command(
    'lead',
    ownerOnly(async (ctx) => {
      const ref = String(ctx.match ?? '').trim().toUpperCase();
      if (!REF.test(ref)) {
        await ctx.reply(glue.askRef);
        return;
      }
      const lead = await loadLead({ ref });
      if (lead) await sendCard(ctx, lead);
      else await ctx.reply(glue.notFound);
    }),
  );

  bot.on('callback_query:data', async (ctx) => {
    if (!ctx.chat) return;
    const chatId = String(ctx.chat.id);
    const data = ctx.callbackQuery.data;

    if (await visitorCallback(ctx, chatId, data)) return;

    if (isAdmin(ctx.from?.id)) {
      if (await ownerCallback(ctx, chatId, data)) return;
    }
    // A visitor pressing an owner's button, or a stale button: nothing happens.
    await ctx.answerCallbackQuery();
  });

  bot.on('message:text', async (ctx) => {
    if (!ctx.chat) return;
    const chatId = String(ctx.chat.id);
    const text = ctx.message.text;

    if (isAdmin(ctx.from?.id)) {
      if (await ownerText(ctx, chatId, text)) return;
      await ctx.reply(greeting, { reply_markup: ownerKeyboard() });
      return;
    }

    await visitorText(ctx, chatId, text);
  });
}
