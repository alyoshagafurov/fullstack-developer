'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Trash2, Upload, X } from 'lucide-react';

import type { CaseDetail } from '@/lib/cases';

/*
 * The case editor.
 *
 * One form for both creating and editing — the shapes are identical, and two
 * near-copies of a twelve-field form is how the two drift apart.
 *
 * Screenshots upload as they are chosen rather than on save. That is the
 * difference between "the form submits and something might happen to your
 * images" and watching each one appear, in order, as it lands. The cost is
 * that an abandoned draft can leave an unused blob, which is a far better
 * failure than a save that silently loses half the gallery.
 *
 * Nothing here decides permissions. The buttons exist because an ADMIN opened
 * the page; the server checks again on every request and is free to refuse.
 */

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const MESSAGES: Record<string, string> = {
  unauthenticated: 'Сессия истекла. Войдите заново.',
  forbidden: 'У вашей роли нет прав на публикацию.',
  slug_taken: 'Такой адрес уже занят другим кейсом.',
  not_found: 'Кейс не найден — возможно, его удалили.',
  storage_unavailable: 'База недоступна — изменения не сохранены.',
  blob_not_configured: 'Хранилище картинок не подключено в Vercel.',
  upload_failed: 'Не удалось загрузить файл.',
  payload_too_large: 'Файл больше 8 МБ.',
  unsupported_media_type: 'Нужен PNG, JPEG, WebP, AVIF или GIF.',
  validation: 'Проверьте заполненные поля.',
  network: 'Нет связи с сервером.',
};

type Feedback = { tone: 'ok' | 'error'; text: string } | null;

/** Empty case, for the "new" route. */
export const BLANK: CaseDetail = {
  id: '', slug: '', title: '', summary: '', description: '',
  technologies: [], liveUrl: '', screenshots: [], cover: '', year: '',
  published: false, position: 0, createdAt: '', updatedAt: '',
};

export default function CaseEditor({ initial }: { initial: CaseDetail }) {
  const router = useRouter();
  const isNew = initial.id === '';
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [summary, setSummary] = useState(initial.summary);
  const [description, setDescription] = useState(initial.description);
  const [tech, setTech] = useState(initial.technologies.join(', '));
  const [liveUrl, setLiveUrl] = useState(initial.liveUrl);
  const [year, setYear] = useState(initial.year);
  const [position, setPosition] = useState(String(initial.position));
  const [published, setPublished] = useState(initial.published);
  const [shots, setShots] = useState<string[]>(initial.screenshots);

  const [busy, setBusy] = useState<'save' | 'upload' | 'delete' | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function say(code: string) {
    setFeedback({ tone: 'error', text: MESSAGES[code] ?? 'Не удалось сохранить.' });
  }

  /* ── Screenshots ──────────────────────────────────────────────────── */

  async function upload(files: FileList) {
    setBusy('upload');
    setFeedback(null);
    const added: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_UPLOAD_BYTES) {
        say('payload_too_large');
        continue;
      }
      const body = new FormData();
      body.append('file', file);
      try {
        const response = await fetch('/api/admin/uploads', { method: 'POST', body });
        const json = await response.json().catch(() => null);
        if (!response.ok || !json?.ok) {
          say(String(json?.error ?? 'upload_failed'));
          continue;
        }
        added.push(json.url as string);
      } catch {
        say('network');
      }
    }

    if (added.length > 0) {
      setShots((current) => [...current, ...added]);
      setFeedback({ tone: 'ok', text: `Загружено: ${added.length}` });
    }
    setBusy(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  function move(index: number, delta: number) {
    setShots((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeShot(index: number) {
    setShots((current) => current.filter((_, i) => i !== index));
  }

  /* ── Save ─────────────────────────────────────────────────────────── */

  async function save() {
    setBusy('save');
    setFeedback(null);
    setFieldErrors({});

    const payload = {
      title,
      slug,
      summary,
      description,
      // A comma-separated field is what an owner actually wants to type; the
      // array is the server's shape, not theirs.
      technologies: tech.split(',').map((t) => t.trim()).filter(Boolean),
      liveUrl,
      screenshots: shots,
      year,
      published,
      position: Number(position) || 0,
    };

    const url = isNew ? '/api/admin/cases' : `/api/admin/cases/${initial.id}`;

    try {
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.ok) {
        if (json?.fieldErrors) setFieldErrors(json.fieldErrors);
        say(String(json?.error ?? 'error'));
        setBusy(null);
        return;
      }

      setFeedback({ tone: 'ok', text: 'Сохранено' });
      setBusy(null);
      if (isNew) router.replace(`/admin/cases/${json.id}`);
      router.refresh();
    } catch {
      say('network');
      setBusy(null);
    }
  }

  async function destroy() {
    if (!window.confirm('Удалить кейс безвозвратно?')) return;
    setBusy('delete');
    try {
      const response = await fetch(`/api/admin/cases/${initial.id}`, { method: 'DELETE' });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        say(String(json?.error ?? 'error'));
        setBusy(null);
        return;
      }
      router.replace('/admin/cases');
      router.refresh();
    } catch {
      say('network');
      setBusy(null);
    }
  }

  const disabled = busy !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      {/* ── The writing ────────────────────────────────────────────── */}
      <div className="a-panel">
        <div className="a-panel-head">
          <h2 className="a-panel-title">{isNew ? 'Новый кейс' : 'Кейс'}</h2>
        </div>

        <div className="grid gap-5 p-6 pt-0">
          <Field label="Заголовок" error={fieldErrors.title}>
            <input
              className="a-field" value={title} disabled={disabled} maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field
            label="Адрес (slug)"
            hint="Пусто — соберётся из заголовка. После публикации менять не стоит: ломаются ссылки."
            error={fieldErrors.slug}
          >
            <input
              className="a-field" value={slug} disabled={disabled} maxLength={60}
              placeholder="my-project"
              onChange={(e) => setSlug(e.target.value)}
            />
          </Field>

          <Field label="Краткое описание" hint="Одна строка под заголовком в списке.">
            <input
              className="a-field" value={summary} disabled={disabled} maxLength={240}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Field>

          <Field label="Описание" hint="Пустая строка разделяет абзацы.">
            <textarea
              className="a-field" value={description} disabled={disabled} rows={10}
              maxLength={20000}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Технологии" hint="Через запятую: Next.js, PostgreSQL, Django">
            <input
              className="a-field" value={tech} disabled={disabled}
              onChange={(e) => setTech(e.target.value)}
            />
          </Field>

          <Field label="Ссылка на сайт" hint="Полный адрес, с http:// или https://">
            <input
              className="a-field" value={liveUrl} disabled={disabled} maxLength={500}
              placeholder="https://example.com" inputMode="url"
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* ── Screenshots and publishing ─────────────────────────────── */}
      <div className="grid gap-6">
        <div className="a-panel">
          <div className="a-panel-head">
            <h2 className="a-panel-title">Скриншоты</h2>
          </div>
          <div className="p-6 pt-0">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              multiple
              className="sr-only"
              id="case-shots"
              disabled={disabled}
              onChange={(e) => e.target.files?.length && upload(e.target.files)}
            />
            <label
              htmlFor="case-shots"
              className="a-btn w-full justify-center cursor-pointer"
              data-variant="solid"
            >
              <Upload size={14} aria-hidden />
              {busy === 'upload' ? 'Загружаем…' : 'Добавить файлы'}
            </label>
            <p className="mt-3 mb-0 text-[12px] text-ink-3">
              PNG, JPEG, WebP, AVIF или GIF. До 8 МБ каждый. Первый в списке — обложка.
            </p>

            {shots.length > 0 && (
              <ul className="mt-4 grid list-none gap-2 p-0">
                {shots.map((src, index) => (
                  <li
                    key={src}
                    className="flex items-center gap-2 rounded-[10px] border border-line p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src} alt=""
                      className="h-12 w-20 shrink-0 rounded-[6px] object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-ink-3">
                      {index === 0 ? 'Обложка' : `Экран ${index + 1}`}
                    </span>
                    <IconButton
                      label="Выше" disabled={index === 0 || disabled}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton
                      label="Ниже" disabled={index === shots.length - 1 || disabled}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={14} />
                    </IconButton>
                    <IconButton label="Убрать" disabled={disabled} onClick={() => removeShot(index)}>
                      <X size={14} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="a-panel">
          <div className="a-panel-head">
            <h2 className="a-panel-title">Публикация</h2>
          </div>
          <div className="grid gap-5 p-6 pt-0">
            <label className="flex items-center gap-3 text-[14px] text-ink">
              <input
                type="checkbox" checked={published} disabled={disabled}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Опубликован на сайте
            </label>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Год">
                <input
                  className="a-field" value={year} disabled={disabled} maxLength={12}
                  placeholder="2026" onChange={(e) => setYear(e.target.value)}
                />
              </Field>
              <Field label="Порядок" hint="Меньше — выше.">
                <input
                  className="a-field" value={position} disabled={disabled}
                  inputMode="numeric" onChange={(e) => setPosition(e.target.value)}
                />
              </Field>
            </div>

            <button
              type="button" className="a-btn w-full justify-center" data-variant="solid"
              disabled={disabled} onClick={save}
            >
              {busy === 'save' ? 'Сохраняем…' : 'Сохранить'}
            </button>

            {!isNew && (
              <button
                type="button" className="a-btn w-full justify-center"
                disabled={disabled} onClick={destroy}
              >
                <Trash2 size={14} aria-hidden />
                {busy === 'delete' ? 'Удаляем…' : 'Удалить кейс'}
              </button>
            )}

            {feedback && (
              <p
                className="a-note m-0"
                data-tone={feedback.tone === 'error' ? 'error' : undefined}
                role={feedback.tone === 'error' ? 'alert' : 'status'}
              >
                {feedback.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, hint, error, children,
}: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="a-label">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-[12px] text-ink-3">{hint}</span>}
      {error && (
        <span className="mt-2 block text-[12px] text-ink" role="alert">
          Обязательное поле
        </span>
      )}
    </label>
  );
}

function IconButton({
  label, disabled, onClick, children,
}: {
  label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-line
                 text-ink-2 transition-colors hover:border-line-2 hover:text-ink
                 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
