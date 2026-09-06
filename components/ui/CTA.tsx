import Link from 'next/link';

/*
 * The one button on the site that has to look like a button.
 *
 * Everything else here is a hairline and a letterspaced label, which is right
 * for navigation and wrong for the single action the whole page exists to
 * produce. This is solid, tall, and carries an arrow: a visitor should not have
 * to work out that it is clickable.
 *
 * `tone` says which band it is standing on, not what colour it is: on a dark
 * band the button is paper, on a light one it is ink. The filled shape is the
 * constant, the colour follows the ground.
 */
export function CTA({
  href,
  children,
  tone = 'light',
  size = 'md',
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  tone?: 'light' | 'dark';
  size?: 'md' | 'lg';
  className?: string;
}) {
  const fill =
    tone === 'dark'
      ? 'bg-paper text-void hover:bg-paper/85'
      : 'bg-ink text-paper hover:bg-ink-2';

  const scale =
    size === 'lg'
      ? 'min-h-16 px-10 text-[0.9375rem] gap-4'
      : 'min-h-14 px-8 text-[0.875rem] gap-3';

  const cls = `group inline-flex items-center justify-center rounded-full font-semibold tracking-[0.02em] transition-colors duration-200 ${fill} ${scale} ${className}`;

  const body = (
    <>
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 ease-[var(--ease-studio)] group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );

  // Telegram, mail and tel are not routes: next/link would try to prefetch them.
  const external = /^(https?:|mailto:|tel:)/.test(href);
  if (external) {
    return (
      <a
        href={href}
        data-magnetic
        className={cls}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} data-magnetic className={cls}>
      {body}
    </Link>
  );
}
