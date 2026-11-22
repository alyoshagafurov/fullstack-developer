'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { stageLabel, stageOf, stageTarget, type LeadStatusName, type Stage } from '@/lib/content/finance';
import { useBackButton, useHaptics } from '@/components/mini/telegram';
import { errorText, useAdminApi } from '@/components/mini/admin/api';
import { Money } from '@/components/mini/admin/Money';
import { Calendar } from '@/components/mini/admin/Calendar';
import { AlySplash } from '@/components/mini/AlySplash';
import { contactHref, parseContact } from '@/lib/content/brief';

/*
 * The owner's panel, inside Telegram — the only admin there is.
 *
 * Drawn the way the site is drawn and the way an iPhone app is laid out: black,
 * grouped grey lists, one blue for "do this", large titles, and the five places
 * he goes along the bottom, under his thumb. Every screen answers one question
 * first — who is waiting, what came in, what was paid, what is today — and the
 * button for the next step is the largest thing on it.
 *
 * A request has three stages and one way out: Новая → В работе → Готово, or
 * Отказ. Nothing here is shown to a client.
 *
 * Nothing on this page is server-rendered, and that is load-bearing: every
 * figure arrives from a POST carrying the signature Telegram issued, so a
 * stranger who opens this address gets an empty shell.
 */

type Tab = 'today' | 'leads' | 'reviews' | 'money' | 'calendar';

/* ------------------------------------------------------------- styles -- */

const BLUE = '#0a84ff';
const group = 'overflow-hidden rounded-[18px] bg-[#1c1c1e]';
const primary =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0a84ff] px-5 text-[1.0625rem] font-semibold text-white transition-[transform,opacity] active:scale-[0.98] disabled:opacity-40';
const secondary =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#2c2c2e] px-5 text-[1.0625rem] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40';
const field =
  'w-full rounded-[12px] bg-[#2c2c2e] px-4 py-3 text-base text-white outline-none placeholder:text-[#8e8e93] focus:ring-2 focus:ring-[#0a84ff]';

const STAGE_TONE: Record<Stage, string> = { new: '#0a84ff', work: '#ff9f0a', done: '#30d158', lost: '#8e8e93' };

const shortDate = (value: string | Date | null | undefined) => {
  if (!value) return '';
  const d = new Date(value);
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days === 0) return 'сегодня';
  if (days === 1) return 'вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
};

/* --------------------------------------------------------------- types -- */

type Overview = { waiting: number; fresh: number; active: number; completed: number; reviews?: number };

type LeadRow = {
  id: string;
  ref: string;
  name: string;
  projectType: string;
  budget: string;
  status: LeadStatusName;
  createdAt: string;
  firstRepliedAt: string | null;
};

type LeadFull = LeadRow & {
  email: string;
  company: string | null;
  contact: string | null;
  goal: string;
  description: string;
  audience: string | null;
  features: string | null;
  links: string | null;
  extra: string | null;
  timeline: string;
  notes: { id: string; body: string; createdAt: string }[];
};

type Review = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  text: string;
  rating: number | null;
  published: boolean;
  createdAt: string;
};

type Api = ReturnType<typeof useAdminApi>;

/* ---------------------------------------------------------------- shell -- */

export function AdminApp() {
  const api = useAdminApi();
  const haptics = useHaptics();
  const { app, inside } = api;

  const [tab, setTab] = useState<Tab>('today');
  const [openLead, setOpenLead] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState<'all' | Stage>('all');
  const [ready, setReady] = useState(false);

  /* A notification's button opens the panel at one lead, or at the reviews. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('lead');
    if (id) {
      setOpenLead(id);
      setTab('leads');
    } else if (params.get('tab') === 'reviews') setTab('reviews');
    // Telegram's SDK settles a moment after the first paint; until then there is nothing to decide.
    const timer = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useBackButton(openLead !== null, () => setOpenLead(null));

  // The counts on the tab bar, fetched again whenever he moves.
  const counts = useRead<Overview>(api, inside ? 'overview' : '', { period: 'month' }, [tab, openLead, inside]);

  const go = (next: Tab, filter: 'all' | Stage = 'all') => {
    haptics.tap();
    setOpenLead(null);
    setLeadFilter(filter);
    setTab(next);
    window.scrollTo(0, 0);
  };

  if (!inside && !ready) return <Shell><AlySplash full /></Shell>;

  if (!inside) {
    return (
      <Shell>
        <Notice title="Админка открывается из Telegram" body="Откройте бота и нажмите синюю кнопку «Админка» внизу чата." />
      </Shell>
    );
  }

  if (api.expired) {
    return (
      <Shell>
        {/*
          One message for both refusals, because the server sends one: telling
          an outsider "your signature is fine, you are just not the owner" would
          confirm whose it is.
        */}
        <Notice
          title="Откройте заново"
          body="Админка открывается только владельцу бота, и окно живёт час. Закройте его и откройте снова — всё на месте."
          action={app ? { text: 'Закрыть', run: () => app.close() } : undefined}
        />
      </Shell>
    );
  }

  return (
    <Shell bar>
      <Screen id={openLead ? `lead-${openLead}` : `${tab}-${leadFilter}`}>
        {openLead ? (
          <LeadScreen id={openLead} api={api} onBack={() => setOpenLead(null)} />
        ) : (
          <>
            {tab === 'today' && <TodayScreen api={api} data={counts.data} onOpen={setOpenLead} go={go} />}
            {tab === 'leads' && <LeadsScreen api={api} initial={leadFilter} onOpen={setOpenLead} />}
            {tab === 'reviews' && <ReviewsScreen api={api} />}
            {tab === 'money' && (
              <>
                <Title text="Деньги" />
                <Money api={api} />
              </>
            )}
            {tab === 'calendar' && (
              <>
                <Title text="Календарь" />
                <Calendar api={api} />
              </>
            )}
          </>
        )}
      </Screen>

      {api.expiresAt !== null && <Expiry at={api.expiresAt} />}

      <TabBar
        tab={openLead ? 'leads' : tab}
        onGo={(t) => go(t)}
        badges={{ leads: counts.data?.waiting ?? 0, reviews: counts.data?.reviews ?? 0 }}
      />
    </Shell>
  );
}

function Shell({ children, bar = false }: { children: React.ReactNode; bar?: boolean }) {
  return (
    <div
      data-mini="admin"
      data-tone="dark"
      className="flex flex-col bg-black text-white antialiased"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop: 'calc(0.75rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
        paddingBottom: bar
          ? 'calc(6.5rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))'
          : '1.5rem',
      }}
    >
      <div className="w-full px-4">{children}</div>
    </div>
  );
}

/* Each screen settles in from below, the way an iOS view appears. */
function Screen({ id, children }: { id: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Title({ text, sub }: { text: string; sub?: string }) {
  return (
    <header className="mb-5 pt-2">
      <h1 className="font-display text-[2.125rem] leading-[1.05] font-bold tracking-[-0.035em]">{text}</h1>
      {sub && <p className="mt-1 text-[0.9375rem] text-[#8e8e93]">{sub}</p>}
    </header>
  );
}

/* ------------------------------------------------------------- tab bar -- */

const ICONS: Record<Tab, React.ReactNode> = {
  today: <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  leads: (
    <>
      <path d="M3 13h5l1.5 2.5h5L16 13h5" />
      <path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" />
    </>
  ),
  reviews: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
  money: (
    <>
      <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
      <path d="M2.5 10.5h19M16.5 14.8h2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
};

const TAB_LABEL: Record<Tab, string> = {
  today: 'Сегодня',
  leads: 'Заявки',
  reviews: 'Отзывы',
  money: 'Деньги',
  calendar: 'Календарь',
};

function TabBar({ tab, onGo, badges }: { tab: Tab; onGo: (t: Tab) => void; badges: Partial<Record<Tab, number>> }) {
  return (
    <nav
      aria-label="Разделы"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0d0d0d]/85 backdrop-blur-xl"
      style={{ paddingBottom: 'calc(0.25rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))' }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => {
          const on = t === tab;
          const badge = badges[t] ?? 0;
          return (
            <li key={t}>
              <button
                type="button"
                onClick={() => onGo(t)}
                aria-current={on ? 'page' : undefined}
                className="flex w-full flex-col items-center gap-1 pt-2 pb-1.5 transition-colors"
                style={{ color: on ? BLUE : '#8e8e93' }}
              >
                <span className="relative">
                  <svg viewBox="0 0 24 24" className="size-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                    {ICONS[t]}
                  </svg>
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff453a] px-1 text-[11px] leading-none font-semibold text-white tabular-nums">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                <span className="text-[10.5px] font-medium">{TAB_LABEL[t]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------ helpers -- */

function Notice({ title, body, action: act }: { title: string; body: string; action?: { text: string; run: () => void } }) {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center text-center">
      <p className="font-display text-[1.75rem] leading-tight font-bold tracking-[-0.03em]">{title}</p>
      <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-[#8e8e93]">{body}</p>
      {act && (
        <button type="button" onClick={act.run} className={`${primary} mt-8 max-w-xs`}>
          {act.text}
        </button>
      )}
    </div>
  );
}

/** Shown only in the last ten minutes of the hour a launch lives. */
function Expiry({ at }: { at: number }) {
  const [left, setLeft] = useState(at - Date.now());
  useEffect(() => {
    setLeft(at - Date.now());
    const timer = window.setInterval(() => setLeft(at - Date.now()), 20_000);
    return () => window.clearInterval(timer);
  }, [at]);
  if (left > 10 * 60 * 1000) return null;
  const minutes = Math.max(0, Math.round(left / 60_000));
  return (
    <p className="mt-8 text-center text-xs text-[#8e8e93]">
      {minutes > 0 ? `Окно закроется через ${minutes} мин — потом откройте заново` : 'Откройте админку заново'}
    </p>
  );
}

/** One read, with its own loading and error. Re-runs when `deps` change; an empty command reads nothing. */
function useRead<T>(api: Api, command: string, payload: Record<string, unknown>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(Boolean(command));
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const body = JSON.stringify(payload);

  useEffect(() => {
    if (!command) return;
    let dropped = false;
    setBusy(true);
    setError('');
    api
      .call<T>(command, JSON.parse(body) as Record<string, unknown>)
      .then((value) => {
        if (!dropped) setData(value);
      })
      .catch((problem) => {
        if (!dropped) setError(errorText(problem));
      })
      .finally(() => {
        if (!dropped) setBusy(false);
      });
    return () => {
      dropped = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, command, nonce]);

  return { data, error, busy, reload };
}

function Problem({ text }: { text: string }) {
  return (
    <p role="alert" className="py-10 text-center text-[0.9375rem] text-[#8e8e93]">
      {text}
    </p>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 8 14" className="h-3.5 w-2 shrink-0 text-[#5a5a5e]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m1.5 1.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StagePill({ status }: { status: LeadStatusName }) {
  const stage = stageOf(status);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium" style={{ color: STAGE_TONE[stage] }}>
      <span className="size-2 rounded-full" style={{ background: STAGE_TONE[stage] }} />
      {stageLabel[stage]}
    </span>
  );
}

/* A request as one row of a grouped list. */
function LeadRowItem({ row, onOpen, last }: { row: LeadRow; onOpen: (id: string) => void; last: boolean }) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(row.id)} className="flex w-full items-center pl-4 text-left active:bg-white/5">
        <span className={`flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 ${last ? '' : 'border-b border-white/10'}`}>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[1.0625rem] font-semibold">{row.name}</span>
              <span className="shrink-0 text-[13px] text-[#8e8e93]">{shortDate(row.createdAt)}</span>
            </span>
            <span className="mt-0.5 flex items-center justify-between gap-3">
              <span className="truncate text-[0.9375rem] text-[#8e8e93]">{row.projectType}</span>
              <StagePill status={row.status} />
            </span>
          </span>
          <Chevron />
        </span>
      </button>
    </li>
  );
}

/* --------------------------------------------------------------- today -- */

function TodayScreen({
  api,
  data,
  onOpen,
  go,
}: {
  api: Api;
  data: Overview | null;
  onOpen: (id: string) => void;
  go: (t: Tab, filter?: 'all' | Stage) => void;
}) {
  const fresh = useRead<{ rows: LeadRow[] }>(api, 'leads', { status: 'new', page: 1 }, []);
  const haptics = useHaptics();
  const [sync, setSync] = useState<'' | 'busy' | 'ok' | 'bad'>('');
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!data) return <AlySplash />;

  const waiting = fresh.data?.rows ?? [];

  return (
    <div className="space-y-7">
      <Title text="Сегодня" sub={date.charAt(0).toUpperCase() + date.slice(1)} />

      {/* the one thing that costs money when it waits: people with no answer */}
      <section>
        {data.waiting > 0 ? (
          <div className="rounded-[22px] bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] p-5">
            <p className="text-[0.9375rem] font-medium text-white/85">Ждут вашего ответа</p>
            <p className="mt-1 font-display text-[3.5rem] leading-none font-bold tracking-[-0.04em] tabular-nums">{data.waiting}</p>
            <p className="mt-2 text-[0.9375rem] text-white/85">Клиентам обещан ответ в течение дня.</p>
          </div>
        ) : (
          <div className="rounded-[22px] bg-[#1c1c1e] p-5">
            <p className="font-display text-[1.5rem] leading-tight font-bold tracking-[-0.03em]">Всем ответили</p>
            <p className="mt-1 text-[0.9375rem] text-[#8e8e93]">Новых заявок нет. Когда придёт новая, бот сразу пришлёт её.</p>
          </div>
        )}
        {waiting.length > 0 && (
          <ul className={`${group} mt-3`}>
            {waiting.slice(0, 5).map((row, i, all) => (
              <LeadRowItem key={row.id} row={row} onOpen={onOpen} last={i === all.length - 1} />
            ))}
          </ul>
        )}
      </section>

      {/* where the work stands: three stages, each a door into its list */}
      <section>
        <h2 className="mb-2 px-1 text-[1.25rem] font-bold tracking-[-0.02em]">Заявки</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              ['new', data.waiting],
              ['work', data.active],
              ['done', data.completed],
            ] as const
          ).map(([stage, value]) => (
            <button
              key={stage}
              type="button"
              onClick={() => go('leads', stage)}
              className="rounded-[18px] bg-[#1c1c1e] p-3.5 text-left transition-transform active:scale-[0.97]"
            >
              <span className="block size-2.5 rounded-full" style={{ background: STAGE_TONE[stage] }} />
              <span className="mt-3 block font-display text-[1.75rem] leading-none font-bold tracking-[-0.03em] tabular-nums">{value}</span>
              <span className="mt-1 block text-[13px] text-[#8e8e93]">{stageLabel[stage]}</span>
            </button>
          ))}
        </div>
      </section>

      {(data.reviews ?? 0) > 0 && (
        <button type="button" onClick={() => go('reviews')} className={`${group} flex w-full items-center gap-3 p-4 text-left active:bg-white/5`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a]">
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              {ICONS.reviews}
            </svg>
          </span>
          <span className="flex-1">
            <span className="block text-[1.0625rem] font-semibold">Новые отзывы: {data.reviews}</span>
            <span className="block text-[0.9375rem] text-[#8e8e93]">Проверьте и опубликуйте на сайте</span>
          </span>
          <Chevron />
        </button>
      )}

      <section>
        <h2 className="mb-2 px-1 text-[1.25rem] font-bold tracking-[-0.02em]">Бот</h2>
        <ul className={group}>
          <li>
            <a href="/mini" className="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 px-4 text-[1.0625rem] active:bg-white/5">
              Как видят клиенты
              <Chevron />
            </a>
          </li>
          <li>
            <button
              type="button"
              disabled={sync === 'busy'}
              onClick={async () => {
                setSync('busy');
                try {
                  await api.call('bot:sync');
                  haptics.ok();
                  setSync('ok');
                } catch {
                  haptics.bad();
                  setSync('bad');
                }
              }}
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-[1.0625rem] text-[#0a84ff] active:bg-white/5"
            >
              Обновить меню и описание бота
              <span className="shrink-0 text-[0.9375rem] text-[#8e8e93]">
                {sync === 'busy' ? '…' : sync === 'ok' ? 'Готово' : sync === 'bad' ? 'Не вышло' : ''}
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- leads -- */

const FILTERS: { id: 'all' | Stage; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые' },
  { id: 'work', label: 'В работе' },
  { id: 'done', label: 'Готово' },
  { id: 'lost', label: 'Отказ' },
];

function plural(n: number, one: string, few: string, many: string) {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few;
  return many;
}

function LeadsScreen({ api, initial, onOpen }: { api: Api; initial: 'all' | Stage; onOpen: (id: string) => void }) {
  const [typed, setTyped] = useState('');
  const [filter, setFilter] = useState<'all' | Stage>(initial);
  const [query, setQuery] = useState('');
  const haptics = useHaptics();

  // Search as he types, a beat after the last letter.
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(typed.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [typed]);

  const { data, error, busy } = useRead<{ rows: LeadRow[]; total: number }>(api, 'leads', { q: query, status: filter, page: 1 }, [query, filter]);

  return (
    <div>
      <Title text="Заявки" sub={data ? `${data.total} ${plural(data.total, 'заявка', 'заявки', 'заявок')}` : ' '} />

      <label className="relative block">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-[#8e8e93]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="Поиск по имени или номеру"
          enterKeyHint="search"
          className="w-full rounded-[12px] bg-[#1c1c1e] py-2.5 pr-4 pl-10 text-base text-white outline-none placeholder:text-[#8e8e93]"
        />
      </label>

      {/* iOS segmented control */}
      <div className="mt-3 grid grid-cols-5 gap-0.5 rounded-[10px] bg-[#1c1c1e] p-0.5" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => {
              haptics.tap();
              setFilter(f.id);
            }}
            className={`rounded-[8px] py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${filter === f.id ? 'bg-[#636366] text-white' : 'text-[#c7c7cc]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {busy && !data && <AlySplash />}
        {error && <Problem text={error} />}
        {data && data.rows.length === 0 && <Problem text={query ? 'Ничего не нашлось.' : 'Здесь пока пусто.'} />}
        {data && data.rows.length > 0 && (
          <ul className={`${group} transition-opacity ${busy ? 'opacity-50' : ''}`}>
            {data.rows.map((row, i) => (
              <LeadRowItem key={row.id} row={row} onOpen={onOpen} last={i === data.rows.length - 1} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- one client -- */

const STEPS: Stage[] = ['new', 'work', 'done'];

function LeadScreen({ id, api, onBack }: { id: string; api: Api; onBack: () => void }) {
  const { data, error, busy, reload } = useRead<LeadFull | null>(api, 'lead', { id }, [id]);
  const haptics = useHaptics();
  const [note, setNote] = useState('');
  const [working, setWorking] = useState('');
  const [problem, setProblem] = useState('');

  const run = async (command: string, payload: Record<string, unknown>, mark: string) => {
    setWorking(mark);
    setProblem('');
    try {
      const result = await api.call<{ status: string; message?: string }>(command, payload);
      if (result?.status === 'error') {
        haptics.bad();
        setProblem(result.message ?? 'Не получилось.');
      } else {
        haptics.ok();
        setNote('');
        reload();
      }
    } catch (failure) {
      haptics.bad();
      setProblem(errorText(failure));
    } finally {
      setWorking('');
    }
  };

  const back = (
    <button type="button" onClick={onBack} className="-ml-1 flex min-h-10 items-center gap-1 text-[1.0625rem] text-[#0a84ff]">
      <svg viewBox="0 0 10 18" className="h-[17px] w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M8.5 1.5 1.5 9l7 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Заявки
    </button>
  );

  if (busy && !data) return <>{back}<AlySplash /></>;
  if (error) return <>{back}<Problem text={error} /></>;
  if (!data) return <>{back}<Problem text="Заявка не найдена." /></>;

  const stage = stageOf(data.status);
  const move = (to: Stage) => void run('lead:status', { id, to: stageTarget[to] }, to);
  const next: { to: Stage; text: string } | null =
    stage === 'new'
      ? { to: 'work', text: 'Взять в работу' }
      : stage === 'work'
        ? { to: 'done', text: 'Проект готов' }
        : stage === 'lost'
          ? { to: 'work', text: 'Вернуть в работу' }
          : null;

  // "Telegram: @name" on new leads, a bare handle or number on old ones.
  const contact = parseContact(data.contact);
  const contactLink = contact ? contactHref(contact.method, contact.value) : null;
  const external = contactLink?.startsWith('http');
  const mail = data.email && contact?.method !== 'Email';

  const brief: [string, string | null][] = [
    ['Цель', data.goal],
    ['Что нужно', data.description],
    ['Аудитория', data.audience],
    ['Функции', data.features],
    ['Нравится', data.links],
    ['Вопросы', data.extra],
    ['Срок', data.timeline],
    ['Бюджет', data.budget],
    ['Компания', data.company],
  ];

  return (
    <div className="space-y-6">
      {back}

      <header>
        <h1 className="font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.035em]">{data.name}</h1>
        <p className="mt-1.5 text-[0.9375rem] text-[#8e8e93]">
          {data.projectType} · {shortDate(data.createdAt)} · <span className="tabular-nums">{data.ref}</span>
        </p>
      </header>

      {/* how to reach them: the first thing he does with a new request */}
      {(contactLink || mail) && (
        <section className="grid grid-cols-2 gap-2.5">
          {contactLink && (
            <a href={contactLink} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={`${primary} ${mail ? '' : 'col-span-2'}`}>
              Написать
            </a>
          )}
          {mail && (
            <a href={`mailto:${data.email}`} className={`${secondary} ${contactLink ? '' : 'col-span-2'}`}>
              Почта
            </a>
          )}
          {contact && (
            <p className="col-span-2 text-center text-[13px] text-[#8e8e93] select-all">
              {contact.method} · {contact.value}
            </p>
          )}
        </section>
      )}

      {/* the three stages, and one button for the next */}
      <section className={`${group} p-4`}>
        <div className="flex items-start">
          {STEPS.map((s, i) => {
            const reached = stage !== 'lost' && STEPS.indexOf(stage) >= i;
            const lineOn = stage !== 'lost' && STEPS.indexOf(stage) > i;
            return (
              <div key={s} className={`flex items-start ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex w-16 flex-col items-center gap-1.5">
                  <span
                    className="grid size-7 place-items-center rounded-full text-[13px] font-semibold transition-colors"
                    style={{ background: reached ? STAGE_TONE[s] : '#2c2c2e', color: reached ? '#000' : '#8e8e93' }}
                  >
                    {reached ? '✓' : i + 1}
                  </span>
                  <span className={`text-[12px] whitespace-nowrap ${stage === s ? 'font-semibold text-white' : 'text-[#8e8e93]'}`}>{stageLabel[s]}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="mt-3.5 h-0.5 flex-1 rounded-full" style={{ background: lineOn ? STAGE_TONE[STEPS[i + 1]] : '#2c2c2e' }} />
                )}
              </div>
            );
          })}
        </div>
        {stage === 'lost' && <p className="mt-4 text-center text-[0.9375rem] text-[#8e8e93]">Отмечена как отказ</p>}
        {next && (
          <button type="button" disabled={working !== ''} onClick={() => move(next.to)} className={`${primary} mt-4`}>
            {working === next.to ? '…' : next.text}
          </button>
        )}
        {stage !== 'lost' && stage !== 'done' && (
          <button type="button" disabled={working !== ''} onClick={() => move('lost')} className="mt-1 min-h-11 w-full text-[1.0625rem] text-[#ff453a] disabled:opacity-40">
            {working === 'lost' ? '…' : 'Отказ'}
          </button>
        )}
        {stage === 'done' && (
          <button type="button" disabled={working !== ''} onClick={() => move('work')} className="mt-3 min-h-11 w-full text-[0.9375rem] text-[#0a84ff] disabled:opacity-40">
            Вернуть в работу
          </button>
        )}
      </section>

      {/* what the client wrote, as he wrote it */}
      <section>
        <h2 className="mb-2 px-1 text-[13px] font-medium tracking-wide text-[#8e8e93] uppercase">Что написал клиент</h2>
        <dl className={group}>
          {brief
            .filter(([, v]) => v)
            .map(([term, value], i, all) => (
              <div key={term} className={`px-4 py-3 ${i < all.length - 1 ? 'border-b border-white/10' : ''}`}>
                <dt className="text-[13px] text-[#8e8e93]">{term}</dt>
                <dd className="mt-0.5 text-[1rem] leading-relaxed whitespace-pre-wrap">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-[13px] font-medium tracking-wide text-[#8e8e93] uppercase">Заметки · видите только вы</h2>
        <div className={`${group} p-3`}>
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (note.trim()) void run('lead:note', { id, body: note }, 'note');
            }}
          >
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Например: созвон в четверг" className={`${field} resize-none`} />
            <button
              type="submit"
              aria-label="Сохранить заметку"
              disabled={!note.trim() || working !== ''}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0a84ff] text-white disabled:bg-[#2c2c2e] disabled:text-[#636366]"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          {data.notes.length > 0 && (
            <ul className="mt-3 space-y-2">
              {data.notes.map((row) => (
                <li key={row.id} className="rounded-[12px] bg-[#2c2c2e] px-3.5 py-2.5">
                  <p className="text-[1rem] leading-relaxed whitespace-pre-wrap">{row.body}</p>
                  <p className="mt-1 text-[12px] text-[#8e8e93]">{shortDate(row.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {problem && <Problem text={problem} />}
    </div>
  );
}

/* ------------------------------------------------------------- reviews -- */

function ReviewsScreen({ api }: { api: Api }) {
  const { data, error, busy, reload } = useRead<Review[]>(api, 'reviews', {}, []);
  const haptics = useHaptics();
  const [working, setWorking] = useState('');

  const toggle = async (id: string) => {
    setWorking(id);
    try {
      await api.call('review:toggle', { id });
      haptics.ok();
      reload();
    } catch {
      haptics.bad();
    } finally {
      setWorking('');
    }
  };

  const waiting = data?.filter((r) => !r.published).length ?? 0;

  return (
    <div>
      <Title text="Отзывы" sub={data ? (waiting > 0 ? `${waiting} ждут проверки` : 'Все проверены') : ' '} />
      {busy && !data && <AlySplash />}
      {error && <Problem text={error} />}
      {data && data.length === 0 && <Problem text="Отзывов пока нет." />}
      <ul className="space-y-3">
        {data?.map((r) => (
          <li key={r.id} className={`${group} p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[1.0625rem] font-semibold">{r.name}</p>
                <p className="truncate text-[13px] text-[#8e8e93]">{[r.role, r.company].filter(Boolean).join(', ') || shortDate(r.createdAt)}</p>
              </div>
              {r.rating ? <p className="shrink-0 text-[15px] tracking-[0.08em] text-[#ff9f0a]">{'★'.repeat(r.rating)}</p> : null}
            </div>
            <p className="mt-3 text-[1rem] leading-relaxed text-[#e5e5ea]">{r.text}</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className={`text-[0.9375rem] ${r.published ? 'text-[#30d158]' : 'text-[#8e8e93]'}`}>{r.published ? 'На сайте' : 'Скрыт · ждёт проверки'}</span>
              <button
                type="button"
                role="switch"
                aria-checked={r.published}
                aria-label="Показывать на сайте"
                disabled={working === r.id}
                onClick={() => void toggle(r.id)}
                className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${r.published ? 'bg-[#30d158]' : 'bg-[#39393d]'}`}
              >
                <span className={`absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow transition-transform duration-200 ${r.published ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
