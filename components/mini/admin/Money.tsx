'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { currencies, money, type Currency } from '@/lib/content/finance';
import { useHaptics } from '@/components/mini/telegram';
import { errorText, type useAdminApi } from '@/components/mini/admin/api';

/*
 * The owner's money, kept by hand.
 *
 * He asked for three things: to write down what he earned and when, in
 * somoni, dollars or roubles, with a note on where it came from; to see it all
 * as one total in whichever of the three he picks, converted at today's rate;
 * and for it to be pleasant to look at, with charts that are not the usual ones.
 *
 * The currency switch at the top is the only filter on the screen, and it
 * scopes everything under it — every figure, every chart, every row. There is
 * no date filter: each block says its own window instead ("12 месяцев", "13
 * недель"), which is what keeps two numbers on one screen from disagreeing.
 *
 * The charts are monochrome, like the site. One is the honest form for months —
 * a stem and a dot, read precisely by where the dot sits. The other is the
 * unusual one: the last thirteen weeks as a field of dots, one per day, lit by
 * how much came in. It is the same point cloud every page of the site ends on,
 * drawn from his own money.
 *
 * Everything a chart shows can also be read without it: the list at the bottom
 * is the table view, and every mark answers a tap or keyboard focus with its
 * value in the readout line above the chart.
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

/** «2026-10-06» → «6 окт». Days are UTC calendar days throughout; see income.ts. */
function dayLabel(day: string): string {
  const [, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
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
  if (!data) return <p className="py-10 text-center text-sm text-paper/60">Загружаю…</p>;

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
  const { rows, rates, today } = data;

  /** An amount in the currency being read. */
  const to = useCallback(
    (amount: number, from: Currency) =>
      rates && view ? (amount / rates.perUsd[from]) * rates.perUsd[view] : amount,
    [rates, view],
  );

  const month = today.slice(0, 7);
  const lastMonthKey = (() => {
    const d = new Date(`${month}-01T00:00:00.000Z`);
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();
  const year = today.slice(0, 4);
  const monthIndex = Number(month.slice(5)) - 1;

  /* Totals, converted into one currency and also kept apart per currency. */
  const sum = (match: (r: Row) => boolean) => {
    const per: Record<Currency, number> = { TJS: 0, USD: 0, RUB: 0 };
    let total = 0;
    for (const r of rows) {
      if (!match(r)) continue;
      per[r.currency] += r.amount;
      total += to(r.amount, r.currency);
    }
    return { total, per };
  };

  const thisMonth = sum((r) => r.day.startsWith(month));
  const lastMonth = sum((r) => r.day.startsWith(lastMonthKey));
  const thisYear = sum((r) => r.day.startsWith(year));

  /** Without a rate, one total would be a guess, so each currency stands alone. */
  const show = (s: { total: number; per: Record<Currency, number> }) =>
    view
      ? money(s.total, view)
      : ORDER
          .filter((c) => s.per[c] > 0)
          .map((c) => money(s.per[c], c))
          .join(' + ') || '0';

  return (
    <div className="space-y-8">
      {/* The one filter. It scopes everything below it. */}
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

      {/* The hero: one number, this month. Proportional figures at this size. */}
      <section>
        <p className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">
          Заработано в {MONTHS_IN[monthIndex]}
        </p>
        {view ? (
          <p className="mt-2 text-[clamp(2.75rem,15vw,4rem)] leading-none font-bold tracking-[-0.04em]">
            {Math.round(thisMonth.total).toLocaleString('ru-RU')}
            <span className="ml-2 text-[0.4em] font-semibold tracking-normal text-paper/60">
              {unit(view)}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">{show(thisMonth)}</p>
        )}
        <p className="mt-3 text-sm text-paper/60">
          в {MONTHS_IN[(monthIndex + 11) % 12]} — {show(lastMonth)}
          <span className="text-paper/40"> · </span>
          за {year} — {show(thisYear)}
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
          {view && <Months rows={rows} today={today} to={to} view={view} />}
          {view && <Days rows={rows} today={today} to={to} view={view} />}
          {view && <Split rows={rows} to={to} view={view} />}
          <Entries rows={rows} api={api} onChange={onChange} />
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
  to,
  view,
}: {
  rows: Row[];
  today: string;
  to: (amount: number, from: Currency) => number;
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
      if (bar) bar.total += to(r.amount, r.currency);
    }
    return list;
  }, [rows, today, to]);

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
      <ChartHead title="12 месяцев" readout={`${f.full} — ${money(f.total, view)}`} />
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
  to,
  view,
}: {
  rows: Row[];
  today: string;
  to: (amount: number, from: Currency) => number;
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
        totals.set(r.day, (totals.get(r.day) ?? 0) + to(r.amount, r.currency));
      }
    }
    const list: { day: string; total: number; future: boolean }[] = [];
    for (let i = 0; i < WEEKS * 7; i += 1) {
      const day = addDays(start, i);
      list.push({ day, total: totals.get(day) ?? 0, future: day > today });
    }
    return { cells: list, peak: Math.max(0, ...totals.values()) };
  }, [rows, today, to]);

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
        title="13 недель, по дням"
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
  to,
  view,
}: {
  rows: Row[];
  to: (amount: number, from: Currency) => number;
  view: Currency;
}) {
  const parts = ORDER
    .map((c) => {
      const own = rows.filter((r) => r.currency === c);
      return {
        c,
        own: own.reduce((n, r) => n + r.amount, 0),
        conv: own.reduce((n, r) => n + to(r.amount, r.currency), 0),
      };
    })
    .filter((p) => p.own > 0)
    .sort((a, b) => b.conv - a.conv);
  const total = parts.reduce((n, p) => n + p.conv, 0);
  // One currency is not a split — the hero already says it.
  if (parts.length < 2 || total <= 0) return null;

  return (
    <section>
      <ChartHead title="В чём платили, за всё время" readout={money(total, view)} />
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

/** A chart's name, and the readout line where a tapped mark says its value. */
function ChartHead({ title, readout }: { title: string; readout: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="shrink-0 text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase">{title}</p>
      <p aria-live="polite" className="text-right text-sm font-semibold">
        {readout}
      </p>
    </div>
  );
}
