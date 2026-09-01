import { STATUS_LABEL, type LeadStatus } from '@/lib/admin-api/types';

/*
 * A status, rendered so it survives being read without colour.
 *
 * The word is always present — colour and the marker's shape are redundant
 * cues layered on top. A greyscale screenshot, a colour-blind operator and a
 * screen reader all get the same information.
 */

const TONE: Record<LeadStatus, 'open' | 'active' | 'done' | 'closed'> = {
  NEW: 'open',
  CONTACTED: 'active',
  DISCOVERY: 'active',
  PROPOSAL: 'active',
  IN_PROGRESS: 'active',
  COMPLETED: 'done',
  DECLINED: 'closed',
};

export function statusTone(status: LeadStatus) {
  return TONE[status] ?? 'active';
}

export default function StatusPill({ status }: { status: LeadStatus }) {
  const label = STATUS_LABEL[status] ?? status;
  return (
    <span className="a-status" data-tone={statusTone(status)}>
      <span className="a-status-mark" aria-hidden />
      {label}
    </span>
  );
}
