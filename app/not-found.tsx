import { Band } from '@/components/ui/Band';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';

/*
 * The 404 belongs to the same world: an object on the shelf, a caption, one
 * pill home. Not a shrug and a broken-link icon.
 */
export default function NotFound() {
  return (
    <Band tone="ground" innerClassName="flex min-h-[100svh] flex-col justify-center py-32">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_18rem] md:gap-20">
        <div>
          <p className="label mb-6">404</p>
          <h1 className="max-w-2xl text-[clamp(2rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.04em]">
            Такой страницы нет
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-ink-2">
            Возможно, ссылка устарела или в адресе опечатка. Витрина на месте.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <PillLink href="/" variant="solid">
              На главную
            </PillLink>
            <PillLink href="/services" variant="outline">
              Смотреть услуги
            </PillLink>
          </div>
        </div>

        <div className="relative aspect-square w-40 justify-self-start md:w-full md:justify-self-end">
          <StudioObject
            src="/objects/fig-sphere.webp"
            alt=""
            sizes="(min-width: 768px) 18rem, 10rem"
          />
        </div>
      </div>
    </Band>
  );
}
