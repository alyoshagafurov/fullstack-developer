import { Welcome, type MiniIntro, type MiniWork } from '@/components/mini/Welcome';
import { blurOf } from '@/lib/blur';
import { ru } from '@/lib/i18n/ru';
import { getPriceList } from '@/lib/prices';

/*
 * What the blue button in a visitor's chat opens.
 *
 * Server-rendered for one public number, and only that: the lowest price on the
 * owner's own list, for the line «цены от …» under «Все работы и цены». He edits
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

/*
 * The site's first screen in its own words — read here, on the server, so the
 * dictionary never reaches the browser and an edit to the hero is an edit to
 * this screen too. Its figures without the languages: the header here already
 * names them, and three cells are what a phone's width holds.
 */
const [days, projects, , payment] = ru.showroom.specs;
const INTRO: MiniIntro = {
  eyebrow: ru.showroom.eyebrow,
  headline: ru.showroom.title,
  sub: ru.showroom.sub,
  facts: [days, projects, payment],
};

/* The three projects on the site's home page, captured on a computer and a phone. */
const WORKS = [
  { title: 'ArusDomod', kind: 'Магазин свадебных нарядов', host: 'arusdomod.shop', desktop: '/cases/arusdomod-desktop.webp', phone: '/cases/arusdomod-phone.webp' },
  { title: 'AutoShine', kind: 'Магазин автокосметики', host: 'autoshine-production.up.railway.app', desktop: '/cases/autoshine-store-desktop.webp', phone: '/cases/autoshine-store-phone.webp' },
  { title: 'mimi', kind: 'Маркетинговое агентство', host: 'mimitj.agency', desktop: '/cases/mimi-desktop.webp', phone: '/cases/mimi-phone.webp' },
];

export default async function MiniWelcomePage() {
  const [from, works] = await Promise.all([
    lowestPrice(),
    Promise.all(
      WORKS.map(async (w): Promise<MiniWork> => ({ ...w, blur: await blurOf(w.desktop), phoneBlur: await blurOf(w.phone) })),
    ),
  ]);
  return <Welcome intro={INTRO} from={from} works={works} />;
}
