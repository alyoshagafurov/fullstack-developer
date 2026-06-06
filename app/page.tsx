'use client';

import SmoothScroll from '@/components/SmoothScroll';
import Loader from '@/components/Loader';
import Cursor from '@/components/Cursor';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollFX from '@/components/ScrollFX';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import CodeWorld from '@/components/CodeWorld';
import Services from '@/components/Services';
import Pricing from '@/components/Pricing';
import Projects from '@/components/Projects';
import FightWorld from '@/components/FightWorld';
import Contact from '@/components/Contact';
import Finale from '@/components/Finale';

/**
 * Page flow — clean, top-to-bottom, no pinned/horizontal scroll tricks:
 *
 *   Hero        — the name + two-persona reveal (kept: hover + intro animation)
 *   About       — bio
 *   CodeWorld   — what I build (calm statement + pillars)
 *   Services    — services
 *   Pricing     — three tiers
 *   Projects    — selected work (simple vertical cards)
 *   FightWorld  — discipline (the fighter side, calm)
 *   Contact     — let's talk
 *   Finale      — warm closing band
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <Loader />
      <ScrollProgress />
      <ScrollFX />

      <Navbar />

      <main className="relative">
        <Hero />
        <About />
        <CodeWorld />
        <Services />
        <Pricing />
        <Projects />
        <FightWorld />
        <Contact />
        <Finale />
      </main>
    </>
  );
}
