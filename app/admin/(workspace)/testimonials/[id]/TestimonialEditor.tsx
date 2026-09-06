'use client';

import { useState, useTransition } from 'react';
import { saveTestimonial, type ActionResult } from '@/app/admin/actions';
import { genderLabel, genders, type Gender } from '@/lib/content/review';

/*
 * The testimonial editor.
 *
 * Everything is typed in by the owner, or arrived through the form on the
 * site and waits here for his approval. There is no generator and never will
 * be: a fabricated quote attributed to a named person is a lie about a real
 * human being. The portrait beside a review is one of two fixed photographs
 * — the man's or the woman's — chosen here, never a client's face.
 */

export type TestimonialValues = {
  id: string;
  name: string;
  company: string;
  role: string;
  text: string;
  rating: number;
  gender: Gender;
  source: string;
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
  const [rating, setRating] = useState(values.rating);
  const [gender, setGender] = useState<Gender>(values.gender);

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
      {values.source === 'site' && (
        <p className="border-l-2 border-ink pl-4 text-sm text-ink-2">
          Оставлен через сайт. Появится на странице, когда вы отметите «Опубликован».
        </p>
      )}

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
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset>
          <legend className="label mb-3">Оценка</legend>
          <input type="hidden" name="rating" value={rating} />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} из 5`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                className={`size-10 text-2xl leading-none transition-colors ${
                  value <= rating ? 'text-ink' : 'text-line-2'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label mb-3 flex items-baseline gap-3">
            Фото рядом
            <span className="text-ink-3 normal-case tracking-normal">одно из двух постоянных</span>
          </legend>
          <input type="hidden" name="gender" value={gender} />
          <div className="flex flex-wrap gap-2">
            {genders.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={gender === value}
                onClick={() => setGender(value)}
                className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors ${
                  gender === value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                }`}
              >
                {genderLabel[value]}
              </button>
            ))}
          </div>
        </fieldset>
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
