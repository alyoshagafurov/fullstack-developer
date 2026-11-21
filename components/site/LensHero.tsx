'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { WhatsAppIcon } from '@/components/museum/Icons';

/*
 * The first screen (concept D): his photograph across the whole screen in
 * black and white, and a round lens that follows the pointer and shows him in
 * colour. On a touch screen the lens drifts by itself. His name rises in from
 * below in the wide type of concept B.
 */
export function LensHero({
  name,
  offer,
  hint,
  quote,
  whatsapp,
  startHref,
  whatsappHref,
  photoAlt,
}: {
  name: string;
  offer: string;
  hint: string;
  quote: string;
  whatsapp: string;
  startHref: string;
  whatsappHref: string;
  photoAlt: string;
}) {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!root.current || reduce || !matchMedia('(hover: none)').matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      root.current?.style.setProperty('--mx', `${50 + Math.sin(t * 0.55) * 22}%`);
      root.current?.style.setProperty('--my', `${36 + Math.cos(t * 0.75) * 12}%`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  const lens = 'radial-gradient(circle clamp(120px, 16vw, 220px) at var(--mx) var(--my), #000 62%, transparent 100%)';

  return (
    <section
      ref={root}
      data-tone="dark"
      data-doors
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`);
        event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`);
      }}
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-wall [--mx:62%] [--my:38%]"
    >
      <Image
        src="/photo/about.webp"
        alt={photoAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[60%_35%] opacity-50 grayscale"
      />
      <Image
        src="/photo/about.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-[60%_35%]"
        style={{ maskImage: lens, WebkitMaskImage: lens }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

      <div className="hall absolute inset-x-0 bottom-0 pb-10 md:pb-14">
        <h1 className="hall-title text-[clamp(2.75rem,9vw,9rem)] leading-[0.95]">
          {name.split(' ').map((word, i) => (
            <span key={word} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={reduce ? false : { y: '100%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>
        <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
          <p className="lead-line max-w-md text-bone">
            {offer}. <span className="hidden text-bone-2 md:inline">{hint}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={startHref} className="btn-bone">
              {quote}
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-line">
              <WhatsAppIcon className="size-[1.05rem]" />
              {whatsapp}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
