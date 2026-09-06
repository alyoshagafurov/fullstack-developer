/*
 * Points the bot at the site, or away from it.
 *
 *   npm run bot:webhook            — set, against https://aly.lat
 *   npm run bot:webhook:info
 *   npm run bot:webhook:delete
 *
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET from the environment and
 * never prints either. The same three calls are available from the admin's
 * settings page; this exists for the terminal.
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const [command = 'info', siteOrigin = 'https://aly.lat'] = process.argv.slice(2);

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

async function call(method: string, body?: Record<string, unknown>) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json()) as { ok: boolean; description?: string; result?: unknown };
  if (!payload.ok) throw new Error(payload.description ?? `${method} failed`);
  return payload.result;
}

async function main() {
  switch (command) {
    case 'set': {
      if (!secret) throw new Error('TELEGRAM_WEBHOOK_SECRET is not set');
      const url = `${siteOrigin.replace(/\/$/, '')}/api/telegram/webhook`;
      await call('setWebhook', {
        url,
        secret_token: secret,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      });
      console.log(`webhook set: ${url}`);
      break;
    }
    case 'delete': {
      await call('deleteWebhook', { drop_pending_updates: true });
      console.log('webhook removed');
      break;
    }
    default: {
      const info = (await call('getWebhookInfo')) as {
        url: string;
        pending_update_count: number;
        last_error_message?: string;
      };
      console.log(`url: ${info.url || '(none)'}`);
      console.log(`pending: ${info.pending_update_count}`);
      if (info.last_error_message) console.log(`last error: ${info.last_error_message}`);
    }
  }
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
