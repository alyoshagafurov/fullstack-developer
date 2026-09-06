'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * Every piece of motion on the public site, in one place.
 *
 * The markup declares what moves with a handful of data attributes and this
 * file decides how. That keeps the sections as plain server components — no
 * refs, no client boundaries — and keeps the whole vocabulary of movement
 * short enough to read in one sitting:
 *
 *   data-hero-root / data-hero="…"   the opening's entrance, once, on load
 *   data-hero-cta                     the row whose buttons that entrance ends on
 *   data-intro                        an inner page's opening, same idea
 *   data-reveal                       rises into place as it scrolls into view
 *   data-reveal="group"               its children do, one after another
 *   data-reveal="image"               a photograph settles from a touch larger
 *   data-count                        a number counts up to itself
 *   data-draw                         a line draws itself left to right
 *   data-magnetic                     a button leans toward the pointer
 *
 * Everything is small and short: a rise of a few pixels over most of a second,
 * never a slide from off-screen. Movement here explains that something has
 * arrived; it does not perform. All of it is gated on `prefers-reduced-motion`
 * through `gsap.matchMedia`, which also tears it down if the setting flips.
 *
 * The opening's elements are hidden by CSS the moment `html.motion` is set —
 * an inline script in the document head, before first paint — so nothing
 * flashes at full opacity before the entrance runs. Without JavaScript the
 * class is never set and the page is simply there. Because they start hidden
 * in CSS, every tween is a `fromTo`: a bare `from` would read the current
 * opacity as its destination and animate to nothing.
 */

const EASE = 'power3.out';

/** Leaves no inline transform behind: a lingering one makes a stacking context,
 *  and a stacking context is what breaks the studio objects' `darken` blend. */
const CLEAN = 'opacity,transform';

function once(trigger: Element, start = 'top 86%') {
  return { trigger, start, once: true } as const;
}

function entrance() {
  const root = document.querySelector('[data-hero-root]');
  if (root) {
    const pick = (name: string) => root.querySelectorAll(`[data-hero="${name}"]`);
    // The buttons are the row's children: the row itself carries a Tailwind
    // translate on wide screens that must be left alone.
    const buttons = Array.from(root.querySelector('[data-hero-cta]')?.children ?? []);
    // `clearProps: 'transform'` only — the CSS that hid these still applies,
    // so the inline opacity has to stay behind to keep them shown.
    const tl = gsap.timeline({ defaults: { ease: EASE, clearProps: 'transform' } });
    tl.fromTo(
      pick('photo'),
      { opacity: 0, scale: 1.035 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' },
      0,
    )
      .fromTo(pick('eyebrow'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15)
      .fromTo(
        pick('line'),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.95, stagger: 0.09 },
        0.2,
      )
      .fromTo(pick('lede'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.85 }, 0.5)
      .fromTo(
        buttons,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 },
        0.7,
      );
  }

  const intro = document.querySelectorAll('[data-intro]');
  if (intro.length) {
    gsap.fromTo(
      intro,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: EASE,
        stagger: 0.1,
        delay: 0.05,
        clearProps: 'transform',
      },
    );
  }
}

function reveals() {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const kind = el.dataset.reveal;

    if (kind === 'group') {
      gsap.fromTo(
        Array.from(el.children),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: EASE,
          stagger: 0.07,
          clearProps: CLEAN,
          scrollTrigger: once(el),
        },
      );
      return;
    }

    if (kind === 'image') {
      const img = el.querySelector('img') ?? el;
      gsap.fromTo(
        img,
        { opacity: 0, scale: 1.06 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.3,
          ease: 'power2.out',
          clearProps: CLEAN,
          scrollTrigger: once(el, 'top 82%'),
        },
      );
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.85, ease: EASE, clearProps: CLEAN, scrollTrigger: once(el) },
    );
  });
}

/** "50+" counts from 0 to 50 and keeps its "+". Anything not starting with digits is left alone. */
function counts() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    // The original text is kept on the element: this runs again on every
    // navigation (and twice in development), and the second pass must not
    // read the "0+" the first pass wrote as the number to count to.
    const source = el.dataset.countFrom ?? el.textContent ?? '';
    el.dataset.countFrom = source;
    const match = source.match(/^\s*(\d+)([\s\S]*)$/);
    if (!match) return;
    const target = Number(match[1]);
    const rest = match[2];
    const state = { n: 0 };
    el.textContent = `0${rest}`;
    // An explicit trigger with a callback, not a tween handed to ScrollTrigger:
    // a tween on a plain object is not a thing ScrollTrigger reliably plays.
    ScrollTrigger.create({
      ...once(el, 'top 85%'),
      onEnter: () =>
        gsap.to(state, {
          n: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${Math.round(state.n)}${rest}`;
          },
        }),
    });
  });
}

function draws() {
  document.querySelectorAll<HTMLElement>('[data-draw]').forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'power3.inOut',
        transformOrigin: 'left center',
        clearProps: 'transform',
        scrollTrigger: once(el, 'top 80%'),
      },
    );
  });
}

/*
 * A button that leans a few pixels toward the pointer and springs back.
 * Pointer-fine devices only: on a phone there is no hover to answer.
 */
function magnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};
  const undo: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const move = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = event.clientX - (r.left + r.width / 2);
      const dy = event.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * 0.16, y: dy * 0.16, duration: 0.45, ease: 'power3.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.55)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    undo.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { clearProps: 'transform' });
    });
  });

  return () => undo.forEach((fn) => fn());
}

export function MotionRoot() {
  const pathname = usePathname();

  // Layout effect, not effect: on a client-side navigation the new page must be
  // hidden and measured before the browser paints it, or it appears, vanishes
  // and rises — a blink where there should be an arrival.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      document.documentElement.classList.add('motion');
      const ctx = gsap.context(() => {
        entrance();
        reveals();
        counts();
        draws();
      });
      const release = magnetic();
      // Images and fonts settle after mount and shift every trigger's position.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      return () => {
        window.removeEventListener('load', refresh);
        release();
        ctx.revert();
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      // Nothing moves, and nothing must stay hidden waiting for it to.
      document.documentElement.classList.remove('motion');
    });

    return () => mm.revert();
  }, [pathname]);

  return null;
}
