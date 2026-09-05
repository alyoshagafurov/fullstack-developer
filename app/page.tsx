import Header from '@/components/chrome/Header';
import Identity from '@/components/sections/Identity';
import Capabilities from '@/components/sections/Capabilities';
import Method from '@/components/sections/Method';
import Studio from '@/components/sections/Studio';
import Principles from '@/components/sections/Principles';
import Technology from '@/components/sections/Technology';
import StartProject from '@/components/sections/StartProject';
import SiteFooter from '@/components/sections/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { listPublishedCases } from '@/lib/cases';
import { SITE_URL } from '@/lib/seo';

const profilePage = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: 'Alisher Gafurov (ALY) — Full-Stack разработчик',
  inLanguage: 'ru',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#person` },
  mainEntity: { '@id': `${SITE_URL}/#person` },
};

/*
 * The site is one room, read top to bottom.
 *
 * The order below is the story, and the rhythm between blocks is deliberately
 * uneven — see the beat-* classes inside each section. Nothing here is a
 * repeated section template; every block owns its own layout, and every one
 * of them is lit by the same field.
 *
 * The page knows whether the register has anything in it, so the hero never
 * sends a visitor to an empty room: while there are no published cases its
 * second action leads to the fourteen services instead. Revalidated hourly,
 * like the sitemap — cases are published from the admin, not from a commit.
 */
export const revalidate = 3600;

export default async function Home() {
  const cases = await listPublishedCases();
  const hasCases = cases.length > 0;

  return (
    <>
      <JsonLd data={profilePage} />
      <Header />
      <main id="main">
        <Identity hasCases={hasCases} />
        <Capabilities />
        <Method />
        <Studio />
        <Principles />
        <Technology />
        <StartProject />
      </main>
      <SiteFooter />
    </>
  );
}
