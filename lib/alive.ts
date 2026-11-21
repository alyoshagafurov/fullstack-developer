/*
 * Whether a project's live site answers right now. A dead link on a portfolio
 * costs more than no link, so "Open the site" is shown only when this is true.
 * Checked at render; the page revalidates every few minutes.
 */
export async function isAlive(url: string | null | undefined): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(5000), next: { revalidate: 300 } });
    return res.status < 400;
  } catch {
    return false;
  }
}
