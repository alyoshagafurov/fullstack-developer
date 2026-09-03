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
 * The site is one continuous composition, read top to bottom.
 *
 * The order below is the story, and the rhythm between blocks is deliberately
 * uneven — see the py-rhythm-* tokens inside each section. Nothing here is a
 * repeated section template; every block owns its own layout.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={profilePage} />
      <Header />
      <main id="main">
        <Identity />
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
