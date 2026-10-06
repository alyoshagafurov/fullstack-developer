import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { site } from '@/lib/content/site';
import { clientCommands, ownerCommands } from '@/lib/telegram/texts';
import { Api } from 'grammy';

/*
 * The raw Bot API client, shared by the bot's handlers and by the parts of the
 * application that only ever send — the lead endpoint and the admin's status
 * action. Built once per instance from the environment; the token is read here
 * and nowhere else.
 */

let client: Api | undefined;

export function botToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN || undefined;
}

export function getApi(): Api {
  if (!client) {
    const token = botToken();
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
    client = new Api(token);
  }
  return client;
}

/*
 * Teach Telegram the commands the bot answers.
 *
 * Two lists: everyone in a private chat gets the visitor's three, and each
 * owner id gets the full one registered against that chat alone. The menu
 * button is pointed at the list as well, so the "/" is there to press rather
 * than something you have to know about.
 *
 * Called when the webhook is connected, so one button in the admin sets up
 * both halves and there is nothing else to remember.
 */
export async function syncCommands(): Promise<number> {
  const api = getApi();
  await api.setMyCommands([...clientCommands], { scope: { type: 'all_private_chats' } });

  let scopes = 1;
  for (const id of adminIds()) {
    await api.setMyCommands([...ownerCommands], { scope: { type: 'chat', chat_id: id } });
    /*
     * The owner's blue button opens the hub, with the panel on it.
     *
     * A chat has one menu button and no more — `menu_button` is one value, not
     * a list — so the panel and the client app cannot each have their own. The
     * hub is how both fit behind the one button there is, and `?admin=1` is
     * what tells it to draw the panel tile. The flag decides nothing about
     * access: the panel is guarded by the launch signature, on the server, per
     * request.
     */
    await api.setChatMenuButton({
      chat_id: id,
      menu_button: {
        type: 'web_app',
        text: 'Открыть',
        web_app: { url: `${site.url}/mini?admin=1` },
      },
    });
    scopes += 1;
  }

  /*
   * Everyone else gets the same button onto the same hub, without the panel.
   *
   * It used to be the "/" list, which answers "what can this bot do?" with a
   * menu of commands — a question a visitor should not have to ask, and an
   * answer in the wrong vocabulary. Now Open leads to the two things they came
   * for: a brief, or a review.
   */
  await api.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Открыть', web_app: { url: `${site.url}/mini` } },
  });
  return scopes;
}

/**
 * The owner's numeric ids. Empty means the owner's side of the bot is closed.
 *
 * Parsed strictly, which it was not before. `parseInt` reads as far as it can
 * and keeps whatever it got, so `1e9` became the id 1 and `007` became 7: a
 * typo in an environment variable turned quietly into a different, real
 * Telegram account, and the settings screen — counting the set — agreed that
 * one admin was configured. This list is now the only thing standing between
 * "someone in Telegram" and the owner's clients, so anything that is not a
 * plain decimal id is dropped and said out loud rather than trimmed into a
 * stranger.
 *
 * Sixteen digits is above every id Telegram issues and below 2^53, where two
 * different ids would begin comparing equal.
 */
const ID = /^[1-9][0-9]{0,15}$/;

export function adminIds(): Set<number> {
  const ids = new Set<number>();

  for (const raw of (process.env.TELEGRAM_ADMIN_IDS ?? '').split(',')) {
    const part = raw.trim();
    if (!part) continue;
    if (!ID.test(part)) {
      // Loud at boot, so a typo is found in a deploy log rather than by
      // wondering why the panel refuses the person who owns it.
      console.warn('[bot] TELEGRAM_ADMIN_IDS: значение отброшено, это не Telegram id');
      continue;
    }
    ids.add(Number(part));
  }

  return ids;
}

export function isAdmin(userId: number | undefined): boolean {
  return userId !== undefined && adminIds().has(userId);
}

/*
 * Routing a reply back to the person who asked.
 *
 * When a visitor writes to the bot, the question is relayed to the owner with a
 * marker naming the chat it came from, and his reply is sent back to whatever
 * that marker says. The marker used to be a plain `#chat<id>`, read out of the
 * message being replied to with a single regex — and that message is mostly
 * text other people wrote.
 *
 * Two ways in followed. A visitor could set the name on their Telegram account
 * to `#chat-100…`, which lands in the relay line ahead of the real marker, and
 * the first match won. And a lead notification carries a four-thousand
 * character description straight off the public form while containing no
 * legitimate marker at all — so whatever an attacker typed there was the only
 * match, and the owner replying to a new lead sent his answer to a stranger.
 *
 * So the marker now carries a short code over the chat id, keyed on the bot
 * token. Forging one means knowing the token. Every candidate in the text is
 * checked rather than just the first, so a planted marker no longer shadows the
 * real one: it fails and the search moves on.
 */
const RELAY = /#c(-?\d+)\.([0-9a-f]{10})/g;

function relayMac(chatId: string): string {
  const token = botToken();
  if (!token) return '';
  return createHmac('sha256', 'BotRelay').update(`${token}\n${chatId}`).digest('hex').slice(0, 10);
}

/** The marker the bot writes into a relayed question. Empty when unconfigured. */
export function relayTag(chatId: string): string {
  const mac = relayMac(chatId);
  return mac ? `#c${chatId}.${mac}` : '';
}

/** The chat a reply belongs to, or null when nothing in the text proves one. */
export function relayTarget(text: string): string | null {
  for (const [, chatId, mac] of text.matchAll(RELAY)) {
    const expected = relayMac(chatId);
    if (!expected || mac.length !== expected.length) continue;
    if (timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return chatId;
  }
  return null;
}

export function escapeHtml(value: string | null | undefined): string {
  return (value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Sends once and retries twice more with a growing pause. A failure never
 * throws past here and never logs the text: the chat id and the error class
 * are all a log line gets.
 */
export async function sendWithRetry(
  chatId: number | string,
  text: string,
  extra?: Parameters<Api['sendMessage']>[2],
): Promise<boolean> {
  const api = getApi();
  const pauses = [0, 600, 1800];
  for (let attempt = 0; attempt < pauses.length; attempt += 1) {
    if (pauses[attempt]) await new Promise((r) => setTimeout(r, pauses[attempt]));
    try {
      await api.sendMessage(chatId, text, { parse_mode: 'HTML', ...extra });
      return true;
    } catch (error) {
      const name = (error as Error)?.constructor?.name ?? 'Error';
      // A blocked bot or a dead chat will not recover on retry.
      const message = String((error as Error)?.message ?? '');
      if (/blocked|deactivated|chat not found/i.test(message)) {
        console.warn(`[bot] send skipped (${name}) chat=${chatId}`);
        return false;
      }
      if (attempt === pauses.length - 1) {
        console.error(`[bot] send failed (${name}) chat=${chatId}`);
        return false;
      }
    }
  }
  return false;
}

export type BotStatus = {
  token: boolean;
  secret: boolean;
  admins: number;
  username: string | null;
  webhookUrl: string | null;
  pending: number;
  lastError: string | null;
};

/** What the settings screen shows. Reads presence, never values. */
export async function botStatus(): Promise<BotStatus> {
  const status: BotStatus = {
    token: Boolean(botToken()),
    secret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
    admins: adminIds().size,
    username: null,
    webhookUrl: null,
    pending: 0,
    lastError: null,
  };
  if (!status.token) return status;
  try {
    const [me, hook] = await Promise.all([getApi().getMe(), getApi().getWebhookInfo()]);
    status.username = me.username ?? null;
    status.webhookUrl = hook.url || null;
    status.pending = hook.pending_update_count;
    status.lastError = hook.last_error_message ?? null;
  } catch (error) {
    status.lastError = (error as Error)?.constructor?.name ?? 'Error';
  }
  return status;
}
