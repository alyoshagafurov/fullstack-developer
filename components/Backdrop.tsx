'use client';

import { useEffect, useRef } from 'react';

/*
 * Cosmic backdrop — a matte deep-space canvas instead of flat black:
 *   • base: near-black with a whisper of cool nebula light
 *   • a real starfield: many tiny stars, a few brighter ones, gentle twinkle
 *   • the field drifts slightly toward the cursor for parallax depth
 * Kept subtle on purpose ("маленько чуток") — felt, not flashy.
 */

type Star = { x: number; y: number; r: number; base: number; amp: number; ph: number; sp: number };

export default function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars: Star[] = [];
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let mx = 0, my = 0, cx = 0, cy = 0, raf = 0, t = 0;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // density scales with area; kept modest so it reads as "a few real stars"
      const count = Math.min(110, Math.round((w * h) / 18000));
      stars = Array.from({ length: count }, () => {
        const bright = Math.random() < 0.12; // a few brighter stars
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: bright ? 0.9 + Math.random() * 0.8 : 0.35 + Math.random() * 0.6,
          base: bright ? 0.55 + Math.random() * 0.4 : 0.15 + Math.random() * 0.45,
          amp: 0.1 + Math.random() * 0.35,
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.4,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      cx += (mx - cx) * 0.04;
      cy += (my - cy) * 0.04;
      for (const s of stars) {
        const tw = reduce ? s.base : s.base + Math.sin(t * s.sp + s.ph) * s.amp;
        const o = Math.max(0, Math.min(1, tw));
        // subtle parallax: farther (smaller) stars move less
        const px = s.x + cx * (s.r * 6);
        const py = s.y + cy * (s.r * 6);
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${o})`;
        ctx.fill();
        if (s.r > 1) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${o * 0.12})`;
          ctx.fill();
        }
      }
    };

    const tick = () => {
      t += 0.016;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${mx * 24}px, ${my * 24}px, 0)`;
    };

    // Pause the render loop while the tab is hidden (saves CPU/battery).
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!reduce && !raf) { t += 0.016; raf = requestAnimationFrame(tick); }
    };

    build();
    if (reduce) draw();
    else raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', build);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', build);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* matte deep-space base + faint nebula light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 55% at 50% -5%, rgba(120,140,190,0.06) 0%, transparent 55%),' +
            'radial-gradient(50% 45% at 100% 100%, rgba(90,110,170,0.05) 0%, transparent 60%),' +
            'radial-gradient(45% 40% at 0% 90%, rgba(150,150,170,0.04) 0%, transparent 60%),' +
            'linear-gradient(180deg, #060608 0%, #070709 50%, #050506 100%)',
        }}
      />
      {/* soft drifting nebula glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 will-change-transform"
        style={{
          background:
            'radial-gradient(38% 30% at 30% 20%, rgba(160,170,210,0.05) 0%, transparent 70%),' +
            'radial-gradient(30% 26% at 78% 68%, rgba(130,140,180,0.045) 0%, transparent 70%)',
        }}
      />
      {/* starfield */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* fine grain to keep it matte */}
      <div className="absolute inset-0 noise" />
    </div>
  );
}
