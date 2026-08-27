/*
 * Request references: ALY-2026-4F7K2.
 *
 * Server-only by convention — a reference must never exist unless a brief was
 * actually stored, so nothing on the client may call this. Phase 8 issues one
 * inside the same transaction that persists the brief.
 *
 * The alphabet drops I, O, 0 and 1 so a reference survives being read down a
 * phone line or typed back from a screenshot.
 */

import { REFERENCE_PREFIX } from './schema';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TAIL_LENGTH = 5;

export function makeReference(now: Date = new Date()): string {
  let tail = '';
  for (let i = 0; i < TAIL_LENGTH; i += 1) {
    tail += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${REFERENCE_PREFIX}-${now.getUTCFullYear()}-${tail}`;
}
