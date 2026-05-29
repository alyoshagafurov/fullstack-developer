'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Boot sequence — a wormhole you fall into.
 *
 * A canvas renders an accelerating particle tunnel collapsing toward a glowing
 * cyan/violet core (the wormhole mouth). A thin progress ring wraps the core
 * and fills as the site loads. When complete, the whole layer fades to reveal
 * the Hero. Timing/scroll-lock logic is kept simple + robust (RAF + failsafe).
 */

const TOTAL_MS = 2600;
const FADE_MS = 750;

const STAGES = [
  'ALIGNING STARS',
  'OPENING WORMHOLE',
  'CROSSING THE VOID',
  'ARRIVING',
];

export default function Loader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Wormhole canvas ─────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    type P = { a: number; z: number; r: number; hue: number; spin: number };
    const COUNT = 540;
    const COLORS = ['#9CFBFF', '#00FFFF', '#A86BFF', '#FFFFFF', '#FFF27A'];
    const rnd = () => Math.random();

    const seed = (p: P, far = false) => {
      p.a = rnd() * Math.PI * 2;
      p.z = far ? 0.92 + rnd() * 0.08 : rnd();
      p.r = 0.32 + rnd() * 1.0;
      const roll = rnd();
      p.hue = roll < 0.55 ? 1 : roll < 0.72 ? 0 : roll < 0.9 ? 2 : roll < 0.97 ? 3 : 4;
      p.spin = 0.5 + rnd() * 0.9;
    };

    const ps: P[] = [];
    for (let i = 0; i < COUNT; i++) {
      const p: P = { a: 0, z: 0, r: 0, hue: 0, spin: 1 };
      seed(p);
      ps.push(p);
    }

    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.016;
      const cx = w / 2;
      const cy = h / 2;
      const minDim = Math.min(w, h);

      // Motion-blur trail
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(3,4,9,0.32)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      // Glowing wormhole core
      const pulse = 1 + Math.sin(t * 1.5) * 0.07;
      const coreR = minDim * 0.18 * pulse;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.6);
      core.addColorStop(0, 'rgba(200,255,255,0.95)');
      core.addColorStop(0.22, 'rgba(0,255,255,0.4)');
      core.addColorStop(0.55, 'rgba(138,43,226,0.2)');
      core.addColorStop(1, 'rgba(5,5,12,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Tunnel particles → radial warp streaks
      const base = minDim * 0.06;
      for (let i = 0; i < COUNT; i++) {
        const p = ps[i];
        const dz = 0.0035 + (1 - p.z) * 0.0052;
        const zPrev = p.z + dz;
        p.z -= dz;
        if (p.z <= 0.05) {
          seed(p, true);
          continue;
        }
        const a = p.a + t * 0.22 * p.spin;
        const rr = p.r * base;
        const sr = rr * (1 / p.z - 1);
        const sr0 = rr * (1 / zPrev - 1);
        if (sr > minDim * 1.1) continue;

        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const x = cx + ca * sr;
        const y = cy + sa * sr;
        const x0 = cx + ca * sr0;
        const y0 = cy + sa * sr0;

        const alpha = Math.min(1, (1 - p.z) * 1.5);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = COLORS[p.hue];
        ctx.lineWidth = 0.5 + (1 - p.z) * 2.2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ── Progress + scroll lock ──────────────────────────────────────── */
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / TOTAL_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);

    const failSafe = setTimeout(() => setDone(true), TOTAL_MS + 300);
    document.documentElement.style.overflow = 'hidden';

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(failSafe);
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (done) document.documentElement.style.overflow = '';
  }, [done]);

  // Progress ring geometry
  const R = 132;
  const CIRC = 2 * Math.PI * R;
  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor((pct / 100) * STAGES.length))];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity ease-out ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: '#03040a', transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={done}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* edge vignette to focus the wormhole */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(3,4,10,0.55) 70%, rgba(3,4,10,0.9) 100%)',
        }}
      />
      <div className="absolute inset-0 grain opacity-20 pointer-events-none" />

      {/* Progress ring wrapping the core */}
      <div className="relative flex items-center justify-center pointer-events-none">
        <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="#00FFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.8))' }}
          />
        </svg>
      </div>

      {/* Minimal text */}
      <div className="absolute top-8 left-6 md:left-12 font-mono text-[10px] tracking-[0.45em] text-white/40">
        SYS // BOOT
      </div>
      <div className="absolute top-8 right-6 md:right-12 font-mono text-[10px] tracking-[0.45em] text-neon-blue/70 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-blue pulse-soft" />
        {String(pct).padStart(3, '0')}%
      </div>

      <div className="absolute bottom-10 md:bottom-14 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
        <div className="font-mono text-[10px] tracking-[0.55em] text-white/55">
          {stage}
        </div>
        <div className="text-cinematic text-white text-2xl md:text-3xl tracking-[0.08em]">
          ALISHER&nbsp;GAFUROV
        </div>
      </div>
    </div>
  );
}
