import 'server-only';
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

/** The owner's numeric ids. Empty means the owner's side of the bot is closed. */
export function adminIds(): Set<number> {
  return new Set(
    (process.env.TELEGRAM_ADMIN_IDS ?? '')
      .split(',')
      .map((part) => Number.parseInt(part.trim(), 10))
      .filter((id) => Number.isFinite(id) && id > 0),
  );
}

export function isAdmin(userId: number | undefined): boolean {
  return userId !== undefined && adminIds().has(userId);
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
