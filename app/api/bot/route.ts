import { Bot, InlineKeyboard, webhookCallback } from 'grammy';

/*
 * Telegram bot (grammy) — runs as a Vercel serverless webhook.
 * On /start or any text message it replies with a greeting + a URL button to
 * the site. No DB, no state — greeting and redirect only.
 *
 * ENV: BOT_TOKEN (from @BotFather). Set it in Vercel → Settings → Env Variables.
 * After deploy, register the webhook (see the /setWebhook command shared in chat).
 */

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://alyosha-dev.vercel.app';

const GREETING =
  '<b>Алишер Гафуров</b>\n' +
  'Full-Stack разработчик\n\n' +
  'Создаю современные сайты и веб-приложения под ключ — от идеи до запуска. ' +
  'Делаю так, чтобы сайт выглядел дорого, работал быстро и приводил клиентов.\n\n' +
  '<b>На сайте вы найдёте:</b>\n' +
  '• Мои работы и кейсы\n' +
  '• Услуги — что именно я делаю\n' +
  '• Как я работаю над проектом\n' +
  '• Цены\n' +
  '• Форму заявки — опишите задачу, отвечу в течение дня\n\n' +
  'Откройте сайт, посмотрите работы и оставьте заявку 👇';

const token = process.env.BOT_TOKEN;

// Build the bot lazily so a missing token never breaks the rest of the project.
const bot = token ? new Bot(token) : null;

if (bot) {
  const keyboard = new InlineKeyboard().url('🌐 Открыть сайт и оставить заявку', SITE_URL);
  bot.on('message', async (ctx) => {
    // /id — owner helper: returns the chat id to paste into TELEGRAM_CHAT_ID
    // so website requests get delivered here.
    if ((ctx.message.text || '').trim().toLowerCase() === '/id') {
      await ctx.reply(
        `🆔 <b>Ваш chat id:</b> <code>${ctx.chat.id}</code>\n\n` +
          `Добавьте его в Vercel → Settings → Environment Variables как ` +
          `<code>TELEGRAM_CHAT_ID</code> и сделайте Redeploy — заявки с сайта будут приходить сюда.`,
        { parse_mode: 'HTML' },
      );
      return;
    }
    await ctx.reply(GREETING, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
      link_preview_options: { is_disabled: true },
    });
  });
}

const handle = bot ? webhookCallback(bot, 'std/http') : null;

export async function POST(req: Request) {
  if (!handle) return new Response('BOT_TOKEN is not configured', { status: 500 });
  return handle(req);
}

/*
 * GET /api/bot            → healthcheck ("Bot is running")
 * GET /api/bot?setup      → registers the Telegram webhook to this same domain
 *   using the BOT_TOKEN already in the server env (no token in the URL). Open it
 *   once in the browser after deploy to finish setup.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.has('setup')) {
    if (!bot) return new Response('BOT_TOKEN is not configured', { status: 500 });
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const hookUrl = `https://${host}/api/bot`;
    try {
      await bot.api.setWebhook(hookUrl, { drop_pending_updates: true });
      return Response.json({ ok: true, webhook: hookUrl });
    } catch (e) {
      return Response.json({ ok: false, error: String((e as Error)?.message || e) }, { status: 500 });
    }
  }
  return new Response('Bot is running', { status: 200 });
}
