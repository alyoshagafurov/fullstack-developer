'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { Badge } from '@/components/site/Badge';

/*
 * The statement (concept B): one sentence as large as the page allows, with
 * two small pictures set inside it like words — him, and a site he built —
 * that open up as the sentence arrives. The badge beside it is the WhatsApp
 * door.
 */
function Pill({ src, width, delay, position = 'center' }: { src: string; width: string; delay: number; position?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { width: 0 }}
      whileInView={{ width }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={reduce ? { width } : undefined}
      className="relative inline-block h-[0.8em] overflow-hidden rounded-full align-[-0.06em]"
    >
      <Image src={src} alt="" fill sizes="14rem" className="object-cover" style={{ objectPosition: position }} />
    </motion.span>
  );
}

export function Manifesto({
  words,
  shot,
  note,
  badge,
  whatsappHref,
  whatsappLabel,
}: {
  words: readonly string[];
  shot: string | null;
  note: string;
  badge: string;
  whatsappHref: string;
  whatsappLabel: string;
}) {
  const [a, b, c, d] = words;
  return (
    <section className="py-24 md:py-36" aria-label={words.join(' ')}>
      <div className="hall">
        <p className="hall-title text-[clamp(2.4rem,7.6vw,7.75rem)] leading-[1.04]">
          {a} <Pill src="/photo/about.webp" width="clamp(3.5rem,13vw,12.5rem)" delay={0.15} position="55% 35%" /> {b}{' '}
          <br className="hidden md:block" />
          {c} {shot && <Pill src={shot} width="clamp(3.5rem,12vw,11rem)" delay={0.35} position="top" />} {d}
        </p>
        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <p className="lead-line max-w-lg">{note}</p>
          <Badge href={whatsappHref} text={badge} label={whatsappLabel} />
        </div>
      </div>
    </section>
  );
}
