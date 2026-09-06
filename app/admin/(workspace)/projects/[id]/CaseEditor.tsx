'use client';

import { useState, useTransition } from 'react';
import { deleteCase, saveCase, type ActionResult } from '@/app/admin/actions';
import { LogoUploader, ScreenshotUploader } from './ScreenshotUploader';

/*
 * The case editor.
 *
 * Screenshots are picked from the disk or dropped onto the box and go straight
 * to Vercel Blob; the form still submits their URLs one per line, so the save
 * action is unchanged. A path under /public can also be typed in by hand.
 *
 * The object picker offers the studio objects that already exist, so a case
 * cannot point at an image that is not there.
 */

const OBJECTS = [
  { file: '/objects/laptop.webp', label: 'Ноутбук' },
  { file: '/objects/phone.webp', label: 'Смартфон' },
  { file: '/objects/tablet-phone.webp', label: 'Планшет и телефон' },
  { file: '/objects/display.webp', label: 'Монитор' },
  { file: '/objects/phone-watch.webp', label: 'Телефон и часы' },
  { file: '/objects/cluster.webp', label: 'Кластер устройств' },
];

export type CaseValues = {
  id: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  task: string;
  solution: string;
  result: string;
  technologies: string;
  liveUrl: string;
  objectImage: string;
  ghostWord: string;
  logoUrl: string;
  screenshots: string;
  featured: boolean;
  order: number;
  published: boolean;
};

const field =
  'w-full border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink';

export function CaseEditor({ values }: { values: CaseValues }) {
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  // Deleting is one click away but never one click: the second click confirms.
  const [confirming, setConfirming] = useState(false);

  return (
    <form
      className="max-w-3xl space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        start(async () => {
          const result: ActionResult = await saveCase(values.id, data);
          if (result.status === 'error') setError(result.message);
        });
      }}
    >
      <section className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Название">
            <input name="title" defaultValue={values.title} required className={field} />
          </Field>
          <Field label="Адрес на сайте" hint="латиницей: my-project">
            <input name="slug" defaultValue={values.slug} required className={field} />
          </Field>
          <Field label="Клиент" hint="можно «под NDA»">
            <input name="client" defaultValue={values.client} className={field} />
          </Field>
          <Field label="Год">
            <input name="year" defaultValue={values.year} className={field} />
          </Field>
        </div>
      </section>

      <section className="space-y-6 border-t border-line pt-8">
        <Field label="Задача" hint="с чем пришли, что было не так">
          <textarea name="task" defaultValue={values.task} rows={4} className={field} />
        </Field>
        <Field label="Решение" hint="что вы сделали">
          <textarea name="solution" defaultValue={values.solution} rows={5} className={field} />
        </Field>
        <Field label="Результат" hint="только настоящие цифры, иначе словами">
          <textarea name="result" defaultValue={values.result} rows={4} className={field} />
        </Field>
        <Field label="Технологии" hint="через запятую">
          <input name="technologies" defaultValue={values.technologies} className={field} />
        </Field>
        <Field label="Ссылка на живой проект" hint="пусто, если закрытый">
          <input name="liveUrl" defaultValue={values.liveUrl} className={field} />
        </Field>
      </section>

      <section className="space-y-6 border-t border-line pt-8">
        <Field label="Объект в витрине">
          <select name="objectImage" defaultValue={values.objectImage} className={field}>
            {OBJECTS.map((o) => (
              <option key={o.file} value={o.file}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Слово-призрак" hint="одно слово, встанет огромным фоном за объектом">
          <input
            name="ghostWord"
            defaultValue={values.ghostWord}
            maxLength={24}
            className={field}
          />
        </Field>
        <div>
          <span className="label mb-3 flex items-baseline gap-3">
            Логотип клиента
            <span className="text-ink-3 normal-case tracking-normal">
              встанет слева в списке работ
            </span>
          </span>
          <LogoUploader initial={values.logoUrl} name="logoUrl" />
        </div>
        <div>
          <span className="label mb-3 flex items-baseline gap-3">
            Скриншоты
            <span className="text-ink-3 normal-case tracking-normal">выберите файлы или перетащите</span>
          </span>
          <ScreenshotUploader initial={values.screenshots.split('\n').filter(Boolean)} />
        </div>
      </section>

      <section className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
        <Field label="Порядок">
          <input
            name="order"
            type="number"
            defaultValue={values.order}
            className={field}
          />
        </Field>
        <label className="flex items-center gap-3 self-end text-sm">
          <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4" />
          В витрине на главной
        </label>
        <label className="flex items-center gap-3 self-end text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={values.published}
            className="size-4"
          />
          Опубликован
        </label>
      </section>

      {error && (
        <p role="alert" className="border-l-2 border-ink pl-4 text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-xs font-medium tracking-[0.04em] text-paper disabled:opacity-40"
        >
          {pending ? 'Сохраняю…' : 'Сохранить'}
        </button>

        {values.id &&
          (confirming ? (
            <span className="flex flex-wrap items-center gap-4 text-sm">
              Удалить кейс насовсем?
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const result = await deleteCase(values.id);
                    if (result?.status === 'error') setError(result.message);
                  })
                }
                className="font-medium underline underline-offset-4 disabled:opacity-40"
              >
                Да, удалить
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-ink-3 underline-offset-4 hover:underline"
              >
                Отмена
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-sm text-ink-3 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Удалить кейс
            </button>
          ))}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-3 flex items-baseline gap-3">
        {label}
        {hint && <span className="text-ink-3 normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
