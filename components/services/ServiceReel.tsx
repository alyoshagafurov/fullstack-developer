import Link from 'next/link';
import { StudioObject } from '@/components/ui/StudioObject';
import type { Service } from '@/lib/content/services';

/*
 * The register of services, read one at a time.
 *
 * The band holds still while the list runs through it: the object stands large
 * in the middle of the screen with its words under it, and the next one rises
 * from below as this one leaves upward. Fourteen services in a column are a
 * price list nobody finishes; one at a time, each gets the screen it needs to
 * be looked at.
 *
 * The stacking and the pinning are done by the motion layer against these data
 * attributes, so with JavaScript off the same markup is simply fourteen full
 * screens in a row — long, but whole and readable.
 */
export function ServiceReel({ items }: { items: Service[] }) {
  return (
    <section data-reel data-tone="light" className="relative w-full bg-paper">
      <div
        data-reel-stage
        className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
      >
        <ol className="relative w-full">
          {items.map((service) => (
            <li
              key={service.slug}
              data-reel-slide
              className="flex min-h-[100svh] w-full items-center justify-center px-5 py-10"
            >
              <Link
                href={`/services/${service.slug}`}
                className="group flex w-full max-w-4xl flex-col items-center text-center"
              >
                {/* Sized by height, not width: what has to fit on this screen
                    is the object and the words under it, together. */}
                <div className="aspect-square h-[min(30svh,17rem)]">
                  <StudioObject
                    src={service.object}
                    alt=""
                    sizes="(min-width: 768px) 34vh, 60vw"
                    lift
                    className="transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-2"
                  />
                </div>

                <p className="tabular mt-6 text-[0.6875rem] tracking-[0.18em] text-ink-3">
                  {service.num} / {items.length}
                </p>

                <h3 className="mt-3 text-[clamp(1.75rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] uppercase">
                  {service.title}
                </h3>

                <p className="mt-4 max-w-xl text-[clamp(0.9375rem,1.5vw,1.125rem)] leading-relaxed text-ink-2">
                  {service.tagline}
                </p>

                {(service.duration || service.budget) && (
                  <p className="mt-4 flex flex-wrap justify-center gap-x-7 gap-y-1 text-sm text-ink-3">
                    {service.duration && <span>{service.duration}</span>}
                    {service.budget && <span>{service.budget}</span>}
                  </p>
                )}

                <span className="mt-7 inline-flex min-h-11 items-center rounded-full border border-ink px-6 text-[0.8125rem] font-medium tracking-[0.04em] transition-colors group-hover:bg-ink group-hover:text-paper">
                  Подробнее
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
