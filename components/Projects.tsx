'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * Projects — selected directions, as calm alternating rows on normal vertical
 * scroll (the old horizontal-scroll gallery is gone — this reads clearly).
 */

const projects = [
  {
    n: '001',
    title: 'Лендинг',
    sub: 'одностраничный сайт',
    image: '/project-1.jpg',
    description:
      'Стильная одностраничная презентация бренда, услуги или продукта. Чёткая структура, акцент на заявки и быстрая загрузка.',
    tech: ['Next.js', 'React', 'Tailwind'],
  },
  {
    n: '002',
    title: 'Бизнес-сайт',
    sub: 'многостраничный сайт',
    image: '/project-2.jpg',
    description:
      'Сайт компании с продуманной структурой, SEO и формами заявок — чтобы клиенты находили вас и оставались.',
    tech: ['SEO', 'CMS', 'Формы'],
  },
  {
    n: '003',
    title: 'Full-Stack',
    sub: 'веб-приложение',
    image: '/project-3.jpg',
    description:
      'Индивидуальные решения: админ-панель, база данных, бронирование, личные кабинеты — любой функционал под задачу.',
    tech: ['Node.js', 'PostgreSQL', 'API'],
  },
];

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="projects"
      ref={ref}
      className="relative w-full bg-paper px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-content">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-24">
          <div>
            <div
              data-reveal="0"
              className="flex items-center gap-3 label text-[10px] text-muted mb-8"
            >
              <span>04</span>
              <span className="w-10 h-px bg-accent" />
              <span className="text-accent">РАБОТЫ</span>
            </div>
            <h2
              data-reveal="1"
              className="text-cinematic text-ink text-[12vw] md:text-[6vw] lg:text-[5rem] leading-[0.95]"
            >
              Что я
              <br />
              <span className="text-muted">создаю.</span>
            </h2>
          </div>
          <p
            data-reveal="2"
            className="text-ink-2 text-sm md:text-base max-w-xs leading-relaxed"
          >
            Направления, в которых я работаю — от простого лендинга до
            полноценного веб-приложения.
          </p>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-20 md:gap-28">
          {projects.map((p, i) => {
            const accent = i % 2 === 0 ? 'var(--accent)' : 'var(--teal)';
            const flip = i % 2 === 1;
            return (
              <div
                key={p.n}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center"
              >
                {/* Image */}
                <div
                  data-reveal="1"
                  data-hover
                  className={`relative ${flip ? 'md:order-2' : ''}`}
                >
                  <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-line shadow-[0_30px_70px_-35px_rgba(0,0,0,0.65)]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      data-parallax="0.05"
                      data-pscale="1.12"
                      className="object-cover will-change-transform"
                      sizes="(max-width:768px) 90vw, 50vw"
                    />
                    <div
                      className="absolute top-4 left-4 label text-[10px] text-white px-3 py-1 rounded-full backdrop-blur-sm"
                      style={{ background: accent }}
                    >
                      {p.n}
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div data-reveal="2" className={flip ? 'md:order-1' : ''}>
                  <div className="label text-[10px]" style={{ color: accent }}>
                    {p.sub}
                  </div>
                  <h3 className="text-cinematic text-ink text-5xl md:text-6xl mt-3 mb-5">
                    {p.title}
                  </h3>
                  <p className="text-ink-2 text-sm md:text-base leading-relaxed max-w-md mb-6">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="label text-[10px] text-ink-2 bg-paper-2 rounded-full px-3 py-1.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA */}
        <div
          data-reveal="0"
          className="mt-24 md:mt-32 rounded-3xl bg-paper-2 border border-line p-10 md:p-16 text-center"
        >
          <div className="label text-[10px] text-accent mb-5">ГОТОВЫ НАЧАТЬ?</div>
          <h3 className="text-cinematic text-ink text-[9vw] md:text-[4.5vw] lg:text-[3.5rem] leading-[1.0]">
            Давайте создадим ваш сайт.
          </h3>
          <a
            href="#contact"
            data-hover
            className="mt-9 inline-flex items-center gap-3 rounded-full px-7 py-4 bg-accent text-white label text-[10px] hover:bg-accent-deep transition-colors"
          >
            ОБСУДИТЬ ПРОЕКТ <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
