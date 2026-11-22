import { adminGrant } from '@/lib/auth';
import { commands, str } from '@/lib/admin/commands';
import { changePassword, reconnectWebhook, sendTestMessage } from '@/lib/admin/bot';
import { body, json, owner, route } from '@/lib/mobile/server';

/*
 * The owner's admin, as ALY OS reaches it.
 *
 * The same command table as the Telegram panel (lib/admin/commands.ts) behind
 * a different door: a Bearer session checked by `owner()` on every request,
 * before anything is read. POST for every command, reads included, so nothing
 * about a client ever sits in a URL or an access log.
 *
 * Three commands exist only here because they need to know which account is
 * asking or change how the bot reaches this site: the password change, the
 * webhook reconnection and the test message. The app asks before sending them.
 *
 * Money leaves as strings with two decimals ("1500.00") next to its currency,
 * so no amount is ever rounded through a float on the way to the phone.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A number is money only beside a currency: { amount, currency }, { total, currency }, dealAmount. */
function moneyJson(this: Record<string, unknown>, key: string, value: unknown) {
  if (typeof value !== 'number') return value;
  if (key === 'dealAmount' || ((key === 'amount' || key === 'total') && typeof this.currency === 'string')) return value.toFixed(2);
  return value;
}

export async function POST(req: Request) {
  return route(async () => {
    const who = await owner(req);
    const input = (await body(req, 200_000)) as Record<string, unknown> | null;
    const name = str(input?.command, 40);
    const payload = (input?.payload && typeof input.payload === 'object' ? input.payload : {}) as Record<string, unknown>;
    const grant = adminGrant();

    let data: unknown;
    if (name === 'account:password') {
      data = await changePassword(grant, who.id, who.tokenHash, payload.current, payload.next);
    } else if (name === 'bot:webhook') {
      if (payload.confirm !== true) return json({ error: 'Подтвердите переподключение' }, 400);
      data = await reconnectWebhook(grant);
    } else if (name === 'bot:test') {
      data = await sendTestMessage(grant);
    } else if (Object.hasOwn(commands, name)) {
      data = await commands[name](grant, payload);
    } else {
      return json({ error: 'Неизвестная команда' }, 400);
    }

    // A refused change is a 422 with its reason, so the app can show it in place.
    const refused = (data as { status?: string; message?: string } | null)?.status === 'error';
    const text = JSON.stringify(refused ? { error: (data as { message: string }).message } : { data }, moneyJson);
    return new Response(text, {
      status: refused ? 422 : 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  });
}
