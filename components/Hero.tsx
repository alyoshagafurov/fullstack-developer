'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

/**
 * Hero — the first impression.
 *
 * Two layered portraits (developer & fighter). The "base" image is the
 * current mode; the "overlay" image is the *other* mode, hidden behind a
 * radial mask that follows the cursor. When the mouse enters the portrait,
 * the mask grows into a soft circular window — you see a sliver of the
 * other persona where the cursor is. When the mouse leaves, the window
 * shrinks back to nothing.
 *
 * A bottom-right toggle button swaps the persistent mode with a smooth
 * blur/scale cross-fade. Subtle parallax tilt on the entire portrait adds
 * depth without being noisy.
 */
export default function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<'face' | 'helmet'>('face');
  const [transitioning, setTransitioning] = useState(false);

  // Local cursor/touch reveal of the *other* persona.
  // Desktop: small window follows the cursor.
  // Mobile: tap anywhere on portrait → big reveal centered on tap point;
  //         tap again or outside → closes.
  useEffect(() => {
    const portrait = portraitRef.current;
    const overlay = overlayRef.current;
    if (!portrait || !overlay) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let mx = 50;
    let my = 50;
    let target = 0;
    let current = 0;
    let raf = 0;
    // Desktop: a small circular window follows the cursor and reveals a slice
    //   of the other persona where the cursor is.
    // Mobile: a tap on the portrait does a clean full cross-fade to the other
    //   persona — clearer than a tiny dot, matches the desktop's intent.
    const DESKTOP_R = 0.22;
    let mobileShown = false;

    const onMove = (e: MouseEvent) => {
      if (isMobile) return;
      const rect = portrait.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside) {
        mx = ((e.clientX - rect.left) / rect.width) * 100;
        my = ((e.clientY - rect.top) / rect.height) * 100;
        target = 1;
      } else {
        target = 0;
      }
    };

    const onLeave = () => { target = 0; };

    const onTap = (e: TouchEvent) => {
      if (!isMobile) return;
      const t = e.changedTouches[0] || e.touches[0];
      if (!t) return;
      const rect = portrait.getBoundingClientRect();
      const inside =
        t.clientX >= rect.left &&
        t.clientX <= rect.right &&
        t.clientY >= rect.top &&
        t.clientY <= rect.bottom;
      if (!inside) {
        mobileShown = false;
        target = 0;
        return;
      }
      mobileShown = !mobileShown;
      target = mobileShown ? 1 : 0;
    };

    const tick = () => {
      const lerp = isMobile ? 0.16 : 0.12;
      current += (target - current) * lerp;

      const visible = current > 0.01;
      if (!visible) {
        overlay.style.opacity = '0';
        overlay.style.maskImage = '';
        overlay.style.webkitMaskImage = '';
      } else if (isMobile) {
        // Full reveal — no mask, just cross-fade in the other persona
        overlay.style.maskImage = '';
        overlay.style.webkitMaskImage = '';
        overlay.style.opacity = String(current);
      } else {
        const rect = portrait.getBoundingClientRect();
        const maxR = Math.min(rect.width, rect.height) * DESKTOP_R;
        const r = current * maxR;
        const innerStop = r * 0.55;
        const cx = (mx / 100) * rect.width;
        const cy = (my / 100) * rect.height;
        const grad = `radial-gradient(circle ${r}px at ${cx}px ${cy}px, black 0px, black ${innerStop}px, transparent ${r}px)`;
        overlay.style.maskImage = grad;
        overlay.style.webkitMaskImage = grad;
        overlay.style.opacity = '1';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    portrait.addEventListener('mouseleave', onLeave);
    portrait.addEventListener('touchend', onTap);

    return () => {
      window.removeEventListener('mousemove', onMove);
      portrait.removeEventListener('mouseleave', onLeave);
      portrait.removeEventListener('touchend', onTap);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Parallax tilt
  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait) return;

    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
    const onMove = (e: MouseEvent) => {
      const rect = portrait.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Clamp so an off-screen portrait (scrolled away) can't blow the tilt
      // up into a full flip.
      mx = clamp((e.clientX - centerX) / rect.width);
      my = clamp((e.clientY - centerY) / rect.height);
    };

    const tick = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      const rotY = cx * 4;
      const rotX = -cy * 4;
      portrait.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Smooth persona switch — blur out, swap, blur in.
  // Accepts an explicit target (for the segmented switcher); with no arg it flips.
  const switchTo = (target?: 'face' | 'helmet') => {
    if (transitioning) return;
    const next = target ?? (mode === 'face' ? 'helmet' : 'face');
    if (next === mode) return;
    const base = baseRef.current;
    const overlay = overlayRef.current;
    if (!base) return;

    setTransitioning(true);

    // Hide overlay during transition so the swap reads cleanly
    if (overlay) overlay.style.opacity = '0';

    gsap
      .timeline({
        onComplete: () => setTransitioning(false),
      })
      .to(base, {
        opacity: 0,
        filter: 'blur(28px) brightness(1.4)',
        scale: 1.05,
        duration: 0.42,
        ease: 'power2.in',
      })
      .add(() => {
        setMode(next);
        gsap.set(base, {
          scale: 0.95,
          filter: 'blur(28px) brightness(0.7)',
        });
      })
      .to(base, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px) brightness(1.05)',
        duration: 0.7,
        ease: 'power2.out',
      });
  };

  // Intro reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.6, defaults: { ease: 'power3.out' } });

      tl.fromTo(
        portraitRef.current,
        { scale: 0.85, opacity: 0, filter: 'blur(20px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.6 },
      );

      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll('.char');
        tl.fromTo(
          chars,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.035,
            ease: 'power4.out',
          },
          '-=1.1',
        );
      }
      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.6',
      );
      tl.fromTo(
        toggleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.5',
      );
      tl.fromTo(
        hintRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.4',
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  // Vertical alignment offsets — ensures eyes/face align between the two photos.
  // Face photo has eyes higher in the frame; helmet photo has eyes lower.
  // Values are % of container height (~92vh), so keep them small.
  const FACE_Y = '1%';      // push face photo down slightly
  const HELMET_Y = '-3%';   // push helmet photo up to match face eye-line

  // Compute current "base" + "overlay" image — overlay always shows the
  // *other* persona so the cursor-window reveals it.
  const baseSrc = mode === 'face' ? '/hero-face.jpg' : '/hero-helmet.jpg';
  const overlaySrc = mode === 'face' ? '/hero-helmet.jpg' : '/hero-face.jpg';
  const baseAlt =
    mode === 'face' ? 'Alisher Gafurov' : 'Alisher Gafurov — Fighter';

  return (
    <section
      id="hero"
      ref={wrapRef}
      className="relative h-[100svh] w-full overflow-hidden perspective-2000 bg-dark text-white"
    >
      {/* Single soft key-light behind the subject — calm, minimal. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(46% 52% at 50% 38%, rgba(120,165,235,0.10) 0%, rgba(56,182,216,0.05) 46%, transparent 72%)',
        }}
      />

      {/* Portrait stage — fills the entire viewport on both desktop and mobile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={portraitRef}
          data-hover
          className="relative h-[100svh] w-full max-w-none preserve-3d transition-[transform] duration-200 will-change-transform pointer-events-auto"
        >
          {/* Soft halo behind subject — single restrained glow */}
          <div
            className="absolute -inset-10 rounded-[50%] blur-3xl opacity-60"
            style={{
              background:
                'radial-gradient(closest-side, rgba(120,165,235,0.14) 0%, rgba(56,182,216,0.07) 50%, transparent 78%)',
              pointerEvents: 'none',
            }}
          />

          {/* Soft cinematic stage — gentle dark vignette behind subject */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(15,12,25,0.78) 0%, rgba(10,8,18,0.45) 40%, transparent 78%)',
            }}
          />

          {/* Portrait stack — base + cursor-windowed overlay */}
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                'linear-gradient(to bottom, black 0%, black 82%, rgba(0,0,0,0.55) 94%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 0%, black 82%, rgba(0,0,0,0.55) 94%, transparent 100%)',
            }}
          >
            {/* BASE — the current persona */}
            <div
              ref={baseRef}
              className="absolute inset-0 will-change-[opacity,filter,transform]"
              style={{ opacity: 1, transform: 'scale(1)' }}
            >
              <Image
                key={`base-${mode}`}
                src={baseSrc}
                alt={baseAlt}
                fill
                priority
                quality={95}
                className="object-cover object-[center_18%] md:object-[center_22%]"
                style={{
                  filter:
                    'contrast(1.05) saturate(0.95) brightness(1.05)',
                  transform: `translateY(${mode === 'face' ? FACE_Y : HELMET_Y})`,
                }}
                sizes="100vw"
              />
            </div>

            {/* OVERLAY — the *other* persona, revealed under the cursor */}
            <div
              ref={overlayRef}
              className="absolute inset-0 will-change-[opacity]"
              style={{ opacity: 0 }}
            >
              <Image
                key={`overlay-${mode}`}
                src={overlaySrc}
                alt=""
                fill
                priority
                quality={95}
                className="object-cover object-[center_18%] md:object-[center_22%]"
                style={{
                  filter:
                    'contrast(1.08) saturate(0.95) brightness(1.05)',
                  transform: `translateY(${mode === 'face' ? HELMET_Y : FACE_Y})`,
                }}
                sizes="100vw"
              />
            </div>
          </div>

          {/* Subtle ground glow — anchors the subject */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[55%] h-16 pointer-events-none blur-2xl"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(120,165,235,0.22) 0%, rgba(56,182,216,0.12) 50%, transparent 75%)',
            }}
          />

        </div>
      </div>

      {/* TITLE LAYER */}
      <div
        data-hero-fade
        className="absolute inset-x-0 bottom-0 pointer-events-none flex flex-col items-center gap-3 md:gap-6 pb-[4vh] md:pb-[6vh] z-30 px-4 md:px-6"
      >
        <h1
          ref={titleRef}
          className="text-cinematic text-center text-white text-[12vw] sm:text-[10vw] md:text-[7vw] xl:text-[6rem] leading-[0.9]"
          style={{ textShadow: '0 2px 40px rgba(0,0,0,0.55)' }}
          aria-label="Alisher Gafurov"
        >
                    {'ALISHER GAFUROV'.split(' ').map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {wi > 0 && (
                <span
                  className="inline-block align-bottom"
                  style={{ width: '0.26em' }}
                  aria-hidden="true"
                />
              )}
              {word.split('').map((c, ci) => (
                <span
                  key={ci}
                  className="inline-block overflow-hidden align-bottom"
                  aria-hidden="true"
                >
                  <span className="char inline-block will-change-transform">{c}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div
          ref={subtitleRef}
          className="flex items-center gap-3 font-mono text-[9px] md:text-[11px] tracking-[0.45em] text-white/60"
        >
          <span>FULL-STACK РАЗРАБОТЧИК</span>
          <span className="text-white/25">·</span>
          <span>САЙТЫ ПОД КЛЮЧ</span>
        </div>

        {/* Segmented persona switcher — modern sliding toggle */}
        <div
          ref={toggleRef}
          role="group"
          aria-label="Switch persona"
          className="pointer-events-auto relative flex items-center p-1 rounded-full border border-white/15 bg-black/40 backdrop-blur-md"
        >
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 w-[88px] md:w-[104px] rounded-full transition-[transform,background,border-color,box-shadow] duration-500 ease-out"
            style={{
              transform: mode === 'face' ? 'translateX(0)' : 'translateX(100%)',
              background:
                mode === 'face' ? 'rgba(91,198,230,0.18)' : 'rgba(120,165,235,0.18)',
              border: `1px solid ${mode === 'face' ? 'rgba(91,198,230,0.6)' : 'rgba(120,165,235,0.6)'}`,
              boxShadow: `0 0 22px ${mode === 'face' ? 'rgba(91,198,230,0.28)' : 'rgba(120,165,235,0.28)'}`,
            }}
          />
          <SwitchSeg active={mode === 'face'} onClick={() => switchTo('face')} color="#5BC6E6" disabled={transitioning}>
            DEV
          </SwitchSeg>
          <SwitchSeg active={mode === 'helmet'} onClick={() => switchTo('helmet')} color="#7FA8EE" disabled={transitioning}>
            FIGHT
          </SwitchSeg>
        </div>
      </div>

      {/* TOP-LEFT scene marker — hidden on mobile for max portrait space */}
      <div className="absolute top-24 left-6 md:left-12 z-20 hidden md:flex items-center gap-3 label text-[10px] text-white/45">
        <span>00</span>
        <span className="w-8 h-px" style={{ background: '#7FA8EE' }} />
        <span style={{ color: '#7FA8EE' }}>СТАРТ</span>
      </div>

      {/* SCROLL HINT — hidden on mobile */}
      <div
        ref={hintRef}
        className="absolute bottom-8 left-6 md:left-12 z-30 hidden md:flex items-center gap-3 pointer-events-none"
      >
        <div
          className="relative w-14 h-px overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #7FA8EE, rgba(120,165,235,0.4), transparent)' }}
        >
          <div
            className="absolute top-0 bottom-0 w-3"
            style={{
              background: '#7FA8EE',
              animation: 'drift-up 2.2s ease-in-out infinite',
            }}
          />
        </div>
        <span className="label text-[9px] text-white/60">SCROLL</span>
      </div>
    </section>
  );
}

/* ── One segment of the persona switcher ──────────────────────────────── */
function SwitchSeg({
  children,
  active,
  onClick,
  color,
  disabled,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-hover
      className="relative z-10 w-[88px] md:w-[104px] py-2.5 flex items-center justify-center gap-2 font-mono text-[10px] md:text-[11px] tracking-[0.35em] transition-colors disabled:cursor-not-allowed"
      style={{ color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full transition-all"
        style={{
          background: active ? color : 'rgba(255,255,255,0.3)',
          boxShadow: active ? `0 0 10px ${color}` : 'none',
        }}
      />
      {children}
    </button>
  );
}

