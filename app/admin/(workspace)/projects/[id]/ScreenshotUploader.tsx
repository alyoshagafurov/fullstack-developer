'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

/*
 * Files for a case: pick them or drop them on the box.
 *
 * Each file goes straight from the browser to Vercel Blob; what the form
 * submits is the resulting URL, exactly what the text field used to carry — so
 * the save action did not change. Two shapes of the same thing live here: a
 * list, for screenshots, and a single slot, for the client's mark.
 */

/** One file to Blob, under `cases/`, which is the only prefix the route allows. */
async function toBlob(file: File) {
  const safe = file.name.replace(/[^\w.-]+/g, '-').toLowerCase();
  const blob = await upload(`cases/${safe}`, file, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
  });
  return blob.url;
}

/*
 * A missing store is the one failure worth naming precisely: it is not the
 * owner's mistake, it is a setting in Vercel, and the message says where.
 */
function friendly(cause: unknown) {
  const message = String((cause as Error)?.message ?? '');
  return /token|Blob|хранилище/i.test(message)
    ? 'Хранилище не подключено: Vercel → Storage → Blob → Connect to project'
    : `Не удалось загрузить: ${message}`;
}

const box = 'flex flex-col items-start gap-3 border border-dashed p-5 text-sm transition-colors';
const pick =
  'inline-flex min-h-10 items-center rounded-full border border-ink px-4 text-xs font-medium tracking-[0.04em] disabled:opacity-40';

export function ScreenshotUploader({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const input = useRef<HTMLInputElement>(null);

  async function add(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) return;
    setBusy(true);
    setError('');
    try {
      for (const file of images) {
        const url = await toBlob(file);
        setUrls((current) => [...current, url]);
      }
    } catch (cause) {
      setError(friendly(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="screenshots" value={urls.join('\n')} />

      {urls.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="group relative aspect-[16/10] overflow-hidden bg-shelf"
            >
              {/* Plain img on purpose: an admin preview of an arbitrary URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setUrls((current) => current.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 inline-flex min-h-8 items-center rounded-full bg-ink px-3 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                Убрать
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          if (event.dataTransfer.files.length) void add(event.dataTransfer.files);
        }}
        className={`${box} ${over ? 'border-ink bg-shelf' : 'border-line-2'}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className={pick}>
            {busy ? 'Загружаю…' : 'Выбрать файлы'}
          </button>
          <span className="text-ink-3">или перетащите картинки сюда</span>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) void add(event.target.files);
            event.target.value = '';
          }}
        />
        <div className="flex w-full gap-2">
          <input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="или путь /cases/shot-1.webp"
            className="w-full border-b border-line bg-transparent pb-1 text-sm outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={() => {
              const value = manual.trim();
              if (value) setUrls((current) => [...current, value]);
              setManual('');
            }}
            className="shrink-0 text-xs text-ink-2 underline-offset-4 hover:underline"
          >
            Добавить
          </button>
        </div>
        {error && (
          <p role="alert" className="text-xs text-ink">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/*
 * The client's mark: one file, replaced rather than appended.
 *
 * It is checkered behind the preview because these arrive as transparent PNGs
 * as often as not, and a white mark on a white card looks like a failed upload
 * when it is in fact a correct one.
 */
export function LogoUploader({ initial, name }: { initial: string; name: string }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  async function take(files: FileList | File[]) {
    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setUrl(await toBlob(file));
    } catch (cause) {
      setError(friendly(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          if (event.dataTransfer.files.length) void take(event.dataTransfer.files);
        }}
        className={`${box} ${over ? 'border-ink bg-shelf' : 'border-line-2'}`}
      >
        {url && (
          <div
            className="flex h-24 w-full items-center justify-center overflow-hidden rounded-sm"
            style={{
              backgroundImage:
                'linear-gradient(45deg,#eceae8 25%,transparent 25%,transparent 75%,#eceae8 75%),linear-gradient(45deg,#eceae8 25%,transparent 25%,transparent 75%,#eceae8 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 8px 8px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="max-h-20 max-w-[70%] object-contain" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className={pick}>
            {busy ? 'Загружаю…' : url ? 'Заменить' : 'Выбрать файл'}
          </button>
          {url ? (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="text-xs text-ink-2 underline-offset-4 hover:underline"
            >
              Убрать
            </button>
          ) : (
            <span className="text-ink-3">или перетащите картинку сюда</span>
          )}
        </div>

        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(event) => {
            if (event.target.files) void take(event.target.files);
            event.target.value = '';
          }}
        />

        {error && (
          <p role="alert" className="text-xs text-ink">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
