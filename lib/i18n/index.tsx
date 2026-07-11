'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Dict, Lang } from './types';
import { ru } from './ru';
import { tg } from './tg';
import { en } from './en';

export type { Lang, Dict } from './types';

export const LANGS: Lang[] = ['ru', 'tg', 'en'];
const DICTS: Record<Lang, Dict> = { ru, tg, en };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx>({ lang: 'ru', setLang: () => {}, t: ru });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start on 'ru' to match the server render, then adopt the saved choice.
  const [lang, setLangState] = useState<Lang>('ru');

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) as Lang | null;
    if (saved && DICTS[saved]) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {
      /* ignore */
    }
  };

  return <I18nContext.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
