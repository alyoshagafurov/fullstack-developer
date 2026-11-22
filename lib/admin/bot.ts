import 'server-only';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/auth';
import type { OpResult } from '@/lib/admin/ops';
import { site } from '@/lib/content/site';
import { adminIds, botStatus, getApi, sendWithRetry, syncCommands } from '@/lib/telegram/api';

/*
 * The bot's connection and the owner's account — what the web admin's
 * settings screen did. The token and the webhook secret never leave the
 * server: these read whether they are set, never their values.
 *
 * Reconnecting the webhook and the password change alter how the bot and the
 * login work, so the app asks before calling them; the server only checks the
 * owner and the input.
 */

const webhookUrl = () => `${site.url}/api/telegram/webhook`;

function telegramError(error: unknown): string {
  const message = String((error as Error)?.message ?? '');
  const described = message.match(/:\s*(.{5,120})$/);
  return described ? `Telegram: ${described[1]}` : 'Telegram не ответил';
}

export async function readBotStatus(_: AdminGrant) {
  const status = await botStatus();
  return {
    ...status,
    expectedWebhook: webhookUrl(),
    connected: status.webhookUrl === webhookUrl(),
    blobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    clientView: `${site.url}/mini`,
    botLink: status.username ? `https://t.me/${status.username}` : null,
  };
}

/** Commands, the blue menu button and the description. Changes no data. */
export async function syncBot(_: AdminGrant): Promise<OpResult> {
  try {
    await syncCommands();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: telegramError(error) };
  }
}

/**
 * Point the bot at this site again. Updates waiting in Telegram are kept, so
 * nothing a client wrote while the hook was broken is lost.
 */
export async function reconnectWebhook(_: AdminGrant): Promise<OpResult> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return { status: 'error', message: 'На сервере не задан TELEGRAM_WEBHOOK_SECRET' };
  try {
    await getApi().setWebhook(webhookUrl(), { secret_token: secret, allowed_updates: ['message', 'callback_query'] });
    await syncCommands();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: telegramError(error) };
  }
}

/** A line to the owner's chat, to prove the chain works end to end. */
export async function sendTestMessage(_: AdminGrant): Promise<OpResult> {
  const admins = [...adminIds()];
  if (admins.length === 0) return { status: 'error', message: 'На сервере не задан TELEGRAM_ADMIN_IDS' };
  const results = await Promise.all(admins.map((id) => sendWithRetry(id, `${site.brand} · проверка связи из ALY OS`)));
  return results.some(Boolean)
    ? { status: 'ok' }
    : { status: 'error', message: 'Telegram не принял сообщение. Напишите боту /start и повторите' };
}

/**
 * A new password for the owner's login. The current one is required, and every
 * other ALY OS session is signed out, so a lost phone loses its access.
 */
export async function changePassword(
  _: AdminGrant,
  ownerId: string,
  keepTokenHash: string,
  current: unknown,
  next: unknown,
): Promise<OpResult> {
  if (typeof current !== 'string' || typeof next !== 'string') return { status: 'error', message: 'Заполните оба поля' };
  if (next.length < 10) return { status: 'error', message: 'Новый пароль короче 10 символов' };
  if (next.length > 256) return { status: 'error', message: 'Слишком длинный пароль' };
  if (next === current) return { status: 'error', message: 'Новый пароль совпадает с текущим' };
  const user = await prisma.adminUser.findUnique({ where: { id: ownerId } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { status: 'error', message: 'Текущий пароль неверен' };
  }
  await prisma.adminUser.update({ where: { id: ownerId }, data: { passwordHash: await hashPassword(next) } });
  await prisma.$executeRaw`DELETE FROM aly_mobile_session WHERE owner_id=${ownerId} AND token_hash<>${keepTokenHash}`;
  return { status: 'ok' };
}
