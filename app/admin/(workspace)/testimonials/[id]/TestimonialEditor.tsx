'use client';

import { useState, useTransition } from 'react';
import { saveTestimonial, type ActionResult } from '@/app/admin/actions';

/*
 * The testimonial editor.
 *
 * Everything is typed in by the owner. There is no generator here and never
 * will be: a fabricated quote attributed to a named person is a lie about a
 * real human being. With no photo the site draws a monogram from the initials,
 * which is honest and needs nobody's face.
 */

export type TestimonialValues = {
  id: string;
  name: string;
  company: string;
  role: string;
  text: string;
  avatarUrl: string;
  caseId: string;
  featured: boolean;
  order: number;
  published: boolean;
};

const field =
  'w-full border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink';

export function TestimonialEditor({
  values,
  cases,
}: {
  values: TestimonialValues;
  cases: { id: string; title: string }[];
}) {
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      className="max-w-2xl space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        start(async () => {
          const result: ActionResult = await saveTestimonial(values.id, data);
          if (result.status === 'error') setError(result.message);
        });
      }}
    >
      <label className="block">
        <span className="label mb-3 block">Текст отзыва</span>
        <textarea name="text" defaultValue={values.text} rows={6} required className={field} />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="label mb-3 block">Имя</span>
          <input name="name" defaultValue={values.name} required className={field} />
        </label>
        <label className="block">
          <span className="label mb-3 block">Компания</span>
          <input name="company" defaultValue={values.company} className={field} />
        </label>
        <label className="block">
          <span className="label mb-3 block">Должность</span>
          <input name="role" defaultValue={values.role} className={field} />
        </label>
        <label className="block">
          <span className="label mb-3 flex items-baseline gap-3">
            Фото
            <span className="text-ink-3 normal-case tracking-normal">пусто — будет монограмма</span>
          </span>
          <input name="avatarUrl" defaultValue={values.avatarUrl} className={field} />
        </label>
      </div>

      <label className="block">
        <span className="label mb-3 block">Привязать к кейсу</span>
        <select name="caseId" defaultValue={values.caseId} className={field}>
          <option value="">Без кейса</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
        <label className="block">
          <span className="label mb-3 block">Порядок</span>
          <input name="order" type="number" defaultValue={values.order} className={field} />
        </label>
        <label className="flex items-center gap-3 self-end text-sm">
          <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4" />
          На главной
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
      </div>

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
