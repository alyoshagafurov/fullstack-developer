import { Welcome } from '@/components/mini/Welcome';
import { getPriceList } from '@/lib/prices';

/*
 * What the blue button in a visitor's chat opens.
 *
 * Server-rendered for one public number, and only that: the lowest price on the
 * owner's own list, for the line «цены от …» under the headline. He edits
 * prices in the admin, so a figure written into the page would be wrong the
 * first time he changed one.
 *
 * This is the one page in the group allowed to read on the server, and the
 * distinction is worth stating, because /mini/admin is built on the opposite
 * rule. That page's data is the owner's clients and must never be rendered for
 * whoever asks. This page's data is a price already published on /prices —
 * nothing here belongs to anyone but the public.
 */

export const revalidate = 300;

/** «От 700 сомони» — the cheapest entry, as written, so the wording stays his. */
async function lowestPrice(): Promise<string | null> {
  try {
    const priced = (await getPriceList())
      .map((s) => ({ text: s.price, amount: Number((s.price ?? '').replace(/\D/g, '')) }))
      .filter((p): p is { text: string; amount: number } => Boolean(p.text) && p.amount > 0);
    if (priced.length === 0) return null;
    return priced.reduce((low, p) => (p.amount < low.amount ? p : low)).text;
  } catch {
    // No database: the cover goes out without a figure rather than not at all.
    return null;
  }
}

export default async function MiniWelcomePage() {
  return <Welcome from={await lowestPrice()} />;
}
