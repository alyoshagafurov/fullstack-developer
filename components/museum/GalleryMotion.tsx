'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/*
 * How the museum moves. One script, mounted once in the site layout, reading
 * a handful of attributes from the markup:
 *
 *   data-rise           headline lines (.line-mask > span) rise into their masks
 *   data-fade           an element settles up into place
 *   data-lit            a wall whose light follows the pointer (--lx / --ly)
 *   data-gallery        a hall whose track walks sideways while the page scrolls
 *   data-draw           an SVG path drawn by the scroll
 *   data-magnetic       a button that leans toward the pointer
 *   data-parallax="n"   drifts n% against the scroll
 *   data-zoom           a picture that grows to full width as it scrolls in
 *   data-colour         a screenshot that turns from grey to colour mid-screen
 *
 * The rule that matters most: nothing is hidden before this runs. Reveals are
 * set only on elements that start below the fold, and only once the script is
 * here to bring them back, so a slow phone sees the page, not a blank wall.
 */

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Scroll the page to a position, smoothly when the smooth scroll is running. */
export function scrollPageTo(top: number) {
  if (lenis) lenis.scrollTo(top, { duration: 2.2 });
  else window.scrollTo({ top, behavior: 'smooth' });
}

export function GalleryMotion() {
  const pathname = usePathname();

  // Smooth scroll for wheels and trackpads only; touch keeps its native feel.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ lerp: 0.11, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const fold = window.innerHeight * 0.92;
      const below = (el: Element) => el.getBoundingClientRect().top > fold;

      if (!reduce) {
        document.querySelectorAll<HTMLElement>('[data-rise]').forEach((el) => {
          if (!below(el)) return;
          const lines = el.querySelectorAll('.line-mask > span');
          gsap.from(lines.length ? lines : el, {
            yPercent: lines.length ? 105 : 0,
            y: lines.length ? 0 : 36,
            opacity: lines.length ? 1 : 0,
            duration: 1.25,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });

        document.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
          if (!below(el)) return;
          gsap.from(el, {
            y: 48,
            opacity: 0,
            filter: 'blur(6px)',
            duration: 1.3,
            ease: 'expo.out',
            delay: Number(el.dataset.fade) || 0,
            clearProps: 'filter',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });

        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const amount = Number(el.dataset.parallax) || 10;
          gsap.fromTo(
            el,
            { yPercent: -amount / 2 },
            {
              yPercent: amount / 2,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        // A picture that grows to fill the screen as it scrolls in, the way Apple shows a product.
        document.querySelectorAll<HTMLElement>('[data-zoom]').forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 0.84, borderRadius: '36px' },
            {
              scale: 1,
              borderRadius: '0px',
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 15%', scrub: 0.5 },
            },
          );
        });

        document.querySelectorAll<SVGPathElement>('[data-draw]').forEach((path) => {
          const length = path.getTotalLength();
          gsap.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              ease: 'none',
              scrollTrigger: { trigger: path.closest('section') ?? path, start: 'top 75%', end: 'center 45%', scrub: 0.6 },
            },
          );
        });

        // The work hall: on a wide screen the page holds still and the wall walks.
        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', () => {
          document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((hall) => {
            const track = hall.querySelector<HTMLElement>('[data-gallery-track]');
            if (!track) return;
            hall.setAttribute('data-pinned', '');
            const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
            const walk = gsap.to(track, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: hall,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            });
            // Along the walking wall, each lamp switches on as its work passes the middle.
            track.querySelectorAll<HTMLElement>('[data-lamp]').forEach((exhibit) => {
              ScrollTrigger.create({
                trigger: exhibit,
                containerAnimation: walk,
                // A narrow band at the middle: only the work standing there is lit.
                start: 'left 56%',
                end: 'right 44%',
                onToggle: (self) => exhibit.classList.toggle('is-lit', self.isActive),
              });
            });
            return () => hall.removeAttribute('data-pinned');
          });
        });
        cleanups.push(() => mm.revert());

        // Everywhere else the lamps answer the vertical scroll (and the phone's swipe).
        document.documentElement.classList.add('lamps');
        cleanups.push(() => document.documentElement.classList.remove('lamps'));
        document.querySelectorAll<HTMLElement>('[data-lamp]').forEach((exhibit) => {
          if (exhibit.closest('[data-pinned]')) return;
          const track = exhibit.closest<HTMLElement>('[data-gallery-track]');
          if (track) {
            const io = new IntersectionObserver(
              ([entry]) => exhibit.classList.toggle('is-lit', Boolean(entry?.isIntersecting)),
              { root: track, threshold: 0.6 },
            );
            io.observe(exhibit);
            cleanups.push(() => io.disconnect());
            return;
          }
          ScrollTrigger.create({
            trigger: exhibit,
            start: 'top 72%',
            end: 'bottom 28%',
            onToggle: (self) => exhibit.classList.toggle('is-lit', self.isActive),
          });
        });
      }

      // Screenshots wait in grey and come into colour in the middle of the screen.
      const colour = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.target.classList.toggle('is-on', entry.isIntersecting)),
        { rootMargin: '-25% 0px -40% 0px' },
      );
      document.querySelectorAll('[data-colour]').forEach((el) => colour.observe(el));
      cleanups.push(() => colour.disconnect());

      // The light follows the pointer across any lit wall.
      document.querySelectorAll<HTMLElement>('[data-lit]').forEach((wall) => {
        if (reduce || matchMedia('(hover: none)').matches) return;
        const toX = gsap.quickTo(wall, '--lx', { duration: 0.9, ease: 'power3.out' });
        const toY = gsap.quickTo(wall, '--ly', { duration: 0.9, ease: 'power3.out' });
        const move = (event: PointerEvent) => {
          const box = wall.getBoundingClientRect();
          toX(((event.clientX - box.left) / box.width) * 100);
          toY(((event.clientY - box.top) / box.height) * 100);
        };
        wall.addEventListener('pointermove', move);
        cleanups.push(() => wall.removeEventListener('pointermove', move));
      });

      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        if (reduce || matchMedia('(hover: none)').matches) return;
        const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
        const move = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          toX((event.clientX - (box.left + box.width / 2)) * 0.22);
          toY((event.clientY - (box.top + box.height / 2)) * 0.3);
        };
        const leave = () => {
          toX(0);
          toY(0);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
        });
      });
    });

    // Fonts and images change heights; measure again once they are in.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
