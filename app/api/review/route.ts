import { NextResponse, after } from 'next/server';
import { reviewSchema } from '@/lib/content/review';
import { looksAutomated, withinRateLimit } from '@/lib/lead';
import { prisma } from '@/lib/prisma';
import { notifyNewReview } from '@/lib/telegram/notify';

/*
 * The review form's door. A review is stored unpublished and the owner is
 * told; nothing reaches the page until he approves it in the admin. Nothing
 * the visitor typed is logged.
 */

export const runtime = 'nodejs';

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return `review:${forwarded?.split(',')[0]?.trim() || 'local'}`;
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

  // Bots are answered as if they had succeeded.
  if (looksAutomated(data.website, data.startedAt)) return NextResponse.json({ ok: true });

  if (!withinRateLimit(clientKey(request))) {
    return NextResponse.json({ error: 'Слишком много отзывов подряд. Попробуйте позже.' }, { status: 429 });
  }

  try {
    const row = await prisma.testimonial.create({
      data: {
        name: data.name,
        company: data.company || null,
        text: data.text,
        rating: data.rating,
        gender: data.gender,
        source: 'site',
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
