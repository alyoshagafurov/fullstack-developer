import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { botStatus } from '@/lib/telegram/api';
import { PasswordForm } from './PasswordForm';
import { TelegramPanel } from './TelegramPanel';
import { site } from '@/lib/content/site';

export const dynamic = 'force-dynamic';

/*
 * Settings.
 *
 * Only the things that genuinely live in the database. The site's texts come
 * from the owner's own answers in the repository, not from a form: a screen
 * that let them be edited here would put two versions of his words in two
 * places and guarantee they drift apart.
 */
export default async function SettingsPage() {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const bot = await botStatus();
  const ready = bot.token && bot.secret;

  return (
    <div className="space-y-14">
      <header>
        <p className="label mb-3">Настройки</p>
        <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">Аккаунт</h1>
      </header>

      <section className="border-t border-line pt-10">
        <p className="label mb-4">Вход</p>
        <p className="text-sm text-ink-2">{gate.user.email}</p>
      </section>

      <section className="border-t border-line pt-10">
        <p className="label mb-6">Смена пароля</p>
        <PasswordForm />
      </section>

      {/*
       * The bot's connection. Presence only — the token and the secret are
       * never read into a page. What the owner needs here is whether Telegram
       * knows where the site is, and a way to tell it.
       */}
      <section className="border-t border-line pt-10">
        <p className="label mb-6">Telegram-бот</p>
        <dl className="mb-8 grid max-w-2xl gap-x-10 gap-y-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="mb-1 text-ink-3">Бот</dt>
            <dd>
              {bot.token ? (
                bot.username ? (
                  <a
                    href={`https://t.me/${bot.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    @{bot.username}
                  </a>
                ) : (
                  'токен задан'
                )
              ) : (
                'TELEGRAM_BOT_TOKEN не задан'
              )}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-ink-3">Секрет вебхука</dt>
            <dd>{bot.secret ? 'задан' : 'TELEGRAM_WEBHOOK_SECRET не задан'}</dd>
          </div>
          <div>
            <dt className="mb-1 text-ink-3">Админы</dt>
            <dd>
              {bot.admins > 0
                ? `${bot.admins} — из TELEGRAM_ADMIN_IDS`
                : 'не заданы: напишите боту /id и добавьте число в TELEGRAM_ADMIN_IDS'}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-ink-3">Вебхук</dt>
            <dd className="break-all">
              {bot.webhookUrl ? bot.webhookUrl : 'не подключён'}
              {bot.pending > 0 && ` · в очереди ${bot.pending}`}
              {bot.lastError && <span className="block text-ink-3">{bot.lastError}</span>}
            </dd>
          </div>
        </dl>

        <TelegramPanel ready={ready} />

        <ol className="mt-8 max-w-2xl list-decimal space-y-2 pl-5 text-sm text-ink-3">
          <li>
            На Vercel задать TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET и TELEGRAM_ADMIN_IDS,
            затем передеплоить.
          </li>
          <li>Нажать «Подключить вебхук» — Telegram начнёт присылать сообщения сюда.</li>
          <li>Нажать «Проверить связь» — бот напишет вам в Telegram.</li>
        </ol>
      </section>

      <section className="border-t border-line pt-10">
        <p className="label mb-6">Где что лежит</p>
        <dl className="max-w-2xl space-y-6 text-sm">
          <div>
            <dt className="mb-1 text-ink-2">Тексты сайта</dt>
            <dd className="text-ink-3">
              В файлах проекта, из ваших ответов. Меняются в коде, чтобы не было двух версий одного
              текста в двух местах.
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-ink-2">Кейсы и отзывы</dt>
            <dd className="text-ink-3">
              В базе, редактируются здесь. Публикация появляется на сайте без пересборки.
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-ink-2">Заявки</dt>
            <dd className="text-ink-3">
              В базе. В Telegram они не хранятся: бот только уведомляет и показывает.
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-ink-2">Домен</dt>
            <dd className="text-ink-3">{site.domain}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
