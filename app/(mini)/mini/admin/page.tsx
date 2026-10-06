'use client';

import { AdminApp } from '@/components/mini/admin/AdminApp';

/*
 * The owner's panel.
 *
 * `'use client'` is a security boundary here, not a rendering preference.
 * Everything on this screen is the owner's clients — their names, their email
 * addresses, what they are paying — and a server component would fetch all of
 * it while rendering, for whoever asked. There is no session cookie inside
 * Telegram to check against, so the page would have no way of knowing it was
 * answering a stranger.
 *
 * So the page ships as markup with nothing in it, and every figure arrives
 * afterwards from POST /api/mini/admin, which verifies the signature Telegram
 * put on this launch and that the person behind it is in TELEGRAM_ADMIN_IDS.
 *
 * The rule that keeps it that way is mechanical, and meant to be run: nothing
 * under this route group may import the database client or the admin query
 * module. Grepping app/(mini) for either of those two module paths is expected
 * to come back with no hits at all — which is also why neither is spelled out
 * in this comment.
 */
export default function MiniAdminPage() {
  return <AdminApp />;
}
