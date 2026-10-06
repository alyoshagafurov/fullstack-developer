'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  activePipeline,
  leadStatuses,
  money,
  statusLabel,
  type LeadStatusName,
} from '@/lib/content/finance';
import { useBackButton, useHaptics, useTelegram } from '@/components/mini/telegram';
import { errorText, useAdminApi } from '@/components/mini/admin/api';

/*
 * The owner's panel, inside Telegram.
 *
 * This replaces nine persistent buttons under the chat. They could show a list
 * and ask for a reference number; they could not show a client's card, let him
 * correct a status and write a note in the same breath, or put a review on the
 * site. A keyboard is a remote control with nine fixed buttons — right for a
 * machine with nine functions, wrong for a business.
 *
 * The visual language is the site's — the same black, the same Onest, the same
 * hairlines — but without the point cloud. That belongs where somebody is being
 * shown something. Here the owner is working, usually standing up, usually in a
 * hurry: what counts is that the number he came for is the largest thing on the
 * screen and the button he needs is under his thumb.
 *
 * Nothing on this page is server-rendered, and that is load-bearing rather than
 * incidental. Every figure arrives from a POST carrying the signature Telegram
 * issued, so a stranger who opens this address gets an empty shell. One import
 * from lib/prisma or lib/admin/queries into this directory would undo it.
 */

type Tab = 'today' | 'leads' | 'money' | 'site' | 'bot';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'leads', label: 'Заявки' },
  { id: 'money', label: 'Деньги' },
  { id: 'site', label: 'Сайт' },
  { id: 'bot', label: 'Бот' },
];

/* ------------------------------------------------------------- styles -- */

const card = 'rounded-2xl border border-white/12 bg-white/[0.03] p-4';
const label = 'text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase';
const action =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition-opacity disabled:opacity-40';
const solid = `${action} bg-paper text-ink hover:opacity-90`;
const outline = `${action} border border-white/20 text-paper hover:border-paper`;
const field =
  'w-full rounded-xl border border-white/20 bg-[#121212] px-4 py-3 text-base text-paper outline-none placeholder:text-paper/45 focus:border-paper';

const when = (value: string | Date | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
    : '—';

const sums = (rows: { currency: string; total: number }[]) =>
  rows.length === 0 ? '0' : rows.map((r) => money(r.total, r.currency)).join(' · ');

/* --------------------------------------------------------------- types -- */

type Overview = {
  waiting: number;
  fresh: number;
  active: number;
  completed: number;
  conversion: number;
  funnel: { status: LeadStatusName; count: number }[];
  received: { currency: string; total: number }[];
  spent: { currency: string; total: number }[];
  expected: { currency: string; total: number }[];
  overdue: { currency: string; total: number }[];
};

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

type Finance = {
  received: { currency: string; total: number }[];
  spent: { currency: string; total: number }[];
  unpaid: {
    id: string;
    amount: number | null;
    currency: string;
    dueAt: string | null;
    lead: { id: string; ref: string; name: string } | null;
  }[];
};

type Publishable = {
  cases: { id: string; title: string; year: string; published: boolean }[];
  reviews: {
    id: string;
    name: string;
    company: string | null;
    rating: number | null;
    source: string;
    published: boolean;
    text: string;
    createdAt: string;
  }[];
};

type BotState = {
  token: boolean;
  secret: boolean;
  admins: number;
  username: string | null;
  webhookUrl: string | null;
  pending: number;
  lastError: string | null;
};

/* ---------------------------------------------------------------- shell -- */

export function AdminApp() {
  const { app, inside, settled } = useTelegram();
  const api = useAdminApi();
  const haptics = useHaptics();

  const [tab, setTab] = useState<Tab>('today');
  const [openLead, setOpenLead] = useState<string | null>(null);

  /* The notification's button opens the panel straight at one lead. */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('lead');
    if (id) {
      setOpenLead(id);
      setTab('leads');
    }
  }, []);

  useBackButton(openLead !== null, () => setOpenLead(null));

  const go = (next: Tab) => {
    haptics.tap();
    setOpenLead(null);
    setTab(next);
  };

  if (!settled) return <Shell>{null}</Shell>;

  if (!inside) {
    return (
      <Shell>
        <Notice
          title="Админка открывается из Telegram"
          body="Эта страница узнаёт владельца по подписи, которую Telegram выдаёт при открытии окна. В обычном браузере её нет — откройте бота и нажмите «Открыть админку»."
        />
      </Shell>
    );
  }

  if (api.expired) {
    return (
      <Shell>
        <Notice
          title="Окно устарело"
          body="Подпись действует час с момента открытия. Закройте админку и откройте заново — всё на месте."
          action={app ? { text: 'Закрыть', run: () => app.close() } : undefined}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            aria-current={tab === item.id}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              tab === item.id ? 'bg-paper text-ink' : 'text-paper/55 hover:text-paper'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {openLead ? (
        <LeadScreen id={openLead} api={api} onBack={() => setOpenLead(null)} />
      ) : (
        <>
          {tab === 'today' && <TodayScreen api={api} onOpen={setOpenLead} />}
          {tab === 'leads' && <LeadsScreen api={api} onOpen={setOpenLead} />}
          {tab === 'money' && <MoneyScreen api={api} />}
          {tab === 'site' && <SiteScreen api={api} />}
          {tab === 'bot' && <BotScreen api={api} />}
        </>
      )}

      {api.expiresAt !== null && <Expiry at={api.expiresAt} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-mini
      className="flex flex-col bg-void text-paper"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop:
          'calc(1rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
        paddingBottom:
          'calc(1.5rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="w-full px-4">{children}</div>
    </div>
  );
}

function Notice({
  title,
  body,
  action: act,
}: {
  title: string;
  body: string;
  action?: { text: string; run: () => void };
}) {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center text-center">
      <p className="text-[clamp(1.375rem,6vw,2rem)] leading-tight font-bold tracking-[-0.03em]">
        {title}
      </p>
      <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-paper/60">{body}</p>
      {act && (
        <button type="button" onClick={act.run} className={`${solid} mt-8 w-full max-w-xs`}>
          {act.text}
        </button>
      )}
    </div>
  );
}

/**
 * How long this launch has left.
 *
 * Shown only in the last ten minutes. A clock that is always on screen is a
 * clock nobody reads; one that appears is a warning. It exists so the hour ends
 * with a sentence rather than with a button that quietly stops working.
 */
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
    <p className="mt-8 text-center text-xs text-paper/40">
      {minutes > 0
        ? `Окно закроется через ${minutes} мин — потом откройте заново`
        : 'Откройте админку заново'}
    </p>
  );
}

/* --------------------------------------------------------------- hooks -- */

type Api = ReturnType<typeof useAdminApi>;

/** One read, with its own loading and error. Re-runs when `deps` change. */
function useRead<T>(api: Api, command: string, payload: Record<string, unknown>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const body = JSON.stringify(payload);

  useEffect(() => {
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
  }, [...deps, nonce]);

  return { data, error, busy, reload };
}

function Loading() {
  return <p className="py-10 text-center text-sm text-paper/40">Загружаю…</p>;
}

function Problem({ text }: { text: string }) {
  return (
    <p role="alert" className="py-8 text-center text-sm text-paper/70">
      {text}
    </p>
  );
}

function Line({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-paper/60">{term}</dt>
      <dd className="tabular text-right">{value}</dd>
    </div>
  );
}

function LeadLine({ row, onOpen }: { row: LeadRow; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(row.id)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/12 px-4 py-3 text-left transition-colors hover:border-paper"
    >
      <span className="min-w-0">
        <span className="block truncate text-[0.9375rem] font-medium">{row.name}</span>
        <span className="tabular mt-0.5 block truncate text-xs text-paper/45">
          {row.ref} · {row.projectType}
        </span>
      </span>
      <span className="shrink-0 text-xs text-paper/55">{statusLabel[row.status]}</span>
    </button>
  );
}

/* --------------------------------------------------------------- today -- */

function TodayScreen({ api, onOpen }: { api: Api; onOpen: (id: string) => void }) {
  const { data, error, busy } = useRead<Overview>(api, 'overview', { period: 'month' }, []);
  const fresh = useRead<{ rows: LeadRow[] }>(api, 'leads', { status: 'NEW', page: 1 }, []);

  if (busy) return <Loading />;
  if (error) return <Problem text={error} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <section>
        <p className={label}>Ждут первого ответа</p>
        <p className="tabular mt-1 text-[clamp(3rem,18vw,5rem)] leading-none font-bold tracking-[-0.04em]">
          {data.waiting}
        </p>
      </section>

      {fresh.data && fresh.data.rows.length > 0 && (
        <section className="space-y-2">
          {fresh.data.rows.slice(0, 6).map((row) => (
            <LeadLine key={row.id} row={row} onOpen={onOpen} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-2 gap-2">
        <Figure title="Новых" value={data.fresh} />
        <Figure title="В работе" value={data.active} />
        <Figure title="Завершено" value={data.completed} />
        <Figure title="Конверсия" value={`${data.conversion}%`} />
      </section>

      <section className={card}>
        <p className={label}>Воронка</p>
        <dl className="mt-3 space-y-1.5">
          {data.funnel.map((row) => (
            <div key={row.status} className="flex justify-between gap-4 text-sm">
              <dt className="text-paper/60">{statusLabel[row.status]}</dt>
              <dd className="tabular">{row.count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={card}>
        <p className={label}>Деньги за месяц</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Line term="Получено" value={sums(data.received)} />
          <Line term="Потрачено" value={sums(data.spent)} />
          <Line term="Ожидается" value={sums(data.expected)} />
          <Line term="Просрочено" value={sums(data.overdue)} />
        </dl>
      </section>
    </div>
  );
}

function Figure({ title, value }: { title: string; value: number | string }) {
  return (
    <div className={card}>
      <p className={label}>{title}</p>
      <p className="tabular mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

/* --------------------------------------------------------------- leads -- */

function LeadsScreen({ api, onOpen }: { api: Api; onOpen: (id: string) => void }) {
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const { data, error, busy } = useRead<{ rows: LeadRow[]; total: number }>(
    api,
    'leads',
    { q: query, status, page: 1 },
    [query, status],
  );

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(typed.trim());
        }}
      >
        {/* The register's own search already matches the reference, so this one
            field does what the bot needed a whole "which number?" dialogue for. */}
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="Имя или номер заявки"
          enterKeyHint="search"
          className={field}
        />
      </form>

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {['all', ...leadStatuses].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatus(id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              status === id ? 'border-paper bg-paper text-ink' : 'border-white/15 text-paper/55'
            }`}
          >
            {id === 'all' ? 'Все' : statusLabel[id as LeadStatusName]}
          </button>
        ))}
      </div>

      {busy && <Loading />}
      {error && <Problem text={error} />}
      {data && data.rows.length === 0 && <Problem text="Пусто." />}
      {data && data.rows.length > 0 && (
        <div className="space-y-2">
          {data.rows.map((row) => (
            <LeadLine key={row.id} row={row} onOpen={onOpen} />
          ))}
          <p className="pt-2 text-center text-xs text-paper/40">
            Показаны {data.rows.length} из {data.total}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- one client -- */

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

  if (busy) return <Loading />;
  if (error) return <Problem text={error} />;
  if (!data) return <Problem text="Заявка не найдена." />;

  /*
   * Not nine statuses in a row. The next few steps along the chain plus the two
   * ways out — the same shortlist the bot's card offered, for the same reason:
   * nine pills at this width is a wall, and a lead is moved forward far more
   * often than it is thrown across the board.
   */
  const at = activePipeline.indexOf(data.status);
  const next = at < 0 ? activePipeline.slice(0, 2) : activePipeline.slice(at + 1, at + 4);
  const choices = [...next, 'ON_HOLD' as const, 'DECLINED' as const].filter(
    (s) => s !== data.status,
  );

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-paper/55 hover:text-paper">
        ← К списку
      </button>

      <header>
        <p className="tabular text-xs text-paper/45">{data.ref}</p>
        <h1 className="mt-1 text-[clamp(1.5rem,6.5vw,2rem)] leading-tight font-bold tracking-[-0.03em]">
          {data.name}
        </h1>
        <p className="mt-1 text-sm text-paper/55">
          {data.projectType} · {data.budget} · {when(data.createdAt)}
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        {data.contact?.startsWith('@') && (
          <a
            href={`https://t.me/${data.contact.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={outline}
          >
            {data.contact}
          </a>
        )}
        <a href={`mailto:${data.email}`} className={outline}>
          Почта
        </a>
        {!data.firstRepliedAt && (
          <button
            type="button"
            disabled={working !== ''}
            onClick={() => void run('lead:replied', { id }, 'replied')}
            className={outline}
          >
            {working === 'replied' ? '…' : 'Отметить: ответил'}
          </button>
        )}
      </section>

      <section className={card}>
        <p className={label}>Статус · {statusLabel[data.status]}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {choices.map((to) => (
            <button
              key={to}
              type="button"
              disabled={working !== ''}
              onClick={() => void run('lead:status', { id, to }, to)}
              className={outline}
            >
              {working === to ? '…' : statusLabel[to]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-paper/40">
          Клиент получит сообщение об этом, если не отключал уведомления.
        </p>
      </section>

      <section className={card}>
        <p className={label}>Заметка</p>
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (note.trim()) void run('lead:note', { id, body: note }, 'note');
          }}
        >
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Только для вас — клиент этого не увидит"
            className={`${field} resize-y`}
          />
          <button type="submit" disabled={!note.trim() || working !== ''} className={solid}>
            {working === 'note' ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </form>

        {data.notes.length > 0 && (
          <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
            {data.notes.map((row) => (
              <li key={row.id} className="text-sm">
                <p className="text-xs text-paper/40">{when(row.createdAt)}</p>
                <p className="mt-1 whitespace-pre-wrap text-paper/80">{row.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className={card}>
        <summary className={`${label} cursor-pointer`}>Что написал клиент</summary>
        <dl className="mt-4 space-y-3 text-sm">
          <Field term="Цель" value={data.goal} />
          <Field term="О проекте" value={data.description} />
          <Field term="Аудитория" value={data.audience} />
          <Field term="Функции" value={data.features} />
          <Field term="Нравится" value={data.links} />
          <Field term="Ещё" value={data.extra} />
          <Field term="Срок" value={data.timeline} />
          <Field term="Компания" value={data.company} />
        </dl>
      </details>

      {problem && <Problem text={problem} />}
    </div>
  );
}

function Field({ term, value }: { term: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-paper/40">{term}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-paper/85">{value}</dd>
    </div>
  );
}

/* --------------------------------------------------------------- money -- */

function MoneyScreen({ api }: { api: Api }) {
  const { data, error, busy } = useRead<Finance>(api, 'finance', { period: 'month' }, []);

  if (busy) return <Loading />;
  if (error) return <Problem text={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <section className={card}>
        <p className={label}>За месяц</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Line term="Получено" value={sums(data.received)} />
          <Line term="Потрачено" value={sums(data.spent)} />
        </dl>
      </section>

      <section>
        <p className={label}>Ждут оплаты</p>
        {data.unpaid.length === 0 ? (
          <p className="mt-3 text-sm text-paper/45">Ничего не висит.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.unpaid.map((row) => {
              const late = row.dueAt !== null && new Date(row.dueAt) < new Date();
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/12 px-4 py-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{row.lead?.name ?? '—'}</span>
                    <span className="tabular block text-xs text-paper/45">
                      {row.dueAt ? `до ${when(row.dueAt)}` : 'без срока'}
                      {late ? ' · просрочено' : ''}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-sm font-medium">
                    {row.amount === null ? '—' : money(row.amount, row.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-xs text-paper/40">
        Записать расход или отметить платёж полученным пока можно только в веб-админке.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- site -- */

function SiteScreen({ api }: { api: Api }) {
  const { data, error, busy, reload } = useRead<Publishable>(api, 'publish', {}, []);
  const haptics = useHaptics();
  const [working, setWorking] = useState('');

  const toggle = async (command: string, id: string) => {
    setWorking(id);
    try {
      await api.call(command, { id });
      haptics.ok();
      reload();
    } catch {
      haptics.bad();
    } finally {
      setWorking('');
    }
  };

  if (busy) return <Loading />;
  if (error) return <Problem text={error} />;
  if (!data) return null;

  const waiting = data.reviews.filter((row) => !row.published).length;

  return (
    <div className="space-y-8">
      <section>
        <p className={label}>Отзывы · ждут проверки {waiting}</p>
        <div className="mt-3 space-y-2">
          {data.reviews.map((row) => (
            <div key={row.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {row.name}
                    {row.company ? ` · ${row.company}` : ''}
                  </p>
                  <p className="text-xs text-paper/45">
                    {row.rating ? '★'.repeat(row.rating) : ''}
                    {row.source === 'telegram'
                      ? ' · из Telegram'
                      : row.source === 'site'
                        ? ' · с сайта'
                        : ''}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={working === row.id}
                  onClick={() => void toggle('review:publish', row.id)}
                  className={row.published ? outline : solid}
                >
                  {working === row.id ? '…' : row.published ? 'Скрыть' : 'На сайт'}
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-paper/75">{row.text}</p>
            </div>
          ))}
          {data.reviews.length === 0 && <p className="text-sm text-paper/45">Отзывов пока нет.</p>}
        </div>
      </section>

      <section>
        <p className={label}>Проекты</p>
        <div className="mt-3 space-y-2">
          {data.cases.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/12 px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm">{row.title}</span>
                <span className="block text-xs text-paper/45">{row.year}</span>
              </span>
              <button
                type="button"
                disabled={working === row.id}
                onClick={() => void toggle('case:publish', row.id)}
                className={row.published ? outline : solid}
              >
                {working === row.id ? '…' : row.published ? 'Скрыть' : 'На сайт'}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-paper/40">
          Тексты проектов, цены и загрузка картинок остались в веб-админке: это работа за столом, а
          не в окне над чатом.
        </p>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------- bot -- */

function BotScreen({ api }: { api: Api }) {
  const { data, error, busy } = useRead<BotState>(api, 'bot', {}, []);

  if (busy) return <Loading />;
  if (error) return <Problem text={error} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <section className={card}>
        <dl className="space-y-1.5 text-sm">
          <Line term="Бот" value={data.username ? `@${data.username}` : '—'} />
          <Line term="Токен" value={data.token ? 'задан' : 'нет'} />
          <Line term="Секрет вебхука" value={data.secret ? 'задан' : 'нет'} />
          <Line term="Владельцев" value={String(data.admins)} />
          <Line term="В очереди" value={String(data.pending)} />
        </dl>
      </section>

      <section className={card}>
        <p className={label}>Вебхук</p>
        <p className="mt-2 text-sm break-all text-paper/75">{data.webhookUrl || '— не подключён'}</p>
        {data.lastError && (
          <p className="mt-3 text-sm text-paper/70">Последняя ошибка: {data.lastError}</p>
        )}
      </section>

      <p className="text-xs text-paper/40">
        Подключение и снятие вебхука — в веб-админке: это дверь, которая открывается паролем, и
        увести вебхук бота должно быть сложнее, чем нажать кнопку в телефоне.
      </p>
    </div>
  );
}
