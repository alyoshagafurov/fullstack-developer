import { NextResponse } from 'next/server';

/*
 * Contact endpoint — delivers a lead straight to Alisher's Telegram.
 *
 * Setup (one time, so submissions arrive in your Telegram automatically):
 *   1. In Telegram open @BotFather → /newbot → copy the token.
 *   2. Message your new bot once (press Start), then open @userinfobot to get
 *      your numeric chat id.
 *   3. On Vercel → Project → Settings → Environment Variables, add:
 *        TELEGRAM_BOT_TOKEN = <token from BotFather>
 *        TELEGRAM_CHAT_ID   = <your numeric id>
 *      Redeploy. Done — every request lands in your Telegram.
 *
 * Without those vars it responds { fallback:true } and the client opens a
 * prefilled email so the lead still reaches you.
 */

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const contact = (body.contact || '').trim();
  const budget = (body.budget || '').trim();
  const timeline = (body.timeline || '').trim();
  const message = (body.message || '').trim();

  // Validation at the boundary
  if (name.length < 2 || contact.length < 3 || message.length < 10) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  }
  // Honeypot (bots fill hidden fields)
  if ((body.website || '').length > 0) {
    return NextResponse.json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const text =
      `🚀 Новая заявка с сайта\n\n` +
      `👤 Имя: ${name}\n` +
      `📞 Контакт: ${contact}\n` +
      (budget ? `💰 Бюджет: ${budget}\n` : '') +
      (timeline ? `⏱ Сроки: ${timeline}\n` : '') +
      `\n📝 ${message}`;
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      });
      if (!r.ok) throw new Error(`tg ${r.status}`);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, fallback: true, error: 'delivery' }, { status: 502 });
    }
  }

  // Not configured — tell the client to fall back to a prefilled email.
  return NextResponse.json({ ok: false, fallback: true, error: 'not_configured' });
}
