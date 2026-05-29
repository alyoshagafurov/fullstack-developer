'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Voyage — a short pinned transition between the hero and CodeWorld.
 * Renders a canvas of accelerating star streaks (warp drive) and three
 * cinematic text fragments that fade in/out as the camera "approaches"
 * the next dimension.
 */
export default function Voyage() {
  const wrapRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(0.5);

  // Canvas warp animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    type Streak = { x: number; y: number; z: number; pz: number };
    const COUNT = 360;
    const streaks: Streak[] = [];

    const seed = (s: Streak) => {
      s.x = (Math.random() - 0.5) * w;
      s.y = (Math.random() - 0.5) * h;
      s.z = Math.random() * w;
      s.pz = s.z;
    };
    for (let i = 0; i < COUNT; i++) {
      const s = { x: 0, y: 0, z: 0, pz: 0 };
      seed(s);
      streaks.push(s);
    }

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

    let raf: number;
    const tick = () => {
      const v = speedRef.current;
      ctx.fillStyle = 'rgba(5,5,5,0.35)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < COUNT; i++) {
        const s = streaks[i];
        s.pz = s.z;
        s.z -= 4 + v * 28;
        if (s.z < 1) {
          seed(s);
          s.z = w;
          s.pz = s.z;
        }
        const sx = (s.x / s.z) * w + cx;
        const sy = (s.y / s.z) * w + cy;
        const px = (s.x / s.pz) * w + cx;
        const py = (s.y / s.pz) * w + cy;

        const len = Math.hypot(sx - px, sy - py);
        const alpha = Math.min(1, len / 30);
        const hue =
          i % 7 === 0 ? '#D4AF37' : i % 5 === 0 ? '#8A2BE2' : '#00FFFF';

        ctx.strokeStyle = hue;
        ctx.globalAlpha = alpha * (0.5 + v * 0.5);
        ctx.lineWidth = 0.6 + v * 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // GSAP pinned timeline → drives canvas speed + text fades
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const wrap = wrapRef.current;
      const pin = pinRef.current;
      if (!wrap || !pin) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: '+=180%',
          scrub: 0.8,
          pin: pin,
          pinSpacing: true,
        },
      });

      tl.fromTo(
        speedRef,
        { current: 0.3 },
        {
          current: 1.4,
          ease: 'power2.in',
          duration: 1,
          onUpdate: () => {
            // noop — speedRef.current is read in canvas loop
          },
        },
        0,
      );

      tl.fromTo(
        '.voyage-line-1',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4 },
        0,
      ).to('.voyage-line-1', { opacity: 0, y: -20, duration: 0.3 }, 0.35);

      tl.fromTo(
        '.voyage-line-2',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.4,
      ).to('.voyage-line-2', { opacity: 0, y: -20, duration: 0.3 }, 0.7);

      tl.fromTo(
        '.voyage-line-3',
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.4 },
        0.78,
      );

      // Destination glow grows
      tl.fromTo(
        '.voyage-dest',
        { scale: 0.2, opacity: 0 },
        { scale: 2.2, opacity: 1, duration: 1, ease: 'power3.in' },
        0.2,
      );

      // Decelerate at the end
      tl.to(
        speedRef,
        { current: 0.6, duration: 0.3, ease: 'power2.out' },
        0.9,
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="voyage"
      ref={wrapRef}
      className="relative w-full bg-ink-0"
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Destination glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="voyage-dest w-[200px] h-[200px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,255,255,0.5) 25%, rgba(138,43,226,0.3) 55%, transparent 75%)',
              filter: 'blur(20px)',
              opacity: 0,
            }}
          />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 90%)',
          }}
        />

        {/* HUD frame */}
        <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between font-mono text-[10px] tracking-[0.4em] text-white/40">
            <span>VOYAGE · II</span>
            <span className="text-neon-blue">TRANSMISSION_INCOMING</span>
          </div>

          <div className="flex justify-center text-center">
            <div className="relative">
              <div className="voyage-line-1 absolute inset-0 flex items-center justify-center">
                <div className="font-mono text-xs md:text-sm tracking-[0.5em] text-white/70">
                  ◯ &nbsp; LEAVING ATMOSPHERE
                </div>
              </div>
              <div className="voyage-line-2 absolute inset-0 flex items-center justify-center">
                <div className="font-mono text-xs md:text-sm tracking-[0.5em] text-neon-blue">
                  ◯ &nbsp; CROSSING DIMENSIONS
                </div>
              </div>
              <div className="voyage-line-3 flex items-center justify-center">
                <div className="text-cinematic text-white text-[10vw] md:text-[6vw] glow-yellow">
                  DIMENSION&nbsp;I
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between font-mono text-[10px] tracking-[0.4em] text-white/40">
            <span>WARP · 0.84c</span>
            <span>ETA · 00:02</span>
          </div>
        </div>
      </div>
    </section>
  );
}
