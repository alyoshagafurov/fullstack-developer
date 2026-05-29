'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Projects — a horizontal gallery driven by vertical scroll.
 *
 * The section pins and the track translates left as the user scrolls down
 * (works the same on desktop wheel and mobile touch — Lenis feeds both into
 * ScrollTrigger). An intro panel and a closing CTA bookend the work.
 */

const projects = [
  {
    n: '001',
    title: 'ЛЕНДИНГ',
    sub: 'одностраничный сайт',
    image: '/project-1.jpg',
    description:
      'Стильная одностраничная презентация бренда, услуги или продукта. Чёткая структура, акцент на заявки и быстрая загрузка.',
    tech: ['Next.js', 'React', 'Tailwind'],
    accent: '#00FFFF',
  },
  {
    n: '002',
    title: 'БИЗНЕС-САЙТ',
    sub: 'многостраничный сайт',
    image: '/project-2.jpg',
    description:
      'Сайт компании с продуманной структурой, SEO и формами заявок — чтобы клиенты находили вас и оставались.',
    tech: ['SEO', 'CMS', 'Формы'],
    accent: '#8A2BE2',
  },
  {
    n: '003',
    title: 'FULL-STACK',
    sub: 'веб-приложение',
    image: '/project-3.jpg',
    description:
      'Индивидуальные решения: админ-панель, база данных, бронирование, личные кабинеты — любой функционал под задачу.',
    tech: ['Node.js', 'PostgreSQL', 'API'],
    accent: '#D4AF37',
  },
];

export default function Projects() {
  const wrapRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const wrap = wrapRef.current;
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!wrap || !pin || !track) return;

      const amount = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -amount(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => '+=' + amount(),
          pin,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Progress bar tracks horizontal travel
      gsap.fromTo(
        '.proj-progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => '+=' + amount(),
            scrub: true,
          },
        },
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={wrapRef} className="relative w-full bg-ink-0">
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ink-0" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 50%, rgba(0,255,255,0.07), transparent 70%), radial-gradient(40% 40% at 85% 15%, rgba(138,43,226,0.09), transparent 70%)',
          }}
        />
        <div
          className="absolute left-0 right-0 bottom-0 h-[45vh] pointer-events-none origin-top"
          style={{
            transform: 'perspective(1100px) rotateX(72deg)',
            background:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '90px 90px',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />

        {/* Quiet marker */}
        <div className="absolute top-24 left-6 md:left-12 z-30 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/35">
          <span>04</span>
          <span className="w-8 h-px bg-neon-yellow" />
          <span className="text-neon-yellow">РАБОТЫ</span>
        </div>

        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="absolute inset-0 flex flex-nowrap items-center h-full will-change-transform"
        >
          {/* Intro panel */}
          <div className="shrink-0 h-full flex flex-col justify-center w-[82vw] sm:w-[60vw] md:w-[42vw] lg:w-[34vw] px-6 md:px-12">
            <h2 className="text-cinematic text-white text-[18vw] md:text-[8vw] lg:text-[6rem] leading-[0.88]">
              ЧТО Я
              <br />
              <span className="text-white/35">СОЗДАЮ</span>
            </h2>
            <p className="mt-8 text-white/55 text-sm md:text-base max-w-xs leading-relaxed">
              Направления, в которых я работаю. Листайте — галерея едет вбок.
            </p>
            <div className="mt-8 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-neon-blue">
              <span>ЛИСТАЙТЕ</span>
              <span className="w-10 h-px bg-neon-blue" />
              <span>→</span>
            </div>
          </div>

          {/* Project panels */}
          {projects.map((p, i) => (
            <ProjPanel key={p.n} project={p} index={i} />
          ))}

          {/* Closing CTA panel */}
          <div className="shrink-0 h-full flex flex-col justify-center w-[82vw] sm:w-[56vw] md:w-[36vw] px-6 md:px-12">
            <div className="font-mono text-[10px] tracking-[0.5em] text-neon-yellow mb-5">
              ГОТОВЫ НАЧАТЬ?
            </div>
            <h3 className="text-cinematic text-white text-[14vw] md:text-[5.5vw] lg:text-[4rem] leading-[0.92]">
              Давайте создадим
              <br />
              ваш сайт.
            </h3>
            <a
              href="#contact"
              data-hover
              className="mt-9 inline-flex items-center gap-3 self-start px-6 py-3.5 border border-white/25 font-mono text-[10px] tracking-[0.4em] text-white hover:border-neon-yellow hover:text-neon-yellow transition-colors"
            >
              ОБСУДИТЬ ПРОЕКТ <span>→</span>
            </a>
          </div>

          {/* trailing gutter */}
          <div className="shrink-0 w-[8vw]" />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-6 left-6 md:left-12 right-6 md:right-12 z-30">
          <div className="relative h-px w-full bg-white/10">
            <div
              className="proj-progress absolute inset-y-0 left-0 w-full origin-left bg-neon-yellow"
              style={{ transform: 'scaleX(0)', boxShadow: '0 0 10px rgba(212,175,55,0.6)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjPanel({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <div className="shrink-0 h-full flex items-center w-[88vw] sm:w-[66vw] md:w-[50vw] lg:w-[42vw] px-4 md:px-8">
      <div className="relative w-full">
        {/* faint index watermark */}
        <div
          className="absolute -top-[6vh] -left-2 font-display font-bold text-white/[0.04] text-[26vw] md:text-[14vw] leading-none select-none pointer-events-none"
          aria-hidden="true"
        >
          {project.n}
        </div>

        {/* Image */}
        <div
          data-hover
          className="relative aspect-[4/3] md:aspect-[16/10] w-full overflow-hidden border"
          style={{
            borderColor: `${project.accent}40`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 50px ${project.accent}20`,
          }}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            style={{ filter: 'brightness(0.9) contrast(1.05)' }}
            sizes="(max-width:768px) 88vw, 50vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${project.accent}15, transparent 55%)`,
              mixBlendMode: 'overlay',
            }}
          />
          <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.4em]" style={{ color: project.accent }}>
            ● НАПРАВЛЕНИЕ
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[10px] tracking-[0.4em] text-white/55">
            <span>ТИП · {String(index + 1).padStart(2, '0')}</span>
            <span style={{ color: project.accent }}>ПОДРОБНЕЕ →</span>
          </div>
          <Corners color={project.accent} />
        </div>

        {/* Meta */}
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.5em]" style={{ color: project.accent }}>
              {project.sub.toUpperCase()}
            </div>
            <h3
              className="text-cinematic text-white text-5xl md:text-6xl lg:text-7xl mt-2"
              style={{ textShadow: `0 0 30px ${project.accent}30` }}
            >
              {project.title}
            </h3>
          </div>
        </div>

        <p className="mt-4 text-white/60 text-sm md:text-base leading-relaxed max-w-lg">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] tracking-[0.25em] border px-2.5 py-1 text-white/70"
              style={{ borderColor: `${project.accent}40` }}
            >
              {t.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Corners({ color }: { color: string }) {
  const cs = { borderColor: color };
  return (
    <>
      <span className="absolute -top-px -left-px w-4 h-4 border-t border-l" style={cs} />
      <span className="absolute -top-px -right-px w-4 h-4 border-t border-r" style={cs} />
      <span className="absolute -bottom-px -left-px w-4 h-4 border-b border-l" style={cs} />
      <span className="absolute -bottom-px -right-px w-4 h-4 border-b border-r" style={cs} />
    </>
  );
}
