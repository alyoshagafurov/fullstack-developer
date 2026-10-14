import { timingSafeEqual } from 'node:crypto';
import { claimFirstContact } from '@/lib/instagram/contacts';
import { igVerifyToken, sendInstagramMessage, verifyInstagramSignature } from '@/lib/instagram/api';
import { instagramGreeting } from '@/lib/instagram/texts';
import { getBotUsername } from '@/lib/telegram/api';

/*
 * Instagram's door into the application — the same shape as
 * app/api/telegram/webhook/route.ts, for the same reasons.
 *
 * GET is Meta's one-time dashboard handshake: it sends a verify token when
 * the Webhooks product is configured, and the endpoint must echo back
 * `hub.challenge` only if that token matches the one set here.
 *
 * POST is every DM event after that, each signed over its raw body with the
 * app secret — checked before the body is parsed, same ordering as the
 * Telegram webhook's secret header. Meta redelivers anything it did not get
 * a 200 for, so a genuine, signed request always gets one, even when sending
 * the reply failed inside; the failure is logged by class only, and this
 * endpoint only ever greets a sender once (see claimFirstContact), so a
 * redelivery is naturally a no-op rather than a second greeting.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sameToken(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const expected = igVerifyToken();
  if (!expected) return new Response('Not configured', { status: 503 });

  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode !== 'subscribe' || !challenge || !sameToken(token, expected)) {
    return new Response('Forbidden', { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

type MessagingEvent = {
  sender?: { id?: string };
  message?: { is_echo?: boolean };
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyInstagramSignature(raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = JSON.parse(raw) as { object?: string; entry?: { messaging?: MessagingEvent[] }[] };
    if (body.object === 'instagram') {
      for (const entry of body.entry ?? []) {
        for (const item of entry.messaging ?? []) {
          const igsid = item.sender?.id;
          // Only a genuine inbound message starts a greeting: no sender id,
          // no message (a read/delivery receipt), or an echo of the bot's
          // own send are all skipped.
          if (!igsid || !item.message || item.message.is_echo) continue;

          const first = await claimFirstContact(igsid);
          if (!first) continue;

          const username = await getBotUsername();
          if (username) await sendInstagramMessage(igsid, instagramGreeting(username));
        }
      }
    }
  } catch (error) {
    console.error(`[instagram] webhook failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
  }

  return new Response('OK', { status: 200 });
}
