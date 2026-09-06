import Image from 'next/image';
import Link from 'next/link';
import type { TestimonialRow } from '@/lib/cases';
import { avatarFile, type Gender } from '@/lib/content/review';

/*
 * One review, the way the owner pinned it: a pale circle in the corner, a
 * quotation mark in a black disc, a small label, the words set bold, then the
 * stars and who said it.
 *
 * The photograph beside the name is one of two fixed portraits the owner
 * chose — the man's or the woman's — and never a real client's face. Until
 * those two files exist the card draws a monogram from the initials.
 */

export function Stars({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`Оценка ${filled} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden className={`text-base leading-none ${i < filled ? 'text-ink' : 'text-line-2'}`}>
          ★
        </span>
      ))}
    </span>
  );
}

function Avatar({ name, gender }: { name: string; gender: Gender | null }) {
  const file = gender ? avatarFile[gender] : null;
  if (file) {
    return (
      <Image
        src={file}
        alt=""
        width={96}
        height={96}
        className="size-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      aria-hidden
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-shelf text-xs tracking-[0.06em] text-ink-2"
    >
      {initials}
    </span>
  );
}

export function ReviewCard({ voice }: { voice: TestimonialRow }) {
  const who = [voice.role, voice.company].filter(Boolean).join(', ');
  return (
    <article className="relative flex h-full flex-col overflow-hidden bg-paper p-8 md:p-10">
      <span aria-hidden className="absolute -top-28 -left-28 size-80 rounded-full bg-shelf" />

      <div className="relative flex flex-1 flex-col">
        <span
          aria-hidden
          className="inline-flex size-12 items-center justify-center rounded-full bg-ink pt-3 font-serif text-[2.75rem] leading-none text-paper"
        >
          ”
        </span>

        <p className="label mt-7">Что говорят клиенты</p>

        <blockquote className="mt-4 text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-snug font-semibold tracking-[-0.015em]">
          {voice.text}
        </blockquote>

        {voice.rating ? (
          <div className="mt-5">
            <Stars value={voice.rating} />
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-8">
          <Avatar name={voice.name} gender={voice.gender} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{voice.name}</p>
            {who && <p className="text-xs text-ink-3">{who}</p>}
          </div>
          {voice.caseSlug && (
            <Link
              href={`/work/${voice.caseSlug}`}
              className="label ml-auto inline-flex min-h-11 items-center transition-colors hover:text-ink"
            >
              Кейс
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
