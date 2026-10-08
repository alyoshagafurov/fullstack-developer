'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHaptics } from '@/components/mini/telegram';
import { errorText, type useAdminApi } from '@/components/mini/admin/api';
import { AlySplash } from '@/components/mini/AlySplash';
import { reminderLabel, reminderPresets } from '@/lib/content/schedule';

/*
 * The owner's own to-do list, laid out as a calendar.
 *
 * A month grid, lit the same way Money.tsx lights thirteen weeks of income —
 * a dot per day, brighter where more is scheduled. Tapping a day opens it as
 * a 24-hour timeline, day and night, where a task is a block spanning the
 * hours it occupies rather than a line repeated in every hour it touches. A
 * daily chore is the same block with no end date, carrying a small
 * "Ежедневно" mark instead of living in a separate list — one surface for
 * "what fills my day", not two that have to be read together.
 *
 * The whole list is fetched once, like `money`: a freelancer's tasks are at
 * most a few hundred rows, and every view here — the month's density, a
 * day's blocks — is cheap arithmetic over that one array.
 */

type Api = ReturnType<typeof useAdminApi>;

type TaskRow = {
  id: string;
  title: string;
  note: string | null;
  dayFrom: string;
  dayTo: string | null;
  startHour: number;
  endHour: number;
  leadMinutes: number | null;
  active: boolean;
};

type Data = { rows: TaskRow[]; today: string };
type OpLike = { status: string; message?: string };

/* ------------------------------------------------------------- styles -- */

const card = 'rounded-2xl border border-white/12 bg-white/[0.03] p-4';
const label = 'text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase';
const action =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition-opacity disabled:opacity-40';
const solid = `${action} bg-paper text-ink hover:opacity-90`;
const outline = `${action} border border-white/20 text-paper hover:border-paper`;
const field =
  'w-full rounded-xl border border-white/20 bg-[#121212] px-4 py-3 text-base text-paper outline-none placeholder:text-paper/45 focus:border-paper';

/* Same five-step ramp as Money.tsx's Days() heatmap, for the same reason: one
   monochrome vocabulary for "how much is here" across the whole admin. */
const RAMP = ['#454543', '#717170', '#9e9e9a', '#cecec9', '#ffffff'];

/* ------------------------------------------------------------- helpers -- */

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAYS_FULL = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
const MONTHS_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOURS_END = Array.from({ length: 24 }, (_, i) => i + 1);

function addDays(day: string, n: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

/** Whole days between two YYYY-MM-DD strings — for keeping a span's length
    when a quick-pick chip moves its start day. */
function dayDiff(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00.000Z`).getTime();
  const b = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Monday-based weekday, 0–6, same convention as Money.tsx. */
function weekday(day: string): number {
  return (new Date(`${day}T00:00:00.000Z`).getUTCDay() + 6) % 7;
}

function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12;
  return `${ny}-${String(nm + 1).padStart(2, '0')}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS_NOM[m - 1]} ${y}`;
}

/** «Вторник, 6 октября», or with a year once the day is not this one. */
function fullDayLabel(day: string, withYear: boolean): string {
  const [y, m, d] = day.split('-').map(Number);
  const wd = WEEKDAYS_FULL[weekday(day)];
  return `${wd[0].toUpperCase()}${wd.slice(1)}, ${d} ${MONTHS_GEN[m - 1]}${withYear ? ` ${y}` : ''}`;
}

/** «1 задача» / «2 задачи» / «5 задач». */
function pluralTasks(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  const word =
    mod100 >= 11 && mod100 <= 14 ? 'задач' : mod10 === 1 ? 'задача' : mod10 >= 2 && mod10 <= 4 ? 'задачи' : 'задач';
  return `${n} ${word}`;
}

/** Date-only membership — active or not, so a paused task is still findable on its day. */
function withinSpan(task: TaskRow, day: string): boolean {
  return task.dayFrom <= day && (task.dayTo === null || task.dayTo >= day);
}

/* -------------------------------------------------------------- screen -- */

export function Calendar({ api }: { api: Api }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);
  const call = api.call;

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let dropped = false;
    call<Data>('tasks')
      .then((value) => {
        if (!dropped) {
          setData(value);
          setError('');
        }
      })
      .catch((problem) => {
        if (!dropped) setError(errorText(problem));
      });
    return () => {
      dropped = true;
    };
  }, [call, nonce]);

  if (error && !data) return <p className="py-8 text-center text-sm text-paper/70">{error}</p>;
  if (!data) return <AlySplash />;

  return <Board data={data} api={api} onChange={reload} />;
}

type FormState = { mode: 'add' | 'edit'; day: string; hour: number; task: TaskRow | null };

function Board({ data, api, onChange }: { data: Data; api: Api; onChange: () => void }) {
  const { rows, today } = data;
  const haptics = useHaptics();

  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  if (form) {
    return (
      <TaskForm
        api={api}
        today={today}
        initial={form}
        onDone={() => {
          setForm(null);
          onChange();
        }}
        onCancel={() => setForm(null)}
      />
    );
  }

  if (selectedDay) {
    return (
      <DayScreen
        day={selectedDay}
        today={today}
        rows={rows}
        onBack={() => {
          haptics.tap();
          setSelectedDay(null);
        }}
        onPrev={() => setSelectedDay(addDays(selectedDay, -1))}
        onNext={() => setSelectedDay(addDays(selectedDay, 1))}
        onAdd={(hour) => setForm({ mode: 'add', day: selectedDay, hour, task: null })}
        onEdit={(task) => setForm({ mode: 'edit', day: selectedDay, hour: task.startHour, task })}
      />
    );
  }

  return (
    <MonthScreen
      month={month}
      today={today}
      rows={rows}
      onPrevMonth={() => setMonth(addMonths(month, -1))}
      onNextMonth={() => setMonth(addMonths(month, 1))}
      onOpenDay={(day) => {
        haptics.tap();
        setSelectedDay(day);
      }}
      onAdd={() => setForm({ mode: 'add', day: today, hour: 9, task: null })}
    />
  );
}

/* --------------------------------------------------------------- month -- */

function MonthScreen({
  month,
  today,
  rows,
  onPrevMonth,
  onNextMonth,
  onOpenDay,
  onAdd,
}: {
  month: string;
  today: string;
  rows: TaskRow[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenDay: (day: string) => void;
  onAdd: () => void;
}) {
  const haptics = useHaptics();

  const { counts, peak } = useMemo(() => {
    const map = new Map<string, number>();
    const first = `${month}-01`;
    const total = daysInMonth(month);
    for (let i = 0; i < total; i += 1) {
      const day = addDays(first, i);
      const n = rows.filter((t) => t.active && withinSpan(t, day)).length;
      if (n > 0) map.set(day, n);
    }
    return { counts: map, peak: Math.max(1, ...map.values()) };
  }, [rows, month]);

  const step = (v: number) => Math.max(0, Math.min(RAMP.length - 1, Math.ceil((v / peak) * RAMP.length) - 1));

  const first = `${month}-01`;
  const total = daysInMonth(month);
  const lead = weekday(first);
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: total }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            onPrevMonth();
          }}
          aria-label="Предыдущий месяц"
          className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-lg text-paper/60 hover:text-paper"
        >
          ‹
        </button>
        <p className="text-[1.0625rem] font-semibold">{monthLabel(month)}</p>
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            onNextMonth();
          }}
          aria-label="Следующий месяц"
          className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-lg text-paper/60 hover:text-paper"
        >
          ›
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1 text-center text-[0.6875rem] text-paper/45">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} aria-hidden />;
            const n = counts.get(day) ?? 0;
            const isToday = day === today;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onOpenDay(day)}
                aria-label={`${fullDayLabel(day, false)}${n > 0 ? `: ${pluralTasks(n)}` : ''}`}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-sm transition-colors ${
                  isToday ? 'border-paper' : 'border-transparent hover:border-white/15'
                }`}
              >
                <span className={isToday ? 'font-semibold text-paper' : 'text-paper/80'}>
                  {Number(day.slice(8))}
                </span>
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: n > 0 ? RAMP[step(n)] : 'transparent' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          haptics.tap();
          onAdd();
        }}
        className={`${solid} w-full`}
      >
        + Новая задача
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- day -- */

const ROW = 48; // px per hour

function DayScreen({
  day,
  today,
  rows,
  onBack,
  onPrev,
  onNext,
  onAdd,
  onEdit,
}: {
  day: string;
  today: string;
  rows: TaskRow[];
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onAdd: (hour: number) => void;
  onEdit: (task: TaskRow) => void;
}) {
  const haptics = useHaptics();
  const isToday = day === today;

  /* Overlapping tasks get their own lane — greedy interval packing, the same
     idea a calendar app uses, sized small because an owner's own day rarely
     holds more than two or three things at once. */
  const blocks = useMemo(() => {
    const todays = [...rows].filter((t) => withinSpan(t, day)).sort((a, b) => a.startHour - b.startHour);
    const active: { task: TaskRow; lane: number }[] = [];
    const placed: { task: TaskRow; lane: number }[] = [];
    for (const task of todays) {
      for (let i = active.length - 1; i >= 0; i -= 1) {
        if (active[i].task.endHour <= task.startHour) active.splice(i, 1);
      }
      const used = new Set(active.map((a) => a.lane));
      let lane = 0;
      while (used.has(lane)) lane += 1;
      active.push({ task, lane });
      placed.push({ task, lane });
    }
    const laneCount = placed.reduce((max, p) => Math.max(max, p.lane + 1), 1);
    return placed.map((p) => ({ ...p, laneCount }));
  }, [rows, day]);

  /* Which hours already have something in them, so the grid below only
     invites a tap where there is genuinely nothing yet. */
  const occupiedHours = useMemo(() => {
    const set = new Set<number>();
    for (const { task } of blocks) {
      for (let h = task.startHour; h < task.endHour; h += 1) set.add(h);
    }
    return set;
  }, [blocks]);

  const [nowMinute, setNowMinute] = useState<number | null>(null);
  useEffect(() => {
    if (!isToday) {
      setNowMinute(null);
      return;
    }
    const update = () => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dushanbe',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
      const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
      setNowMinute(h * 60 + m);
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [isToday]);

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="text-sm text-paper/55 hover:text-paper">
        ← Месяц
      </button>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            onPrev();
          }}
          aria-label="Предыдущий день"
          className="flex min-h-10 min-w-10 shrink-0 items-center justify-center text-lg text-paper/60 hover:text-paper"
        >
          ‹
        </button>
        <p className="min-w-0 flex-1 text-center text-[0.9375rem] font-semibold">
          {fullDayLabel(day, day.slice(0, 4) !== today.slice(0, 4))}
          {isToday && <span className="ml-2 text-xs font-normal text-paper/55">сегодня</span>}
        </p>
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            onNext();
          }}
          aria-label="Следующий день"
          className="flex min-h-10 min-w-10 shrink-0 items-center justify-center text-lg text-paper/60 hover:text-paper"
        >
          ›
        </button>
      </div>

      {/*
        The headline: what today actually is, read in one glance — the big
        letters this owner asked for. The hour grid below answers "when
        exactly"; this answers "what". A day with nothing yet skips straight
        to the grid, which is itself the invitation to add something.
      */}
      {blocks.length > 0 ? (
        <div className="space-y-2">
          {blocks.map(({ task }) => (
            <button
              key={task.id}
              type="button"
              onClick={() => {
                haptics.tap();
                onEdit(task);
              }}
              className={`block w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                task.active ? 'border-white/12 bg-white/[0.03] hover:border-paper' : 'border-white/8 bg-transparent'
              }`}
            >
              <p
                className={`text-[1.125rem] leading-tight font-bold tracking-[-0.01em] ${
                  task.active ? 'text-paper' : 'text-paper/40'
                }`}
              >
                {task.title}
              </p>
              <p className="tabular mt-1 text-sm text-paper/55">
                {String(task.startHour).padStart(2, '0')}:00–{String(task.endHour % 24).padStart(2, '0')}:00
                {task.dayTo === null && ' · Ежедневно'}
                {!task.active && ' · На паузе'}
              </p>
              {task.note && <p className="mt-1.5 text-sm text-paper/70">{task.note}</p>}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-paper/45">Пока ничего не запланировано — коснитесь часа ниже.</p>
      )}

      <p className={label}>По часам</p>

      <div className="relative" style={{ height: ROW * 24 }}>
        {HOURS.map((h) => (
          <div
            key={h}
            className="group absolute inset-x-0 flex items-start gap-2 border-t border-white/8"
            style={{ top: h * ROW, height: ROW }}
          >
            <span className="w-11 shrink-0 pt-0.5 text-right text-[0.6875rem] text-paper/40">
              {String(h).padStart(2, '0')}:00
            </span>
            <button
              type="button"
              aria-label={`Добавить задачу на ${String(h).padStart(2, '0')}:00`}
              onClick={() => {
                haptics.tap();
                onAdd(h);
              }}
              className="flex h-full flex-1 items-center justify-end pr-2"
            >
              {!occupiedHours.has(h) && (
                <span
                  aria-hidden
                  className="text-base leading-none text-paper/15 transition-colors group-active:text-paper/60"
                >
                  +
                </span>
              )}
            </button>
          </div>
        ))}

        {nowMinute !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 left-11 h-px bg-paper"
            style={{ top: (nowMinute / 60) * ROW }}
          />
        )}

        {blocks.map(({ task, lane, laneCount }) => (
          <button
            key={task.id}
            type="button"
            onClick={() => {
              haptics.tap();
              onEdit(task);
            }}
            aria-label={`${task.title}, с ${task.startHour} до ${task.endHour}${task.active ? '' : ', на паузе'}`}
            className={`absolute overflow-hidden rounded-lg border px-2 py-1 text-left text-xs transition-colors ${
              task.active ? 'border-white/20 bg-white/[0.06] hover:border-paper' : 'border-white/10 bg-transparent text-paper/40'
            }`}
            style={{
              top: task.startHour * ROW + 2,
              height: (task.endHour - task.startHour) * ROW - 4,
              left: `calc(2.75rem + (100% - 2.75rem) / ${laneCount} * ${lane})`,
              width: `calc((100% - 2.75rem) / ${laneCount} - 4px)`,
            }}
          >
            <span className="block truncate font-medium">{task.title}</span>
            {task.dayTo === null && <span className="text-paper/55"> · Ежедневно</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- form -- */

function TaskForm({
  api,
  today,
  initial,
  onDone,
  onCancel,
}: {
  api: Api;
  today: string;
  initial: FormState;
  onDone: () => void;
  onCancel: () => void;
}) {
  const haptics = useHaptics();
  const task = initial.task;

  const [title, setTitle] = useState(task?.title ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const [daily, setDaily] = useState(task ? task.dayTo === null : false);
  const [dayFrom, setDayFrom] = useState(task?.dayFrom ?? initial.day);
  const [dayTo, setDayTo] = useState(task?.dayTo ?? initial.day);
  const [startHour, setStartHour] = useState(task?.startHour ?? initial.hour);
  const [endHour, setEndHour] = useState(task?.endHour ?? Math.min(24, (task?.startHour ?? initial.hour) + 1));
  const [remind, setRemind] = useState(task ? task.leadMinutes !== null : true);
  const [leadMinutes, setLeadMinutes] = useState<number>(task?.leadMinutes ?? 30);

  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  /* A synchronous lock, not just `busy`: two taps fired before React commits
     the disabled state would both pass `disabled={busy || ...}` and both
     reach api.call — this ref is set before any await, so the second tap's
     call to save() sees it immediately, same event loop turn or not. */
  const submitting = useRef(false);

  const chooseStart = (next: number) => {
    setStartHour(next);
    if (endHour <= next) setEndHour(Math.min(24, next + 1));
  };

  /* A single-day task's dayTo silently tracks dayFrom, so picking a quick
     day moves both at once rather than leaving a stale end date behind. */
  const chooseDay = (next: string) => {
    haptics.tap();
    const spanLength = daily ? 0 : Math.max(0, dayDiff(dayFrom, dayTo));
    setDayFrom(next);
    if (!daily) setDayTo(addDays(next, spanLength));
  };

  const save = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setProblem('');
    try {
      const payload = {
        title,
        note,
        dayFrom,
        dayTo: daily ? null : dayTo,
        startHour,
        endHour,
        leadMinutes: remind ? leadMinutes : null,
      };
      const result = await api.call<OpLike>(
        initial.mode === 'add' ? 'task:add' : 'task:update',
        initial.mode === 'add' ? payload : { id: task?.id, ...payload },
      );
      if (result?.status === 'error') {
        haptics.bad();
        setProblem(result.message ?? 'Не получилось.');
      } else {
        haptics.ok();
        onDone();
      }
    } catch (failure) {
      haptics.bad();
      setProblem(errorText(failure));
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  };

  const remove = async () => {
    if (!task) return;
    setBusy(true);
    setProblem('');
    try {
      const result = await api.call<OpLike>('task:delete', { id: task.id });
      if (result?.status === 'error') {
        haptics.bad();
        setProblem(result.message ?? 'Не получилось.');
      } else {
        haptics.ok();
        onDone();
      }
    } catch (failure) {
      haptics.bad();
      setProblem(errorText(failure));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    if (!task) return;
    setBusy(true);
    setProblem('');
    try {
      const result = await api.call<OpLike>('task:toggle', { id: task.id, active: !task.active });
      if (result?.status === 'error') {
        haptics.bad();
        setProblem(result.message ?? 'Не получилось.');
      } else {
        haptics.ok();
        onDone();
      }
    } catch (failure) {
      haptics.bad();
      setProblem(errorText(failure));
    } finally {
      setBusy(false);
    }
  };

  /* A live confirmation of what's about to be saved — he reads this instead
     of re-checking five separate fields before trusting the Save button. */
  const summary = (() => {
    const range = `${String(startHour).padStart(2, '0')}:00–${endHour === 24 ? '24:00' : `${String(endHour).padStart(2, '0')}:00`}`;
    const crossYear = (d: string) => d.slice(0, 4) !== today.slice(0, 4);
    if (daily) return `Каждый день, начиная с ${fullDayLabel(dayFrom, crossYear(dayFrom))} · ${range}`;
    if (dayFrom === dayTo) return `${fullDayLabel(dayFrom, crossYear(dayFrom))} · ${range}`;
    return `С ${fullDayLabel(dayFrom, crossYear(dayFrom) !== crossYear(dayTo))} по ${fullDayLabel(dayTo, crossYear(dayTo))} · ${range}`;
  })();

  return (
    <div className="space-y-6">
      <button type="button" onClick={onCancel} className="text-sm text-paper/55 hover:text-paper">
        ← Назад
      </button>

      <h1 className="text-[clamp(1.25rem,6vw,1.75rem)] font-bold tracking-[-0.02em]">
        {initial.mode === 'add' ? 'Новая задача' : 'Задача'}
      </h1>

      <div className="space-y-5">
        <div>
          <p className={label}>Название</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Что нужно сделать"
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <p className={label}>Заметка</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Необязательно"
            className={`${field} mt-1.5 resize-y`}
          />
        </div>

        <div className={`${card} space-y-4`}>
          <p className={label}>Когда</p>

          <label className="flex items-center gap-2 text-sm text-paper/80">
            <input
              type="checkbox"
              checked={daily}
              onChange={(e) => setDaily(e.target.checked)}
              className="size-5 rounded border-white/30 bg-transparent accent-paper"
            />
            Ежедневно, без даты окончания
          </label>

          <div>
            {/* Quick picks for the two days anyone actually reaches for —
                the date inputs below still open for anything further out. */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => chooseDay(today)}
                className={`min-h-8 rounded-full border px-3 text-xs transition-colors ${
                  dayFrom === today ? 'border-paper bg-paper text-ink' : 'border-white/15 text-paper/60'
                }`}
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => chooseDay(addDays(today, 1))}
                className={`min-h-8 rounded-full border px-3 text-xs transition-colors ${
                  dayFrom === addDays(today, 1) ? 'border-paper bg-paper text-ink' : 'border-white/15 text-paper/60'
                }`}
              >
                Завтра
              </button>
            </div>

            <div className="mt-2 flex items-start gap-2">
              <div className="flex-1">
                <p className={label}>{daily ? 'Начиная с' : 'С какого дня'}</p>
                <input
                  type="date"
                  value={dayFrom}
                  max={daily ? undefined : dayTo}
                  onChange={(e) => setDayFrom(e.target.value)}
                  className={`${field} mt-1.5 [color-scheme:dark]`}
                />
              </div>
              {!daily && (
                <div className="flex-1">
                  <p className={label}>По какой день</p>
                  <input
                    type="date"
                    value={dayTo}
                    min={dayFrom}
                    onChange={(e) => setDayTo(e.target.value)}
                    className={`${field} mt-1.5 [color-scheme:dark]`}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className={label}>Час начала</p>
              <select
                value={startHour}
                onChange={(e) => chooseStart(Number(e.target.value))}
                className={`${field} mt-1.5`}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
            <span aria-hidden className="mt-5 text-paper/30">
              →
            </span>
            <div className="flex-1">
              <p className={label}>Час окончания</p>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className={`${field} mt-1.5`}
              >
                {HOURS_END.filter((h) => h > startHour).map((h) => (
                  <option key={h} value={h}>
                    {h === 24 ? '24:00' : `${String(h).padStart(2, '0')}:00`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="border-t border-white/10 pt-3 text-sm text-paper/60">{summary}</p>
        </div>

        <div className={`${card} space-y-3`}>
          <label className="flex items-center gap-2 text-sm text-paper/80">
            <input
              type="checkbox"
              checked={remind}
              onChange={(e) => setRemind(e.target.checked)}
              className="size-5 rounded border-white/30 bg-transparent accent-paper"
            />
            Напоминание в боте
          </label>

          {remind && (
            <div>
              <p className={label}>Когда прислать</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {reminderPresets.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setLeadMinutes(m);
                    }}
                    className={`min-h-9 rounded-full border px-3 text-sm transition-colors ${
                      leadMinutes === m ? 'border-paper bg-paper text-ink' : 'border-white/15 text-paper/70'
                    }`}
                  >
                    {reminderLabel[m]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button type="button" disabled={busy || !title.trim()} onClick={() => void save()} className={`${solid} w-full`}>
        {busy ? 'Сохраняю…' : 'Сохранить'}
      </button>

      {initial.mode === 'edit' && task && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button type="button" disabled={busy} onClick={() => void toggle()} className={`${outline} flex-1`}>
            {task.active ? 'Поставить на паузу' : 'Включить'}
          </button>
          {confirmDelete ? (
            <span className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove()}
                className="min-h-11 rounded-full bg-paper px-4 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Удалить
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className={outline}>
                Нет
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-11 px-3 text-sm text-paper/60 hover:text-paper"
            >
              Удалить
            </button>
          )}
        </div>
      )}

      {problem && (
        <p role="alert" className="text-center text-sm text-paper/70">
          {problem}
        </p>
      )}
    </div>
  );
}
