'use client';

import { useState, useTransition } from 'react';
import { saveCase, type ActionResult } from '@/app/admin/actions';

/*
 * The case editor.
 *
 * Text fields only, on purpose: screenshots are entered as paths or URLs rather
 * than uploaded, because the Vercel Blob store has not been created yet and a
 * broken upload button is worse than an honest text field. Put files in
 * public/cases and write their paths here, one per line.
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
  { file: '/objects/fig-sphere.webp', label: 'Сфера' },
  { file: '/objects/fig-ribbon.webp', label: 'Лента' },
  { file: '/objects/fig-stack.webp', label: 'Стопка' },
  { file: '/objects/fig-cube.webp', label: 'Куб' },
  { file: '/objects/fig-ring.webp', label: 'Кольцо' },
  { file: '/objects/fig-prism.webp', label: 'Призма' },
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
        <Field label="Слово-призрак" hint="необязательно">
          <input name="ghostWord" defaultValue={values.ghostWord} className={field} />
        </Field>
        <Field label="Скриншоты" hint="по одному пути в строке, например /cases/shot-1.webp">
          <textarea name="screenshots" defaultValue={values.screenshots} rows={4} className={field} />
        </Field>
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

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-xs font-medium tracking-[0.04em] text-paper disabled:opacity-40"
      >
        {pending ? 'Сохраняю…' : 'Сохранить'}
      </button>
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
