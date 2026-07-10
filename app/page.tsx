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
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

/**
 * Home — a premium, monochrome, single-page portfolio built to sell:
 *
 *   Hero         — clean product-style first screen
 *   Marquee      — stack trust strip
 *   Stats        — animated numbers
 *   Services     — what I do (glass cards)
 *   Projects     — featured work → /work/[slug] case studies
 *   Process      — how a project runs
 *   TechStack    — full stack by layer
 *   WhyMe        — reasons to choose me
 *   Testimonials — client voices
 *   Pricing      — three transparent tiers
 *   FAQ          — common questions
 *   About        — bio
 *   Contact      — real form (+ Telegram/email)
 *   Footer       — nav + socials
 */
export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <main className="relative">
        <Hero />
        <Marquee />
        <Stats />
        <Services />
        <Projects />
        <Process />
        <TechStack />
        <WhyMe />
        <Testimonials />
        <Pricing />
        <FAQ />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
