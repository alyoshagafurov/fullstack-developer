'use client';

import { useRef, useState } from 'react';
import { genderLabel, genders, type Gender } from '@/lib/content/review';

/*
 * The form a client fills in to leave a review.
 *
 * Four things: name, a few sentences, stars, and which of the two portraits
 * goes beside it. The review is not shown until the owner approves it, and
 * the form says so.
 */

const field =
  'w-full border-b border-line-2 bg-transparent pb-3 text-base outline-none transition-colors focus:border-ink';

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [gender, setGender] = useState<Gender | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setFormError('');
    setErrors({});
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          company: form.get('company') ?? '',
          text: form.get('text'),
          rating,
          gender,
          website: String(form.get('website') ?? ''),
          startedAt: startedAt.current,
        }),
      });
      const payload = (await response.json()) as { error?: string; issues?: Record<string, string> };
      if (!response.ok) {
        if (payload.issues) setErrors(payload.issues);
        setFormError(payload.error ?? 'Не получилось отправить. Попробуйте ещё раз.');
        return;
      }
      setDone(true);
    } catch {
      setFormError('Интернет пропал. Проверьте связь и нажмите ещё раз.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="max-w-md text-lg leading-relaxed">
        Спасибо! Отзыв появится на сайте после проверки.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-xl space-y-9">
      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="label mb-3 block">Ваше имя</span>
          <input name="name" autoComplete="name" className={field} />
          {errors.name && <span className="mt-2 block text-sm">{errors.name}</span>}
        </label>
        <label className="block">
          <span className="label mb-3 flex items-baseline gap-3">
            Компания
            <span className="text-ink-3 normal-case tracking-normal">можно пропустить</span>
          </span>
          <input name="company" autoComplete="organization" className={field} />
        </label>
      </div>

      <label className="block">
        <span className="label mb-3 block">Отзыв</span>
        <textarea name="text" rows={4} className={field} />
        {errors.text && <span className="mt-2 block text-sm">{errors.text}</span>}
      </label>

      <div className="grid gap-8 sm:grid-cols-2">
        <fieldset>
          <legend className="label mb-3">Оценка</legend>
          <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} из 5`}
                aria-pressed={rating === value}
                onMouseEnter={() => setHover(value)}
                onClick={() => setRating(value)}
                className={`size-11 text-2xl leading-none transition-colors ${
                  value <= (hover || rating) ? 'text-ink' : 'text-line-2'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {errors.rating && <span className="mt-2 block text-sm">{errors.rating}</span>}
        </fieldset>

        <fieldset>
          <legend className="label mb-3">Фото рядом с отзывом</legend>
          <div className="flex flex-wrap gap-2">
            {genders.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={gender === value}
                onClick={() => setGender(value)}
                className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition-colors ${
                  gender === value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                }`}
              >
                {genderLabel[value]}
              </button>
            ))}
          </div>
          {errors.gender && <span className="mt-2 block text-sm">{errors.gender}</span>}
        </fieldset>
      </div>

      {/* Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Не заполняйте это поле
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formError && (
        <p role="alert" className="border-l-2 border-ink pl-4 text-sm">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-[0.875rem] font-semibold tracking-[0.02em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
        >
          {sending ? 'Отправляю…' : 'Отправить отзыв'}
          <span aria-hidden>→</span>
        </button>
        <p className="text-xs text-ink-3">Отзыв появится после проверки.</p>
      </div>
    </form>
  );
}
