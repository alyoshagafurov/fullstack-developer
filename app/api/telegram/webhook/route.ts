import { timingSafeEqual } from 'node:crypto';
import { webhookCallback } from 'grammy';
import { getBot } from '@/lib/telegram/bot';

/*
 * Telegram's door into the application.
 *
 * Telegram calls this for every message and button press. The secret is checked
 * against the header before the body is read — an unsigned request is answered
 * 401 and never parsed. Everything after that is the bot itself, in
 * lib/telegram; this file only decides whether to let the update in.
 *
 * Telegram redelivers anything it did not get a 200 for, so the handler always
 * answers 200 once the request is genuine, even when the bot failed inside:
 * the failure is logged by class, and a redelivery would only fail the same
 * way. The bot's own middleware makes a redelivery of a handled update a no-op.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sameSecret(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || !process.env.TELEGRAM_BOT_TOKEN) {
    return new Response('Bot is not configured', { status: 503 });
  }

  if (!sameSecret(request.headers.get('x-telegram-bot-api-secret-token'), secret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const handle = webhookCallback(getBot(), 'std/http', {
      secretToken: secret,
      // Telegram gives a webhook about ten seconds; answer before it gives up.
      timeoutMilliseconds: 9000,
      onTimeout: 'return',
    });
    return await handle(request);
  } catch (error) {
    // grammY wraps a handler's throw in BotError; the cause is what matters.
    const cause = (error as { error?: unknown })?.error ?? error;
    const name = (cause as Error)?.constructor?.name ?? 'Error';
    const detail = String((cause as Error)?.message ?? '').split('\n')[0].slice(0, 160);
    console.error(`[bot] update failed: ${name}${detail ? ` — ${detail}` : ''}`);
    return new Response('ok', { status: 200 });
  }
}
