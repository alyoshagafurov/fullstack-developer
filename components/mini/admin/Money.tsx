'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { currencies, money, type Currency } from '@/lib/content/finance';
import { useHaptics } from '@/components/mini/telegram';
import { errorText, type useAdminApi } from '@/components/mini/admin/api';
import { AlySplash } from '@/components/mini/AlySplash';

/*
 * The owner's money, kept by hand.
 *
 * He asked for three things: to write down what he earned and when, in
 * somoni, dollars or roubles, with a note on where it came from; to see it all
 * as one total in whichever of the three he picks, converted at today's rate;
 * and for it to be pleasant to look at, with charts that are not the usual ones.
 *
 * Two filters sit at the top and scope the hero figure, the currency split and
 * the list of entries below them: a period — this week, this month, this year,
 * a custom range, or everything — and the currency to read the total in. The
 * default period is "Всё время", because the number he opens this screen to
 * check first is usually "how much have I made, overall", not a figure that
 * quietly resets every time he looks.
 *
 * "Неделя" / "Месяц" / "Год" are the CURRENT week, month and year — the fast
 * path for "how am I doing right now". Any other single period, or a span
 * across several months ("от сентября до октября"), goes through "Диапазон",
 * two date pickers of the same kind the add-income form already uses.
 *
 * The two trend charts below are deliberately NOT scoped by the period filter.
 * They answer a different question — "what does my income look like lately" —
 * from the hero figure's "how much in the period I picked", and scoping a
 * twelve-month trend to one selected week would leave eleven empty bars with
 * nothing to show. Their titles say "последние", "the last", so the two
 * never read as disagreeing about the same number.
 *
 * The charts are monochrome, like the site. The months chart is the honest
 * form — a stem and a dot, read precisely by where the dot sits. The days
 * chart is the unusual one: the last thirteen weeks as a field of dots, one
 * per day, lit by how much came in that day. It is the same point cloud every
 * page of the site ends on, drawn from his own money.
 *
 * Everything a chart shows can also be read without it: the list at the
 * bottom is the table view, filtered to the same period as the hero figure,
 * and every mark answers a tap or keyboard focus with its value in the
 * readout line above its own chart.
 */

type Api = ReturnType<typeof useAdminApi>;

type Row = { id: string; amount: number; currency: Currency; day: string; note: string | null };
type Data = {
  rows: Row[];
  rates: { perUsd: Record<Currency, number>; updatedAt: string } | null;
  today: string;
};

const NAMES: Record<Currency, string> = { TJS: 'Сомони', USD: 'Доллар', RUB: 'Рубль' };
/** In the order he names them — сомони, доллар, рубль — not the order they are stored in. */
const ORDER: Currency[] = ['TJS', 'USD', 'RUB'];
const STORE = 'aly-money-currency';

/*
 * Five steps from dim to white for the day field, validated against this black
 * (#050505): monotone in lightness, every step visibly apart, and the dimmest
 * still clear of the surface at 2.1:1. A day with nothing is a hairline ring,
 * which is decoration rather than data — the list says the same thing in words.
 */
const RAMP = ['#454543', '#717170', '#9e9e9a', '#cecec9', '#ffffff'];
const PAST = '#8f8f8b'; // a month that is not this one: 6.3:1 on the surface
const NOW = '#ffffff';

/* ------------------------------------------------------------- helpers -- */

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_FULL = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];
const MONTHS_IN = [
  'январе', 'феврале', 'марте', 'апреле', 'мае', 'июне',
  'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре',
];
/** Genitive — "1 сентября", not the nominative MONTHS_FULL uses for a bare month name. */
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** «2026-10-06» → «6 окт». Days are UTC calendar days throughout; see income.ts. */
function dayLabel(day: string): string {
  const [, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** «2026-10-06» → «6 окт 2026», for a line that may cross years. */
function shortDate(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** «2026-10-06» → «6 октября» or «6 октября 2026» — the grammatical form a sentence needs. */
function fullDayLabel(day: string, withYear: boolean): string {
  const [y, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS_GEN[m - 1]}${withYear ? ` ${y}` : ''}`;
}

function addDays(day: string, n: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

/** Monday-based weekday, 0–6, because his week starts on Monday. */
function weekday(day: string): number {
  return (new Date(`${day}T00:00:00.000Z`).getUTCDay() + 6) % 7;
}

/** A clean round number at or above `v`, for the one axis tick. */
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/** «$», «сомони», «₽» — the unit alone, as money() would write it. */
const unit = (c: Currency) => money(0, c).replace(/^0\s*/, '');

/** «1 запись» / «2 записи» / «5 записей» — standard Russian pluralisation. */
function pluralRecords(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  const word =
    mod100 >= 11 && mod100 <= 14 ? 'записей' : mod10 === 1 ? 'запись' : mod10 >= 2 && mod10 <= 4 ? 'записи' : 'записей';
  return `${n} ${word}`;
}

function earliestDay(rows: Row[]): string | null {
  if (rows.length === 0) return null;
  return rows.reduce((min, r) => (r.day < min ? r.day : min), rows[0].day);
}

/* ------------------------------------------------------------ period -- */

/*
 * Deliberately its own type, not imported from lib/content/finance.ts. That
 * file's `PeriodId` shares three of these names — 'week' | 'month' | 'year' |
 * 'all' — but means something different by them: a rolling window (the last 7
 * / 30 / 365 days, counted from `days: N`). What the owner asked for here is
 * calendar-aligned — THIS week, Monday to Sunday; THIS month; THIS year —
 * plus a fifth choice neither list has, an arbitrary range. Reusing that type
 * would either misreport the window or need its own exception carved into a
 * module that has nothing to do with this screen. The Russian labels match on
 * purpose, for one voice across the admin; the meaning behind them does not.
 */
type PeriodId = 'all' | 'week' | 'month' | 'year' | 'range';

const PERIOD_PRESETS: { id: PeriodId; label: string }[] = [
  { id: 'all', label: 'Всё время' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'year', label: 'Год' },
  { id: 'range', label: 'Диапазон' },
];

type PeriodInfo = {
  id: PeriodId;
  /** Inclusive day bounds. Null on either side means "no limit that side". */
  from: string | null;
  to: string | null;
  heroLabel: string;
  splitTitle: string;
  /** Null when there is no natural "the one before this" — "Всё время", a custom range. */
  compareLabel: string | null;
  compareFrom: string | null;
  compareTo: string | null;
};

/** «с 1 сентября по 6 октября 2026», or «по 6 октября 2026» with an open start. */
function rangeLabel(from: string | null, to: string): string {
  if (!from) return `по ${fullDayLabel(to, true)}`;
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return `с ${fullDayLabel(from, !sameYear)} по ${fullDayLabel(to, true)}`;
}

function computePeriod(id: PeriodId, today: string, rangeFrom: string, rangeTo: string): PeriodInfo {
  if (id === 'week') {
    const start = addDays(today, -weekday(today));
    const end = addDays(start, 6);
    return {
      id,
      from: start,
      to: end,
      heroLabel: 'Заработано на этой неделе',
      splitTitle: 'В чём платили на этой неделе',
      compareLabel: 'на прошлой неделе',
      compareFrom: addDays(start, -7),
      compareTo: addDays(end, -7),
    };
  }

  if (id === 'month') {
    const [y, m] = today.split('-').map(Number);
    const start = `${today.slice(0, 7)}-01`;
    const nextStart = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const idx = m - 1;
    const prevIdx = (idx + 11) % 12;
    const prevYear = idx === 0 ? y - 1 : y;
    const prevStart = `${prevYear}-${String(prevIdx + 1).padStart(2, '0')}-01`;
    const prevNextStart =
      prevIdx === 11 ? `${prevYear + 1}-01-01` : `${prevYear}-${String(prevIdx + 2).padStart(2, '0')}-01`;
    return {
      id,
      from: start,
      to: addDays(nextStart, -1),
      heroLabel: `Заработано в ${MONTHS_IN[idx]}`,
      splitTitle: `В чём платили в ${MONTHS_IN[idx]}`,
      compareLabel: `в ${MONTHS_IN[prevIdx]}`,
      compareFrom: prevStart,
      compareTo: addDays(prevNextStart, -1),
    };
  }

  if (id === 'year') {
    const y = today.slice(0, 4);
    const py = String(Number(y) - 1);
    return {
      id,
      from: `${y}-01-01`,
      to: `${y}-12-31`,
      heroLabel: `Заработано за ${y} год`,
      splitTitle: `В чём платили за ${y} год`,
      compareLabel: `за ${py} год`,
      compareFrom: `${py}-01-01`,
      compareTo: `${py}-12-31`,
    };
  }

  if (id === 'range') {
    const a = rangeFrom || null;
    const b = rangeTo || today;
    const [from, to] = a && a > b ? [b, a] : [a, b];
    const label = rangeLabel(from, to);
    return {
      id,
      from,
      to,
      heroLabel: `Заработано ${label}`,
      splitTitle: `В чём платили ${label}`,
      compareLabel: null,
      compareFrom: null,
      compareTo: null,
    };
  }

  return {
    id: 'all',
    from: null,
    to: null,
    heroLabel: 'Всего заработано',
    splitTitle: 'В чём платили, за всё время',
    compareLabel: null,
    compareFrom: null,
    compareTo: null,
  };
}

/* -------------------------------------------------------------- screen -- */

export function Money({ api }: { api: Api }) {
  const haptics = useHaptics();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);
  const [adding, setAdding] = useState(false);

  /*
   * `api` is a fresh object on every render; `api.call` is the stable part.
   * Depending on the object would refetch on every render, forever.
   */
  const call = api.call;

  /* Which currency he reads totals in. A per-viewer preference, nothing more. */
  const [view, setView] = useState<Currency>('TJS');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved && (currencies as readonly string[]).includes(saved)) setView(saved as Currency);
    } catch {
      /* private mode, blocked storage: somoni it is */
    }
  }, []);
  const pick = (c: Currency) => {
    haptics.tap();
    setView(c);
    try {
      localStorage.setItem(STORE, c);
    } catch {
      /* ignore */
    }
  };

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let dropped = false;
    call<Data>('money')
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

  return (
    <Ledger
      data={data}
      view={data.rates ? view : null}
      onPick={pick}
      adding={adding}
      setAdding={setAdding}
      api={api}
      onChange={reload}
    />
  );
}

/* -------------------------------------------------------------- ledger -- */

function Ledger({
  data,
  view,
  onPick,
  adding,
  setAdding,
  api,
  onChange,
}: {
  data: Data;
  /** Null when there is no rate today: then nothing is converted at all. */
  view: Currency | null;
  onPick: (c: Currency) => void;
  adding: boolean;
  setAdding: (v: boolean) => void;
  api: Api;
  onChange: () => void;
}) {
  const haptics = useHaptics();
  const { rows, rates, today } = data;

  /* The period filter. Resets to "Всё время" on every visit, on purpose — see
     the file header for why it is never remembered across sessions. */
  const [periodId, setPeriodId] = useState<PeriodId>('all');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const choosePeriod = (id: PeriodId) => {
    haptics.tap();
    setPeriodId(id);
    if (id === 'range' && !rangeFrom && !rangeTo) {
      // First time he opens the range picker: a sensible span to start from,
      // rather than two empty boxes he has to fill before seeing anything.
      setRangeFrom(earliestDay(rows) ?? addDays(today, -30));
      setRangeTo(today);
    }
  };

  const period = useMemo(
    () => computePeriod(periodId, today, rangeFrom, rangeTo),
    [periodId, today, rangeFrom, rangeTo],
  );

  /** An amount in the currency being read. */
  const convert = useCallback(
    (amount: number, from: Currency) =>
      rates && view ? (amount / rates.perUsd[from]) * rates.perUsd[view] : amount,
    [rates, view],
  );

  /* A total (and per-currency breakdown, and a count) for a day range. */
  const sum = (from: string | null, to: string | null) => {
    const per: Record<Currency, number> = { TJS: 0, USD: 0, RUB: 0 };
    let total = 0;
    let count = 0;
    for (const r of rows) {
      if (from && r.day < from) continue;
      if (to && r.day > to) continue;
      per[r.currency] += r.amount;
      total += convert(r.amount, r.currency);
      count += 1;
    }
    return { total, per, count };
  };

  const heroSum = sum(period.from, period.to);
  const compareSum = period.compareFrom ? sum(period.compareFrom, period.compareTo) : null;
  const earliest = period.id === 'all' ? earliestDay(rows) : null;

  /** Without a rate, one total would be a guess, so each currency stands alone. */
  const show = (s: { total: number; per: Record<Currency, number> }) =>
    view
      ? money(s.total, view)
      : ORDER
          .filter((c) => s.per[c] > 0)
          .map((c) => money(s.per[c], c))
          .join(' + ') || '0';

  /* Everything below the hero reads only the rows the period filter allows —
     the figure, the currency split and the list all agree, because they all
     come from the same bounds. */
  const filteredRows = useMemo(
    () => rows.filter((r) => (!period.from || r.day >= period.from) && (!period.to || r.day <= period.to)),
    [rows, period.from, period.to],
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {/* Period: the primary filter — which window of time. Date range first,
            per the usual rule: it is the filter every reader reaches for. */}
        <div>
          {/* `relative` is scoped to the chip row alone, not to this whole
              block — the fade below is positioned against ITS height, and
              sizing it to the block would stretch the fade down over the
              date pickers too once "Диапазон" opens them underneath. */}
          <div className="relative">
            <div
              role="radiogroup"
              aria-label="Период"
              /*
               * The screen's own side padding already keeps content off the
               * bezel (MiniStage / Shell wrap this in px-4/px-5). Pulling
               * that back out with -mx and re-adding it on the scroller is
               * what cut "Диапазон" off under the viewport edge on a 375px
               * phone: the chip row needs the SAME edge the rest of the
               * screen has, not an extra one of its own, and a plain
               * overflow-x-auto respects it.
               */
              className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {PERIOD_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={periodId === p.id}
                  onClick={() => choosePeriod(p.id)}
                  className={`min-h-9 shrink-0 rounded-full px-3.5 text-sm transition-colors ${
                    periodId === p.id ? 'bg-paper font-semibold text-ink' : 'border border-white/15 text-paper/70'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* The only hint that "Диапазон" sits past the fold on a narrow
                phone: a fade standing in for a scrollbar, exactly where the
                screenshot that caught this showed a chip sliced clean by the
                edge with nothing saying there was more to find. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-void to-transparent"
            />
          </div>

          {periodId === 'range' && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={rangeFrom}
                max={rangeTo || today}
                onChange={(event) => setRangeFrom(event.target.value)}
                aria-label="С какого дня"
                className="min-h-9 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-3 text-sm text-paper [color-scheme:dark]"
              />
              <span aria-hidden className="text-paper/40">
                —
              </span>
              <input
                type="date"
                value={rangeTo}
                min={rangeFrom || undefined}
                max={today}
                onChange={(event) => setRangeTo(event.target.value)}
                aria-label="По какой день"
                className="min-h-9 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-3 text-sm text-paper [color-scheme:dark]"
              />
            </div>
          )}
        </div>

        {/* Currency: which unit to read every figure in. */}
        <div role="radiogroup" aria-label="Валюта итогов" className="flex gap-1.5">
          {ORDER.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={view === c}
              disabled={!rates}
              onClick={() => onPick(c)}
              className={`min-h-10 flex-1 rounded-full text-sm transition-colors disabled:opacity-40 ${
                view === c ? 'bg-paper font-semibold text-ink' : 'border border-white/15 text-paper/70'
              }`}
            >
              {NAMES[c]}
            </button>
          ))}
        </div>
      </div>

      {/* The hero: one number, for the period picked above. Proportional
          figures at this size — tabular-nums is for columns, not a headline. */}
      <section>
        <p className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">{period.heroLabel}</p>
        {view ? (
          <p className="mt-2 text-[clamp(2.75rem,15vw,4rem)] leading-none font-bold tracking-[-0.04em]">
            {Math.round(heroSum.total).toLocaleString('ru-RU')}
            <span className="ml-2 text-[0.4em] font-semibold tracking-normal text-paper/60">
              {unit(view)}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">{show(heroSum)}</p>
        )}
        <p className="mt-3 text-sm text-paper/60">
          {period.compareLabel && compareSum ? (
            <>
              {period.compareLabel} — {show(compareSum)}
            </>
          ) : (
            <>
              {pluralRecords(heroSum.count)}
              {earliest && <span className="text-paper/40"> · записи с {shortDate(earliest)}</span>}
            </>
          )}
        </p>
      </section>

      {adding ? (
        <AddForm
          today={today}
          api={api}
          onDone={(saved) => {
            setAdding(false);
            if (saved) onChange();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-paper text-[0.9375rem] font-semibold text-ink active:scale-[0.98]"
        >
          <span aria-hidden className="text-xl leading-none">
            +
          </span>
          Записать доход
        </button>
      )}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm leading-relaxed text-paper/60">
          Пока пусто. Запишите первый доход — графики появятся сами.
        </p>
      ) : (
        <>
          {/* Recent trend, always — independent of the period filter above. */}
          {view && <Months rows={rows} today={today} convert={convert} view={view} />}
          {view && <Days rows={rows} today={today} convert={convert} view={view} />}
          {/* Scoped to the picked period, like the hero figure. */}
          {view && <Split rows={filteredRows} convert={convert} view={view} title={period.splitTitle} />}
          <Entries rows={filteredRows} api={api} onChange={onChange} />
        </>
      )}

      {rates ? (
        <p className="text-center text-xs leading-relaxed text-paper/60">
          Курс на {dayLabel(rates.updatedAt.slice(0, 10))}: 1 $ ={' '}
          {rates.perUsd.TJS.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} сомони ={' '}
          {rates.perUsd.RUB.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          <br />
          <a
            href="https://www.exchangerate-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Rates By Exchange Rate API
          </a>
        </p>
      ) : (
        <p className="text-center text-xs leading-relaxed text-paper/60">
          Курс сейчас недоступен, поэтому суммы показаны по валютам отдельно — без пересчёта.
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- add income -- */

function AddForm({
  today,
  api,
  onDone,
}: {
  today: string;
  api: Api;
  onDone: (saved: boolean) => void;
}) {
  const haptics = useHaptics();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('TJS');
  const [day, setDay] = useState(today);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  const field =
    'w-full rounded-xl border border-white/20 bg-[#121212] px-4 py-3 text-base text-paper outline-none placeholder:text-paper/45 focus:border-paper';
  const yesterday = addDays(today, -1);
  const pill = (on: boolean) =>
    `min-h-10 rounded-full text-sm transition-colors ${
      on ? 'bg-paper font-semibold text-ink' : 'border border-white/15 text-paper/70'
    }`;

  const save = async () => {
    setBusy(true);
    setProblem('');
    try {
      const result = await api.call<{ status: string; message?: string }>('income:add', {
        amount,
        currency,
        day,
        note,
      });
      if (result?.status === 'error') {
        haptics.bad();
        setProblem(result.message ?? 'Не получилось.');
        return;
      }
      haptics.ok();
      onDone(true);
    } catch (failure) {
      haptics.bad();
      setProblem(errorText(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="space-y-4 rounded-2xl border border-white/15 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label className="block">
        <span className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">Сколько</span>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          autoFocus
          placeholder="1 500"
          className={`${field} mt-2 text-2xl font-semibold`}
        />
      </label>

      <div role="radiogroup" aria-label="Валюта" className="flex gap-1.5">
        {ORDER.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={currency === c}
            onClick={() => setCurrency(c)}
            className={`${pill(currency === c)} flex-1`}
          >
            {NAMES[c]}
          </button>
        ))}
      </div>

      <div>
        <span className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">Когда</span>
        <div className="mt-2 flex gap-1.5">
          <button type="button" onClick={() => setDay(today)} className={`${pill(day === today)} px-4`}>
            Сегодня
          </button>
          <button type="button" onClick={() => setDay(yesterday)} className={`${pill(day === yesterday)} px-4`}>
            Вчера
          </button>
          {/* Any other day: the phone's own date picker, nothing to learn. */}
          <input
            type="date"
            value={day}
            max={today}
            onChange={(event) => setDay(event.target.value || today)}
            aria-label="Другая дата"
            className="min-h-10 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-3 text-sm text-paper [color-scheme:dark]"
          />
        </div>
      </div>

      <label className="block">
        <span className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">Откуда</span>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={300}
          placeholder="Лендинг для кафе, предоплата"
          className={`${field} mt-2`}
        />
      </label>

      {problem && (
        <p role="alert" className="text-sm text-paper/80">
          {problem}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !amount.trim()}
          className="min-h-12 flex-1 rounded-full bg-paper text-[0.9375rem] font-semibold text-ink disabled:opacity-40"
        >
          {busy ? 'Сохраняю…' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={() => onDone(false)}
          className="min-h-12 rounded-full border border-white/20 px-5 text-sm text-paper"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

/* --------------------------------------------------------- 12 months -- */

function Months({
  rows,
  today,
  convert,
  view,
}: {
  rows: Row[];
  today: string;
  convert: (amount: number, from: Currency) => number;
  view: Currency;
}) {
  const bars = useMemo(() => {
    const start = new Date(`${today.slice(0, 7)}-01T00:00:00.000Z`);
    const list: { key: string; label: string; full: string; total: number }[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(start);
      d.setUTCMonth(d.getUTCMonth() - i);
      const m = d.getUTCMonth();
      list.push({
        key: d.toISOString().slice(0, 7),
        label: MONTHS[m],
        full: `${MONTHS_FULL[m]} ${d.getUTCFullYear()}`,
        total: 0,
      });
    }
    for (const r of rows) {
      const bar = list.find((b) => r.day.startsWith(b.key));
      if (bar) bar.total += convert(r.amount, r.currency);
    }
    return list;
  }, [rows, today, convert]);

  const current = bars.length - 1;
  const [focus, setFocus] = useState(current);
  const max = Math.max(...bars.map((b) => b.total));
  const top = niceCeil(max);
  const peak = max > 0 ? bars.findIndex((b) => b.total === max) : -1;

  // Geometry: 12 slots across a 336-wide plot, a stem and a dot in each.
  const W = 336;
  const H = 150;
  const PLOT_TOP = 22;
  const BASE = 122;
  const slot = W / bars.length;
  const y = (v: number) => BASE - (v / top) * (BASE - PLOT_TOP);
  const f = bars[focus];

  return (
    <section>
      <ChartHead title="Последние 12 месяцев" readout={`${f.full} — ${money(f.total, view)}`} />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Доход по месяцам за год">
        {/* One axis, two ticks: zero at the baseline, a round number at the top. */}
        <line x1={0} x2={W} y1={BASE} y2={BASE} stroke="#2a2a29" strokeWidth={1} />
        <line x1={0} x2={W} y1={PLOT_TOP} y2={PLOT_TOP} stroke="#1a1a19" strokeWidth={1} />
        <text x={0} y={PLOT_TOP - 6} fill="#9b9b97" fontSize={10}>
          {money(top, view)}
        </text>

        {bars.map((b, i) => {
          const cx = slot * i + slot / 2;
          const active = i === focus;
          const colour = i === current ? NOW : PAST;
          return (
            <g key={b.key}>
              {b.total > 0 && (
                <>
                  <line
                    x1={cx}
                    x2={cx}
                    y1={BASE}
                    y2={y(b.total)}
                    stroke={colour}
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={active ? 1 : 0.8}
                  />
                  {/* A 2px ring in the surface colour keeps the dot clear of its stem. */}
                  <circle
                    cx={cx}
                    cy={y(b.total)}
                    r={active ? 6 : 4.5}
                    fill={colour}
                    stroke="#050505"
                    strokeWidth={2}
                  />
                </>
              )}
              {/* Selective labels: this month, and the best month if it is another. */}
              {(i === current || i === peak) && b.total > 0 && (
                <text
                  x={Math.min(Math.max(cx, 22), W - 22)}
                  y={y(b.total) - 11}
                  textAnchor="middle"
                  fill="#cfcfca"
                  fontSize={10}
                  fontWeight={600}
                >
                  {Math.round(b.total).toLocaleString('ru-RU')}
                </text>
              )}
              <text
                x={cx}
                y={H - 8}
                textAnchor="middle"
                fill={active ? '#ffffff' : '#9b9b97'}
                fontSize={10}
                fontWeight={i === current ? 600 : 400}
              >
                {b.label}
              </text>
              {/* The whole column is the target, not the dot. */}
              <rect
                x={slot * i}
                y={0}
                width={slot}
                height={H}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${b.full}: ${money(b.total, view)}`}
                onPointerEnter={() => setFocus(i)}
                onClick={() => setFocus(i)}
                onFocus={() => setFocus(i)}
                style={{ outline: 'none', cursor: 'pointer' }}
              />
            </g>
          );
        })}
      </svg>
    </section>
  );
}

/* ---------------------------------------------------------- 13 weeks -- */

function Days({
  rows,
  today,
  convert,
  view,
}: {
  rows: Row[];
  today: string;
  convert: (amount: number, from: Currency) => number;
  view: Currency;
}) {
  const WEEKS = 13;

  const { cells, peak } = useMemo(() => {
    // The grid ends on the Sunday of this week, so today sits in the last column.
    const end = addDays(today, 6 - weekday(today));
    const start = addDays(end, -(WEEKS * 7 - 1));
    const totals = new Map<string, number>();
    for (const r of rows) {
      if (r.day >= start && r.day <= today) {
        totals.set(r.day, (totals.get(r.day) ?? 0) + convert(r.amount, r.currency));
      }
    }
    const list: { day: string; total: number; future: boolean }[] = [];
    for (let i = 0; i < WEEKS * 7; i += 1) {
      const day = addDays(start, i);
      list.push({ day, total: totals.get(day) ?? 0, future: day > today });
    }
    return { cells: list, peak: Math.max(0, ...totals.values()) };
  }, [rows, today, convert]);

  const lastPaid = [...cells].reverse().find((c) => c.total > 0);
  const [focus, setFocus] = useState<string | null>(null);
  const shown = cells.find((c) => c.day === (focus ?? lastPaid?.day)) ?? null;

  /** Which of the five steps a day falls on: equal fifths of the busiest day. */
  const step = (v: number) =>
    Math.max(0, Math.min(RAMP.length - 1, Math.ceil((v / peak) * RAMP.length) - 1));

  const CELL = 25.6;
  const W = CELL * WEEKS;
  const H = CELL * 7;

  return (
    <section>
      <ChartHead
        title="Последние 13 недель, по дням"
        readout={shown ? `${dayLabel(shown.day)} — ${money(shown.total, view)}` : 'Денег за это время не было'}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Доход по дням за 13 недель">
        {cells.map((c, i) => {
          if (c.future) return null;
          const col = Math.floor(i / 7);
          const row = i % 7;
          const cx = col * CELL + CELL / 2;
          const cy = row * CELL + CELL / 2;
          if (c.total <= 0) {
            return <circle key={c.day} cx={cx} cy={cy} r={2.5} fill="none" stroke="#2a2a29" strokeWidth={1} />;
          }
          const active = shown?.day === c.day;
          return (
            <g key={c.day}>
              <circle cx={cx} cy={cy} r={active ? 7.5 : 6} fill={RAMP[step(c.total)]} />
              {active && <circle cx={cx} cy={cy} r={10.5} fill="none" stroke="#ffffff" strokeWidth={1} />}
              <rect
                x={col * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${dayLabel(c.day)}: ${money(c.total, view)}`}
                onPointerEnter={() => setFocus(c.day)}
                onClick={() => setFocus(c.day)}
                onFocus={() => setFocus(c.day)}
                style={{ outline: 'none', cursor: 'pointer' }}
              />
            </g>
          );
        })}
      </svg>

      {/* The scale: what the brightness means. */}
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[0.6875rem] text-paper/60">
        <span>меньше</span>
        {RAMP.map((c) => (
          <span key={c} aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: c }} />
        ))}
        <span>больше</span>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- currency -- */

function Split({
  rows,
  convert,
  view,
  title,
}: {
  rows: Row[];
  convert: (amount: number, from: Currency) => number;
  view: Currency;
  title: string;
}) {
  const parts = ORDER
    .map((c) => {
      const own = rows.filter((r) => r.currency === c);
      return {
        c,
        own: own.reduce((n, r) => n + r.amount, 0),
        conv: own.reduce((n, r) => n + convert(r.amount, r.currency), 0),
      };
    })
    .filter((p) => p.own > 0)
    .sort((a, b) => b.conv - a.conv);
  const total = parts.reduce((n, p) => n + p.conv, 0);
  // One currency is not a split — the hero already says it.
  if (parts.length < 2 || total <= 0) return null;

  return (
    <section>
      <ChartHead title={title} readout={money(total, view)} />
      <div className="mt-3 space-y-3">
        {parts.map((p) => {
          const share = p.conv / total;
          return (
            <div key={p.c}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-paper">{NAMES[p.c]}</span>
                <span className="text-right text-paper/70">
                  {Math.round(share * 100)}% · {money(p.own, p.c)}
                  {p.c !== view && <span className="text-paper/55"> ≈ {money(p.conv, view)}</span>}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#1a1a19]">
                <div
                  className="h-full rounded-full bg-[#cecec9]"
                  style={{ width: `${Math.max(2, share * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- entries -- */

function Entries({ rows, api, onChange }: { rows: Row[]; api: Api; onChange: () => void }) {
  const haptics = useHaptics();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(20);

  const remove = async (id: string) => {
    setBusy(true);
    try {
      await api.call('income:delete', { id });
      haptics.ok();
      setConfirm(null);
      onChange();
    } catch {
      haptics.bad();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <p className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">Записи</p>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-paper/55">В этот период записей нет.</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {rows.slice(0, limit).map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.9375rem] font-semibold">{money(r.amount, r.currency)}</span>
                <span className="tabular shrink-0 text-xs text-paper/60">{dayLabel(r.day)}</span>
              </div>
              <div className="mt-1 flex items-start justify-between gap-3">
                <span className="text-sm text-paper/70">{r.note || '—'}</span>
                {/* Two taps to delete: a slip of the thumb should not cost a record. */}
                {confirm === r.id ? (
                  <span className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(r.id)}
                      className="min-h-9 rounded-full bg-paper px-3 text-xs font-semibold text-ink disabled:opacity-40"
                    >
                      Удалить
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm(null)}
                      className="min-h-9 rounded-full border border-white/20 px-3 text-xs text-paper"
                    >
                      Нет
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirm(r.id)}
                    aria-label={`Удалить запись ${money(r.amount, r.currency)} от ${dayLabel(r.day)}`}
                    className="min-h-9 shrink-0 px-2 text-xs text-paper/60 hover:text-paper"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + 20)}
          className="mt-3 min-h-10 w-full rounded-full border border-white/15 text-sm text-paper/80"
        >
          Показать ещё
        </button>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- parts -- */

/**
 * A chart's name, and the readout line where a tapped mark says its value.
 *
 * Stacked, not side by side. A single-row `justify-between` read fine while
 * both halves were short, but "Последние 12 месяцев" next to "октябрь 2026 —
 * 7 268 сомони" is two long strings on one 320–375px line — the readout wraps
 * and its second line climbs back up over the title. Title above, value
 * below and right-aligned keeps the value's own length from ever touching it.
 */
function ChartHead({ title, readout }: { title: string; readout: string }) {
  return (
    <div>
      <p className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">{title}</p>
      <p aria-live="polite" className="mt-1 text-right text-sm font-semibold">
        {readout}
      </p>
    </div>
  );
}
