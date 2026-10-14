'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BRIEF_SCREENS,
  briefStepOf,
  checkContact,
  type BriefCopy,
} from '@/lib/content/brief';

/*
 * Everything the request form does, without how it looks.
 *
 * The site and the Telegram Mini App draw the form differently but must ask
 * the same four things in the same order and check them the same way, so the
 * steps, the checks, the draft and the sending live here once.
 *
 * Screens: 0 name · 1 where to reply · 2 what they need · 3 a few lines about
 * it, their questions, budget if they want.
 */

export type BriefValues = {
  name: string;
  contactMethod: string;
  contact: string;
  projectType: string;
  details: string;
  questions: string;
  budget: string;
};

export type BriefField = keyof BriefValues;
export type BriefSent = { ref: string; code: string };

const EMPTY: BriefValues = {
  name: '',
  contactMethod: '',
  contact: '',
  projectType: '',
  details: '',
  questions: '',
  budget: '',
};

export function useBrief({
  copy,
  serverWordsOk,
  draftKey,
  onSent,
}: {
  copy: BriefCopy;
  /** The server words its complaints in Russian; other languages show `check`. */
  serverWordsOk: boolean;
  draftKey: string;
  onSent: (sent: BriefSent, values: BriefValues) => void;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<BriefValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<BriefField, string>>>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const startedAt = useRef(Date.now());
  const restored = useRef(false);

  const last = step === BRIEF_SCREENS - 1;

  // A reload should not cost anyone their typing; the draft never leaves the browser.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        setValues({ ...EMPTY, ...(JSON.parse(raw) as Partial<BriefValues>) });
        restored.current = true;
      }
    } catch {
      // Blocked or full storage is not a reason to fail a form.
    }
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

  function problems(at: number): Partial<Record<BriefField, string>> {
    const found: Partial<Record<BriefField, string>> = {};
    if (at === 0 && values.name.trim().length < 2) found.name = copy.errors.name;
    if (at === 1) {
      if (!values.contactMethod) found.contactMethod = copy.errors.method;
      else {
        const problem = checkContact(values.contactMethod, values.contact);
        if (problem) found.contact = copy.errors[problem];
      }
    }
    if (at === 2 && !values.projectType) found.projectType = copy.errors.type;
    if (at === 3 && values.details.trim().length < 5) found.details = copy.errors.details;
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

  return { step, last, values, set, prefill, errors, formError, sending, advance, back, dirty };
}
