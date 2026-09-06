'use client';

import { useState, useTransition } from 'react';
import { Pill } from '@/components/ui/Pill';
import {
  type ActionResult,
  telegramDeleteWebhook,
  telegramSendTest,
  telegramSetWebhook,
} from '@/app/admin/actions';

/*
 * Three buttons for the bot's connection. The work happens in server actions;
 * this only shows which one is running and what came back.
 */
export function TelegramPanel({ ready }: { ready: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = (action: () => Promise<ActionResult>, done: string) =>
    start(async () => {
      const result = await action();
      setMessage(result.status === 'ok' ? done : result.message);
    });

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Pill
          variant="solid"
          size="sm"
          disabled={pending || !ready}
          onClick={() => run(telegramSetWebhook, 'Вебхук подключён')}
        >
          Подключить вебхук
        </Pill>
        <Pill
          size="sm"
          disabled={pending || !ready}
          onClick={() => run(telegramSendTest, 'Сообщение отправлено — проверьте Telegram')}
        >
          Проверить связь
        </Pill>
        <Pill
          variant="quiet"
          size="sm"
          disabled={pending || !ready}
          onClick={() => run(telegramDeleteWebhook, 'Вебхук снят')}
        >
          Снять вебхук
        </Pill>
      </div>
      {message && (
        <p role="status" className="mt-4 text-sm text-ink-2">
          {message}
        </p>
      )}
    </div>
  );
}
