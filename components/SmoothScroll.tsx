'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Drives Lenis smooth scrolling and connects it to GSAP ScrollTrigger
 * so all pinned/scrubbed animations stay in sync.
 *
 * Mount once near the top of the tree.
 *
 * Not on /admin. Eased scrolling is right for an editorial page you read
 * top to bottom; in a CRM it fights the operator — a wheel flick past a long
 * register keeps travelling after they stop, and a sticky rail lags behind
 * the content it is pinned to. The public site's behaviour is unchanged.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (isAdmin) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Expose for occasional anchor jumps
    (window as any).lenis = lenis;

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, [isAdmin]);

  return null;
}
