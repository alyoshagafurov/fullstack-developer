import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { botToken } from '@/lib/telegram/api';

/*
 * Who opened the Mini App, proved rather than claimed.
 *
 * When Telegram launches a Mini App it hands the page an `initData` string: the
 * user's id, name and username, a timestamp, and an HMAC over all of it keyed
 * on the bot's own token. Only Telegram and this server know that token, so a
 * string that verifies here came from Telegram and names the person who really
 * pressed the button. `Telegram.WebApp.initDataUnsafe` carries the same fields
 * already parsed and is fine for filling a name into a field, but it is the
 * client's word for it; nothing that reaches the database may rest on it.
 *
 * That signature is the whole reason the brief and the review are worth moving
 * into a Mini App. A lead that arrives with one is already attached to a
 * Telegram chat, so every later status change finds the client without anyone
 * quoting a reference number; a review that arrives with one came from an
 * account Telegram vouches for rather than from an anonymous form.
 *
 * Three details here are the ones implementations get wrong, and all three were
 * settled against a real Telegram-signed vector rather than a fixture of our
 * own — a fixture is precisely what hides these:
 *
 *   The key of the first HMAC is the constant "WebAppData" and the message is
 *   the bot token. Telegram writes it `HMAC_SHA256(<bot_token>, "WebAppData")`,
 *   which is (message, key) — the reverse of `createHmac(alg, key)`. Swapping
 *   them yields a validator that rejects everything honest.
 *
 *   `signature` stays in the signed string; only `hash` comes out. Telegram
 *   excludes both only for its separate Ed25519 third-party check, and every
 *   current client sends `signature` — so deleting it here would reject every
 *   real user while a hand-built fixture without the field sailed through.
 *
 *   The pairs sort by key, not by the rendered "key=value" line. For the fields
 *   Telegram actually sends the two orders agree, so this costs nothing today
 *   and is simply correct.
 *
 * This is not the Login Widget algorithm, where the secret is a plain SHA-256
 * of the token. Code from one cannot be reused for the other.
 */

export type MiniAppUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
};

export type MiniAppCheck =
  | { ok: true; user: MiniAppUser; authDate: Date }
  | { ok: false; reason: MiniAppFailure };

/**
 * Why a string was refused.
 *
 * Deliberately coarse, and never returned to the caller: telling whoever sent a
 * forged signature which part of it was wrong is telling them how to fix it.
 * The endpoints log this and answer with the same words they would use for an
 * ordinary submission.
 */
export type MiniAppFailure =
  | 'unconfigured'
  | 'empty'
  | 'malformed'
  | 'forged'
  | 'stale'
  | 'no-user';

/**
 * How old a launch may be.
 *
 * Telegram asks for a freshness check and names no number. `auth_date` is
 * stamped when the window opens and never refreshes, so this is really the
 * answer to "how long may someone take over the brief" — and a client who opens
 * thirteen questions, is interrupted and comes back after lunch should not lose
 * the lot. A day is generous for that and still bounds the one thing the window
 * allows: replaying a captured string, which buys an attacker a rate-limited
 * lead, or a review the owner has to approve by hand anyway.
 */
const MAX_AGE_SECONDS = 24 * 60 * 60;

/** A hash is 32 bytes in hex. `Buffer.from` would quietly truncate anything else. */
const HEX64 = /^[0-9a-f]{64}$/i;

export function verifyInitData(initData: string, maxAgeSeconds = MAX_AGE_SECONDS): MiniAppCheck {
  const token = botToken();
  if (!token) return { ok: false, reason: 'unconfigured' };
  if (!initData) return { ok: false, reason: 'empty' };

  /*
   * Exactly one `hash`, counted before anything is parsed.
   *
   * `URLSearchParams.get` returns the first of a repeated key and `delete`
   * removes them all, so `…&hash=<real>&hash=zz` verifies as happily as the
   * original. One signature would then have infinitely many spellings, and
   * anything that later wants to recognise a string it has seen before — an
   * idempotency key, a replay log — would be counting strings while an
   * attacker counted signatures.
   */
  if (initData.split('&').filter((part) => part.startsWith('hash=')).length !== 1) {
    return { ok: false, reason: 'malformed' };
  }

  const params = new URLSearchParams(initData);

  const hash = params.get('hash');
  if (!hash || !HEX64.test(hash)) return { ok: false, reason: 'malformed' };
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const expected = createHmac('sha256', secret).update(dataCheckString).digest();
  const given = Buffer.from(hash, 'hex');

  // Constant time, so a near miss takes exactly as long as a wild guess.
  if (given.length !== expected.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: 'forged' };
  }

  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || authDate <= 0) return { ok: false, reason: 'stale' };

  const now = Math.floor(Date.now() / 1000);
  /*
   * Bounded on both sides. An age check only looks backwards, so a signature
   * stamped in the future passes it for as long as the future lasts — and the
   * stamp is inside the signed data, which Telegram alone can produce, but a
   * clock that has drifted is not an attack and a clock that has drifted by a
   * year should not mint an admin key that outlives the year. A minute of slack
   * covers real skew.
   */
  if (authDate - now > 60) return { ok: false, reason: 'stale' };
  if (maxAgeSeconds > 0 && now - authDate > maxAgeSeconds) {
    return { ok: false, reason: 'stale' };
  }

  const raw = params.get('user');
  if (!raw) return { ok: false, reason: 'no-user' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const user = readUser(parsed);
  if (!user) return { ok: false, reason: 'no-user' };

  return { ok: true, user, authDate: new Date(authDate * 1000) };
}

/**
 * The four fields this application has a use for, each narrowed to a string.
 *
 * The signature proves Telegram sent the object; it promises nothing about the
 * shape of it, and a name from here is about to be written into a lead and read
 * by the owner. Anything missing becomes an empty string, rather than an
 * `undefined` that renders as the word "undefined".
 */
function readUser(value: unknown): MiniAppUser | null {
  if (typeof value !== 'object' || value === null) return null;
  const row = value as Record<string, unknown>;

  /*
   * Safe, not merely whole. Above 2^53 two different Telegram ids round to the
   * same double, and an id is about to be compared against the owner's own —
   * a comparison that must never be true by accident.
   */
  const id = typeof row.id === 'number' ? row.id : Number(row.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const text = (field: unknown, limit: number) =>
    typeof field === 'string' ? field.trim().slice(0, limit) : '';

  return {
    id,
    firstName: text(row.first_name, 80),
    lastName: text(row.last_name, 80),
    username: text(row.username, 40),
    languageCode: text(row.language_code, 10),
  };
}

/** Their own name, as a form would prefill it. Empty when Telegram sent none. */
export function userFullName(user: MiniAppUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}

/**
 * How the owner can reach them, out of what Telegram gave us.
 *
 * A handle is worth more than an id here: it is the thing he can type into a
 * search box. Without one the id is still a working target for the bot, and the
 * `tg:` prefix is what stops it reading like a phone number.
 */
export function userContact(user: MiniAppUser): string {
  return user.username ? `@${user.username}` : `tg:${user.id}`;
}
