import { createElement } from 'react';

/*
 * Headings render as plain, immediately-visible static text — no splitting, no
 * hiding, no scroll-triggered reveal. They appear instantly with the rest of
 * the page (no lag, no "pop-in"). The trigger/delay/stagger props are accepted
 * for compatibility but intentionally ignored.
 */

type Props = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  trigger?: 'scroll' | 'load';
  delay?: number;
  stagger?: number;
  start?: string;
};

export default function SplitText({ as = 'h2', className = '', children }: Props) {
  return createElement(as, { className }, children);
}
