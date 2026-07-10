import { NextResponse } from 'next/server';

/*
 * Contact endpoint.
 *
 * Zero-config: without env vars it responds { ok:false, fallback:true } and the
 * client opens a prefilled email so the message still reaches you.
 *
 * To receive submissions automatically (recommended), set in Vercel/.env:
 *   TELEGRAM_BOT_TOKEN=...     (from @BotFather)
 *   TELEGRAM_CHAT_ID=...       (your numeric id, from @userinfobot)
 * When both are present, each submission is delivered to your Telegram instantly.
 */

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const company = (body.company || '').trim();
  const budget = (body.budget || '').trim();
  const timeline = (body.timeline || '').trim();
  const message = (body.message || '').trim();

  // Validation at the boundary
  if (name.length < 2 || !isEmail(email) || message.length < 10) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  }
  // Honeypot (bots fill hidden fields)
  if ((body.website || '').length > 0) {
    return NextResponse.json({ ok: true }); // silently accept & drop
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const text =
      `🚀 Новая заявка с сайта\n\n` +
      `👤 Имя: ${name}\n` +
      `✉️ Email: ${email}\n` +
      (company ? `🏢 Компания: ${company}\n` : '') +
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
    } catch (e) {
      return NextResponse.json({ ok: false, fallback: true, error: 'delivery' }, { status: 502 });
    }
  }

  // Not configured — tell the client to fall back to a prefilled email.
  return NextResponse.json({ ok: false, fallback: true, error: 'not_configured' });
}
