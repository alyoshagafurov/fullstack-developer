/*
 * Mono meta — the technical voice of the brand.
 *
 * Section indices, years, stack names, small captions. Monospace here is doing
 * real work: it is what separates a developer's portfolio from a designer's.
 * The optional rule turns a label into a compositional marker.
 */

type Props = {
  children: React.ReactNode;
  /** Draws a hairline before the label. */
  rule?: boolean;
  /** Uses the signal colour — reserve for the active/important one. */
  signal?: boolean;
  className?: string;
  as?: 'div' | 'span' | 'p';
};

export default function Meta({
  children, rule = false, signal = false, className = '', as: Tag = 'div',
}: Props) {
  return (
    <Tag className={`meta inline-flex items-center gap-3 ${signal ? '!text-signal' : ''} ${className}`}>
      {rule && (
        <span
          aria-hidden
          className={`h-px w-7 ${signal ? 'bg-signal/60' : 'bg-line-2'}`}
        />
      )}
      {children}
    </Tag>
  );
}
