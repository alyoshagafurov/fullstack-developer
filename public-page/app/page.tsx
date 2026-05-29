'use client';

import SmoothScroll from '@/components/SmoothScroll';
import SVGFilters from '@/components/SVGFilters';
import Loader from '@/components/Loader';
import Cursor from '@/components/Cursor';
import Starfield from '@/components/Starfield';
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
 * Page flow:
 *
 *   Hero       — the name + two-persona reveal
 *   About      — bio
 *   CodeWorld  — Dimension I · the code
 *   Services   — what I build
 *   Pricing    — three tiers
 *   Projects   — selected work (horizontal scroll)
 *   FightWorld — Dimension II · the fight
 *   Contact    — let's talk
 *   Finale     — two worlds, one mind · cinematic close
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SVGFilters />
      <Loader />
      <Cursor />

      <Starfield />
      <div className="grain" />
      <div className="vignette" />

      <Navbar />

      <main className="relative z-10">
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
