'use client';

import { useEffect, useRef } from 'react';

/*
 * Dark Luxury backdrop — warm, near-black room with soft indirect lighting.
 * No stars, no grid: just two large, very low-opacity warm glows (bronze +
 * taupe) that drift gently toward the cursor, plus a fine film grain. Felt as
 * atmosphere, never seen as an effect.
 */
export default function Backdrop() {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const tick = () => {
      cx += (tx - cx) * 0.035;
      cy += (ty - cy) * 0.035;
      if (aRef.current) aRef.current.style.transform = `translate3d(${cx * 34}px, ${cy * 30}px, 0)`;
      if (bRef.current) bRef.current.style.transform = `translate3d(${cx * -46}px, ${cy * -28}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* base warm gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% -8%, rgba(121,82,56,0.10) 0%, transparent 58%),' +
            'radial-gradient(55% 50% at 100% 108%, rgba(121,82,56,0.06) 0%, transparent 60%),' +
            'linear-gradient(180deg, #1B1917 0%, #191817 46%, #151413 100%)',
        }}
      />
      {/* drifting warm glows */}
      <div
        ref={aRef}
        className="orb float-slow"
        style={{ top: '-14%', left: '-6%', width: '58vw', height: '58vw' }}
      />
      <div
        ref={bRef}
        className="orb float-slow"
        style={{ bottom: '-18%', right: '-10%', width: '50vw', height: '50vw', animationDelay: '2.5s' }}
      />
      {/* film grain */}
      <div className="absolute inset-0 noise" />
    </div>
  );
}
