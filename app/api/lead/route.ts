import { NextResponse, after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { briefSchema } from '@/lib/content/brief';
import { looksAutomated, withinEmailQuota, withinRateLimit } from '@/lib/lead';
import { createLead } from '@/lib/telegram/leads';
import { verifyInitData, type MiniAppUser } from '@/lib/telegram/miniapp';
import { notifyClientBrief, notifyNewLead } from '@/lib/telegram/notify';

/*
 * The door into the leads table used by everything with a browser in it: the
 * form on the site, and the same form running as a Telegram Mini App. The bot's
 * own dialogue has the other door, and all of them end at `createLead`, so
 * there is a single definition of what gets written.
 *
 * Everything the browser sends is re-validated here with the same schema the
 * form uses, so a field can never be checked in the client and skipped on the
 * server. Nothing the visitor typed is ever logged: a brief carries their name,
 * their email and their business, and logs are the wrong place for all three.
 *
 * The owner is told in Telegram after the response is sent — the visitor should
 * not wait on a third party to learn that their brief is in.
 */

export const runtime = 'nodejs';

/** The bot's own limit, so the two doors cannot be played off each other. */
const BRIEFS_PER_DAY = 3;

/**
 * Whoever Telegram says opened the Mini App, or nobody.
 *
 * The field is read off the raw body rather than added to `briefSchema`,
 * because it is not part of a brief: it says who is filling one in. Zod strips
 * what it does not know about, so the parsed data never carries it onward.
 */
function miniAppUser(body: unknown): MiniAppUser | null {
  const initData = (body as { initData?: unknown })?.initData;
  if (typeof initData !== 'string' || !initData) return null;

  const check = verifyInitData(initData);
  if (!check.ok) {
    // The reason, never the string: initData names a real person.
    console.warn(`[lead] mini app signature rejected: ${check.reason}`);
    return null;
  }
  return check.user;
}

function clientKey(request: Request): string {
  // Vercel sets x-forwarded-for and strips any client-supplied copy, so the
  // first entry is the real caller there. Locally it is absent and every
  // request shares one bucket, which is correct for a single developer.
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'local';
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Не удалось прочитать заявку' }, { status: 400 });
  }

  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    const issues: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'form');
      if (!issues[field]) issues[field] = issue.message;
    }
    return NextResponse.json({ error: 'Проверьте поля', issues }, { status: 400 });
  }

  const data = parsed.data;
  const telegram = miniAppUser(body);

  /*
   * The honeypot and the stopwatch are a guess at whether a person filled this
   * in. A Telegram signature is an answer, so where there is one the guess is
   * not consulted — and it would be wrong here more often than not: the whole
   * point of a Mini App is that a client already signed in can open it, tap
   * through and send, and "faster than a person could type" was calibrated
   * against a stranger starting from a blank page.
   */
  if (!telegram && looksAutomated(data.website, data.startedAt)) {
    // Answer bots exactly as if they had succeeded. Telling them why they
    // failed only helps them try again differently.
    return NextResponse.json({ ref: 'ALY-0000-000' }, { status: 200 });
  }

  if (!withinRateLimit(clientKey(request))) {
    return NextResponse.json(
      { error: 'Слишком много заявок подряд. Попробуйте позже или напишите в Telegram.' },
      { status: 429 },
    );
  }

  try {
    if (!(await withinEmailQuota(data.email))) {
      return NextResponse.json(
        { error: 'С этой почты уже есть заявки. Напишите мне в Telegram, отвечу быстрее.' },
        { status: 429 },
      );
    }

    /*
     * The same daily cap the in-bot dialogue applies, counted against the
     * chat rather than the address. It survives restarts and a change of
     * email, which is what makes it worth having alongside the quota above.
     */
    if (telegram) {
      const chatId = String(telegram.id);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const today = await prisma.lead.count({
        where: { telegramChatId: chatId, createdAt: { gte: since } },
      });
      if (today >= BRIEFS_PER_DAY) {
        return NextResponse.json(
          { error: 'Слишком много заявок за сегодня. Напишите мне в Telegram, я на связи.' },
          { status: 429 },
        );
      }
    }

    /*
     * A signed brief is written as a Telegram lead and tied to the chat it came
     * from, which is the one thing the Mini App buys over a link to the site:
     * every later status change reaches the client without them quoting a
     * number, and the owner can answer in the chat they are already in.
     */
    const lead = telegram
      ? await createLead(data, 'telegram', String(telegram.id))
      : await createLead(data, 'site');

    after(() => notifyNewLead(lead.id));

    /*
     * The code is what lets the client ask the bot about this brief later. The
     * Mini App shows it once and then closes, so a client who came through
     * Telegram is also sent it in the chat, where it keeps.
     */
    if (telegram) {
      after(() => notifyClientBrief(String(telegram.id), lead.ref, lead.trackingToken));
    }

    return NextResponse.json({ ref: lead.ref, code: lead.trackingToken }, { status: 201 });
  } catch (error) {
    // Class only. The body of this request must never reach a log line.
    console.error(`[lead] create failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
    return NextResponse.json(
      { error: 'Не получилось сохранить заявку. Напишите мне в Telegram, я на связи.' },
      { status: 500 },
    );
  }
}
