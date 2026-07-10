'use client';

import { useEffect, useRef } from 'react';

/*
 * Global backdrop — creates depth without noise-for-noise's-sake:
 *   • base radial mesh (barely-there white light)
 *   • faint grid that fades toward the edges
 *   • film grain (SVG turbulence, via .noise)
 *   • two blurred white orbs that drift slowly and lean toward the cursor
 * Everything is monochrome and very low opacity — felt, not seen.
 */
export default function Backdrop() {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      if (aRef.current) aRef.current.style.transform = `translate3d(${cx * 40}px, ${cy * 40}px, 0)`;
      if (bRef.current) bRef.current.style.transform = `translate3d(${cx * -55}px, ${cy * -35}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* base mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 60%), radial-gradient(50% 40% at 100% 100%, rgba(255,255,255,0.03) 0%, transparent 60%), linear-gradient(180deg, #070707 0%, #0A0A0A 100%)',
        }}
      />
      {/* grid */}
      <div className="absolute inset-0 grid-lines" />
      {/* drifting orbs */}
      <div
        ref={aRef}
        className="orb float-slow"
        style={{ top: '-10%', left: '-5%', width: '52vw', height: '52vw' }}
      />
      <div
        ref={bRef}
        className="orb float-slow"
        style={{ bottom: '-15%', right: '-8%', width: '46vw', height: '46vw', animationDelay: '2s' }}
      />
      {/* grain */}
      <div className="absolute inset-0 noise" />
    </div>
  );
}
