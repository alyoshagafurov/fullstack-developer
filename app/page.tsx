import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Stats from '@/components/Stats';
import Services from '@/components/Services';
import Projects from '@/components/Projects';
import Process from '@/components/Process';
import TechStack from '@/components/TechStack';
import WhyMe from '@/components/WhyMe';
import Testimonials from '@/components/Testimonials';
import PricingTeaser from '@/components/PricingTeaser';
import FAQ from '@/components/FAQ';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
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
 * Landing — keeps all the full sections. The only change vs a standalone page:
 * the pricing block is a short teaser (range + button to /pricing), and the
 * sections that have a dedicated page carry a "Подробнее →" button. The header
 * menu still navigates to the dedicated pages.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={profilePage} />
      <Loader />
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <Marquee />
        <Stats />
        <Services moreHref="/services" />
        <Projects moreHref="/work" />
        <Process />
        <TechStack />
        <WhyMe />
        <Testimonials />
        <PricingTeaser />
        <FAQ />
        <About moreHref="/about" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
