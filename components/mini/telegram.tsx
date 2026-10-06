'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

/*
 * The Telegram side of the Mini App, and nothing else.
 *
 * Telegram hands a Mini App one global, `window.Telegram.WebApp`, and a signed
 * `initData` string describing who opened it. This module loads that global,
 * tells Telegram the page is ready, and hands the rest of the app two things: a
 * typed handle on the object, and the raw `initData` to send to the server.
 *
 * Nothing here trusts `initDataUnsafe`. It is the same fields already parsed,
 * and Telegram's own documentation says not to: it is whatever the page was
 * handed, with no signature over it. It is good enough to put a name into a
 * field the person can then correct, and that is all it is used for. Everything
 * that reaches the database is decided from `initData` on the server, in
 * lib/telegram/miniapp.ts.
 *
 * Versions are the awkward part of this platform. A method that does not exist
 * on an old client is simply not there, and the documentation does not say what
 * happens if you call it, so every call past the 6.0 baseline goes through
 * `isVersionAtLeast`. Every fallback is "do nothing", because every one of
 * these is a courtesy: the form works without the header being the right black.
 */

type BottomButton = {
  setText(text: string): BottomButton;
  onClick(cb: () => void): BottomButton;
  offClick(cb: () => void): BottomButton;
  show(): BottomButton;
  hide(): BottomButton;
};

type BackButton = {
  onClick(cb: () => void): BackButton;
  offClick(cb: () => void): BackButton;
  show(): BackButton;
  hide(): BackButton;
};

export type TelegramUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  disableVerticalSwipes(): void;
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  MainButton?: BottomButton;
  BackButton?: BackButton;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** Telegram's own loader. The suffix is theirs; a cache-buster, not a pin. */
const SDK_URL = 'https://telegram.org/js/telegram-web-app.js?63';

/** The site's black, so Telegram's chrome stops where the page starts. */
const VOID = '#050505';

/**
 * Fetch the global once per document, however many components ask for it.
 *
 * Telegram's documentation puts this script in `<head>` before everything else,
 * which is advice written for a hand-made page. What actually matters is that
 * it has run before anyone reads the global — it finds its data in the launch
 * URL's fragment, which is there from the first byte and does not expire while
 * a script loads. So the page waits for it rather than racing it.
 */
let pending: Promise<TelegramWebApp | null> | null = null;

function loadSdk(): Promise<TelegramWebApp | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram.WebApp);
  if (pending) return pending;

  pending = new Promise((resolve) => {
    const done = () => resolve(window.Telegram?.WebApp ?? null);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener('error', () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.addEventListener('load', done, { once: true });
    // Opened outside Telegram, or offline. The page is a plain form then.
    script.addEventListener('error', () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

  return pending;
}

type Bridge = {
  /** The object, or null when the script could not be fetched at all. */
  app: TelegramWebApp | null;
  /**
   * Whether this really is a Mini App window.
   *
   * Not the same question as whether `app` exists. Telegram's script loads
   * perfectly well in an ordinary browser and leaves the global in place with
   * every method callable and `initData` empty — which is how a page ends up
   * offering a "close the window" button to someone who opened it in Safari,
   * and telling them their reference number went to a chat that was never
   * involved. A signature is the thing only a real launch carries.
   */
  inside: boolean;
  /** True once the attempt has finished, one way or the other. */
  settled: boolean;
};

const TelegramContext = createContext<Bridge>({ app: null, inside: false, settled: false });

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [bridge, setBridge] = useState<Bridge>({ app: null, inside: false, settled: false });

  useEffect(() => {
    let cancelled = false;

    void loadSdk().then((app) => {
      if (cancelled) return;

      if (app) {
        try {
          app.ready();
          app.expand();

          /*
           * Take the signature out of the address.
           *
           * Telegram delivers `initData` in the URL fragment, and the SDK has
           * read it into memory by the time `ready()` returns — after which the
           * fragment is only a liability. It stays in the webview's history, it
           * rides along if the owner uses "open in browser" and pastes the
           * address somewhere, and on the admin screen it is an hour-long key
           * to every client's details. The object keeps working; only the copy
           * lying in the open goes away.
           */
          if (window.location.hash.includes('tgWebApp')) {
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search,
            );
          }

          if (app.isVersionAtLeast('6.1')) {
            app.setBackgroundColor(VOID);
            // An arbitrary hex only lands from 6.9; before that the two
            // keywords are all Telegram accepts, and neither is this black.
            if (app.isVersionAtLeast('6.9')) app.setHeaderColor(VOID);
          }
          if (app.isVersionAtLeast('7.10')) app.setBottomBarColor(VOID);

          /*
           * A vertical drag closes a Mini App. That is the right default for a
           * page you read and the wrong one for thirteen questions you have
           * answered: one careless swipe and the lot is gone. Each screen here
           * is short enough not to need the gesture for scrolling.
           */
          if (app.isVersionAtLeast('7.7')) app.disableVerticalSwipes();
        } catch {
          // A client that disagrees with itself about its own version.
        }
      }

      setBridge({ app, inside: Boolean(app?.initData), settled: true });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <TelegramContext.Provider value={bridge}>{children}</TelegramContext.Provider>;
}

export function useTelegram(): Bridge {
  return useContext(TelegramContext);
}

/**
 * What Telegram says about the person, for filling in fields they can edit.
 *
 * Unsigned by construction — see the note at the top of this file. A name here
 * saves a client typing their own name into a form they opened from their own
 * account, which is the most obvious thing a Mini App should do with it.
 */
export function useMiniAppUser(): TelegramUser | null {
  const { app } = useTelegram();
  return app?.initDataUnsafe?.user ?? null;
}

/**
 * Wire Telegram's own back arrow to a step machine.
 *
 * One handler for the life of the component, reading the current action out of
 * a ref. `offClick` matches on function identity and only exists from 6.1, so
 * registering a fresh closure per step is how a Mini App ends up with six
 * subscriptions and one tap that runs all of them.
 */
export function useBackButton(visible: boolean, action: () => void): void {
  const { app } = useTelegram();
  const latest = useRef(action);

  useEffect(() => {
    latest.current = action;
  }, [action]);

  useEffect(() => {
    const button = app?.BackButton;
    if (!app || !button || !app.isVersionAtLeast('6.1')) return;

    const fire = () => latest.current();
    button.onClick(fire);

    return () => {
      button.hide();
      button.offClick(fire);
    };
  }, [app]);

  useEffect(() => {
    const button = app?.BackButton;
    if (!app || !button || !app.isVersionAtLeast('6.1')) return;
    if (visible) button.show();
    else button.hide();
  }, [app, visible]);
}

/**
 * Ask Telegram to confirm a close while there is unsent work.
 *
 * Available from 6.2. Below that the swipe guard in the provider is the only
 * protection there is, and on a client that old there is nothing else to offer.
 */
export function useClosingGuard(dirty: boolean): void {
  const { app } = useTelegram();

  useEffect(() => {
    if (!app || !app.isVersionAtLeast('6.2')) return;
    if (dirty) app.enableClosingConfirmation();
    else app.disableClosingConfirmation();
  }, [app, dirty]);
}

/** A tap worth feeling. Absent on old clients and on desktop; never required. */
export function useHaptics(): { tap: () => void; ok: () => void; bad: () => void } {
  const { app } = useTelegram();

  const run = (fn: (h: NonNullable<TelegramWebApp['HapticFeedback']>) => void) => () => {
    const haptics = app?.HapticFeedback;
    if (!haptics || !app?.isVersionAtLeast('6.1')) return;
    try {
      fn(haptics);
    } catch {
      /* A client that lists the object without the method. */
    }
  };

  return {
    tap: run((h) => h.selectionChanged()),
    ok: run((h) => h.notificationOccurred('success')),
    bad: run((h) => h.notificationOccurred('error')),
  };
}
