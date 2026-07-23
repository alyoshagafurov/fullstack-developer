import { NextResponse } from 'next/server';

/*
 * Contact endpoint — delivers a lead straight to Alisher's Telegram.
 *
 * Setup (one time):
 *   1. Send /id to your bot (@alygafurov_bot) — it replies with your chat id.
 *   2. Vercel → Settings → Environment Variables → add TELEGRAM_CHAT_ID = <that id>.
 *   3. Redeploy. Done — every request lands in your Telegram.
 * The bot token is reused from BOT_TOKEN, so no second token is needed.
 *
 * Without a chat id it responds { fallback:true } and the client opens a
 * prefilled email so the lead still reaches you.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Build a one-tap "reply" link from whatever contact the client left. */
function replyLink(contact: string): string | null {
  const c = contact.trim();
  const at = c.match(/@([A-Za-z0-9_]{4,32})/);
  if (at) return `https://t.me/${at[1]}`;
  const digits = c.replace(/\D/g, '');
  if (digits.length >= 9) return `https://wa.me/${digits}`;
  return null;
}

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const contact = (body.contact || '').trim();
  const task = (body.task || '').trim();
  const budget = (body.budget || '').trim();
  const timeline = (body.timeline || '').trim();
  const message = (body.message || '').trim();

  // Validation at the boundary — name + a way to reach them is the minimum.
  if (name.length < 2 || contact.length < 3) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  }
  // Honeypot (bots fill hidden fields)
  if ((body.website || '').length > 0) {
    return NextResponse.json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const link = replyLink(contact);
    const text =
      `🔥 <b>Новая заявка с сайта</b>\n\n` +
      `👤 <b>Имя:</b> ${esc(name)}\n` +
      `📞 <b>Контакт:</b> ${esc(contact)}\n` +
      (task ? `🧩 <b>Задача:</b> ${esc(task)}\n` : '') +
      (budget ? `💰 <b>Бюджет:</b> ${esc(budget)}\n` : '') +
      (timeline ? `⏱ <b>Сроки:</b> ${esc(timeline)}\n` : '') +
      (message ? `\n📝 ${esc(message)}\n` : '') +
      (link ? `\n👉 <a href="${link}">Ответить клиенту</a>` : '');

    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          ...(link
            ? { reply_markup: { inline_keyboard: [[{ text: '💬 Ответить клиенту', url: link }]] } }
            : {}),
        }),
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
