'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BRIEF_SCREENS,
  briefStepOf,
  briefTypes,
  checkContact,
  type BriefCopy,
} from '@/lib/content/brief';

/*
 * Everything the request form does, without how it looks.
 *
 * The site and the Telegram Mini App draw the form differently but must ask
 * the same five things in the same order and check them the same way, so the
 * steps, the checks, the draft and the sending live here once.
 *
 * Screens (BRIEF_SCREENS): 0 what they need · 1 a few lines and their
 * questions, both optional · 2 what matters most · 3 budget · 4 name and
 * where to reply. The contact comes last on purpose — see lib/content/brief.ts.
 */

export type BriefValues = {
  projectType: string;
  details: string;
  questions: string;
  priority: string;
  budget: string;
  name: string;
  contactMethod: string;
  contact: string;
};

export type BriefField = keyof BriefValues;
export type BriefSent = { ref: string; code: string };

const EMPTY: BriefValues = {
  projectType: '',
  details: '',
  questions: '',
  priority: '',
  budget: '',
  name: '',
  contactMethod: '',
  contact: '',
};

function stripEmpty(values?: Partial<BriefValues>): Partial<BriefValues> {
  if (!values) return {};
  return Object.fromEntries(Object.entries(values).filter(([, value]) => Boolean(value)));
}

export function useBrief({
  copy,
  serverWordsOk,
  draftKey,
  initial,
  onSent,
}: {
  copy: BriefCopy;
  /** The server words its complaints in Russian; other languages show `check`. */
  serverWordsOk: boolean;
  draftKey: string;
  /** Answers known before the form opens, such as a direction picked on the home page. */
  initial?: Partial<BriefValues>;
  onSent: (sent: BriefSent, values: BriefValues) => void;
}) {
  const [step, setStep] = useState(0);
  // Answers known before opening are there from the first paint; the server renders the same props.
  const [values, setValues] = useState<BriefValues>(() => ({ ...EMPTY, ...stripEmpty(initial) }));
  const [errors, setErrors] = useState<Partial<Record<BriefField, string>>>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const startedAt = useRef(Date.now());
  const restored = useRef(false);

  const last = step === BRIEF_SCREENS - 1;

  /*
   * The first screen offers seven types, but older links (?type=…) can preset
   * any of the full list. Such a preset stays on screen, picked, above the
   * seven — and stays there if they pick another, so the list never jumps.
   * A preset from the link is known on the first paint; one from a restored
   * draft arrives with the effect below.
   */
  const [presetType, setPresetType] = useState<string | null>(() =>
    initial?.projectType && !(briefTypes as readonly string[]).includes(initial.projectType)
      ? initial.projectType
      : null,
  );
  useEffect(() => {
    if (values.projectType && !(briefTypes as readonly string[]).includes(values.projectType)) {
      setPresetType(values.projectType);
    }
  }, [values.projectType]);
  const types: readonly string[] = presetType ? [presetType, ...briefTypes] : briefTypes;

  // A reload should not cost anyone their typing; the draft never leaves the browser.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        setValues({ ...EMPTY, ...(JSON.parse(raw) as Partial<BriefValues>), ...stripEmpty(initial) });
        restored.current = true;
      }
    } catch {
      // Blocked or full storage is not a reason to fail a form.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- read once, on open
  }, [draftKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [draftKey, values]);

  const set = (field: BriefField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setFormError('');
  };

  /** Fill only what is still empty — for what Telegram already knows. */
  const prefill = (known: Partial<BriefValues>) => {
    if (restored.current) return;
    setValues((v) => {
      const next = { ...v };
      for (const [key, value] of Object.entries(known) as [BriefField, string][]) {
        if (!next[key] && value) next[key] = value;
      }
      return next;
    });
  };

  /** Screen 1 asks nothing it insists on: a request without a paragraph is still a request. */
  function problems(at: number): Partial<Record<BriefField, string>> {
    const found: Partial<Record<BriefField, string>> = {};
    if (at === 0 && !values.projectType) found.projectType = copy.errors.type;
    if (at === 2 && !values.priority) found.priority = copy.errors.priority;
    if (at === 3 && !values.budget) found.budget = copy.errors.budget;
    if (at === 4) {
      if (values.name.trim().length < 2) found.name = copy.errors.name;
      if (!values.contactMethod) found.contactMethod = copy.errors.method;
      else {
        const problem = checkContact(values.contactMethod, values.contact);
        if (problem) found.contact = copy.errors[problem];
      }
    }
    return found;
  }

  /** Moves on, or sends from the last screen. False when something needs fixing. */
  function advance(extraBody: Record<string, unknown> = {}, honeypot = ''): boolean {
    const found = problems(step);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return false;
    }
    setErrors({});
    if (last) void send(extraBody, honeypot);
    else setStep((i) => i + 1);
    return true;
  }

  function back() {
    setErrors({});
    setFormError('');
    setStep((i) => Math.max(0, i - 1));
  }

  async function send(extraBody: Record<string, unknown>, honeypot: string) {
    setSending(true);
    setFormError('');
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...values,
          website: honeypot,
          startedAt: startedAt.current,
          ...extraBody,
        }),
      });
      const payload = (await response.json()) as {
        ref?: string;
        code?: string;
        error?: string;
        issues?: Record<string, string>;
      };

      if (!response.ok) {
        // A server complaint belongs on the screen and the field that caused it.
        const first = payload.issues ? Object.keys(payload.issues)[0] : undefined;
        if (first && first in briefStepOf && payload.issues) {
          setStep(briefStepOf[first]);
          setErrors({ [first]: serverWordsOk ? payload.issues[first] : copy.errors.check });
        }
        setFormError((serverWordsOk && payload.error) || copy.errors.failed);
        setSending(false);
        return;
      }

      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      onSent({ ref: payload.ref ?? '', code: payload.code ?? '' }, values);
    } catch {
      setFormError(copy.errors.offline);
      setSending(false);
    }
  }

  const dirty = Object.values(values).some(Boolean);

  return { step, last, values, types, set, prefill, errors, formError, sending, advance, back, dirty };
}
