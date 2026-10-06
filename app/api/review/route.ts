import { NextResponse, after } from 'next/server';
import { reviewSchema } from '@/lib/content/review';
import { looksAutomated, withinRateLimit } from '@/lib/lead';
import { prisma } from '@/lib/prisma';
import { verifyInitData, type MiniAppUser } from '@/lib/telegram/miniapp';
import { notifyNewReview } from '@/lib/telegram/notify';

/*
 * The review form's door, for the form on the site and for the same form
 * running as a Telegram Mini App.
 *
 * A review is stored unpublished and the owner is told; nothing reaches the
 * page until he approves it in the admin. That holds for a signed review too —
 * knowing which Telegram account wrote one says nothing about whether it
 * belongs on the owner's own front page, and the approval is his to give.
 * Nothing the visitor typed is logged.
 */

export const runtime = 'nodejs';

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return `review:${forwarded?.split(',')[0]?.trim() || 'local'}`;
}

/**
 * Whoever Telegram says opened the Mini App, or nobody.
 *
 * Read off the raw body rather than through `reviewSchema`: it says who is
 * writing, not what they wrote. Zod strips it, so the stored row never sees it.
 */
function miniAppUser(body: unknown): MiniAppUser | null {
  const initData = (body as { initData?: unknown })?.initData;
  if (typeof initData !== 'string' || !initData) return null;

  const check = verifyInitData(initData);
  if (!check.ok) {
    // The reason, never the string: initData names a real person.
    console.warn(`[review] mini app signature rejected: ${check.reason}`);
    return null;
  }
  return check.user;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Не удалось прочитать отзыв' }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
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
   * The stopwatch is skipped for a signed review, and this is the case it would
   * have broken outright. A client who opens the Mini App, finds their name
   * already filled in, taps five stars and sends can finish inside four
   * seconds — and `looksAutomated` answers a fast submission with a cheerful
   * `{ ok: true }` while writing nothing and telling nobody. The client reads
   * "Спасибо", the owner never hears about it, and there is no error anywhere
   * to find it by. A Telegram signature is a better answer to "is this a
   * person" than a stopwatch ever was.
   */
  if (!telegram && looksAutomated(data.website, data.startedAt)) {
    // Bots are answered as if they had succeeded.
    return NextResponse.json({ ok: true });
  }

  /*
   * One bucket per account rather than per address when Telegram named one: a
   * household behind a single address should not run out of reviews because a
   * neighbour left one.
   */
  const bucket = telegram ? `review:tg:${telegram.id}` : clientKey(request);
  if (!withinRateLimit(bucket)) {
    return NextResponse.json(
      { error: 'Слишком много отзывов подряд. Попробуйте позже.' },
      { status: 429 },
    );
  }

  try {
    const row = await prisma.testimonial.create({
      data: {
        name: data.name,
        company: data.company || null,
        text: data.text,
        rating: data.rating,
        gender: data.gender,
        // Where it came from, so the owner can see it arrived from a Telegram
        // account rather than from an anonymous form.
        source: telegram ? 'telegram' : 'site',
        published: false,
        featured: false,
      },
      select: { id: true },
    });
    after(() => notifyNewReview(row.id));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(`[review] create failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
    return NextResponse.json({ error: 'Не получилось сохранить отзыв. Попробуйте ещё раз.' }, { status: 500 });
  }
}
