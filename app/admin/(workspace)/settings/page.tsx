import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { PasswordForm } from './PasswordForm';
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
