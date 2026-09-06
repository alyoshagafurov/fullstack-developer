import { NextResponse, after } from 'next/server';
import { briefSchema } from '@/lib/content/brief';
import { looksAutomated, withinEmailQuota, withinRateLimit } from '@/lib/lead';
import { createLead } from '@/lib/telegram/leads';
import { notifyNewLead } from '@/lib/telegram/notify';

/*
 * The site's door into the leads table. The bot has the other one, and both
 * lead to `createLead`, so there is a single definition of what gets written.
 *
 * Everything the browser sends is re-validated here with the same schema the
 * form uses, so a field can never be checked in the client and skipped on the
 * server. Nothing the visitor typed is ever logged: a brief carries their name,
 * their email and their business, and logs are the wrong place for all three.
 *
 * The owner is told in Telegram after the response is sent — the visitor
 * should not wait on a third party to learn that their brief is in.
 */

export const runtime = 'nodejs';

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

  // Answer bots exactly as if they had succeeded. Telling them why they failed
  // only helps them try again differently.
  if (looksAutomated(data.website, data.startedAt)) {
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

    const lead = await createLead(data, 'site');

    after(() => notifyNewLead(lead.id));

    // The code is what lets the client ask the bot about this brief later. It
    // is shown once, on the confirmation page, and never sent anywhere else.
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
