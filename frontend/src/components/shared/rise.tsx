import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RiseProps {
  /** Stagger position: each step delays the entrance by 70ms. */
  index?: number;
  className?: string;
  children: ReactNode;
}

/**
 * One-shot entrance wrapper: the content fades in and rises when it mounts
 * (i.e. on navigation), staggered against siblings by `index`. Pure CSS — no
 * client JS, so it works inside server components — and it respects
 * `prefers-reduced-motion` via the `.anim-rise` media query.
 *
 * Because the animation runs on this wrapper, children keep their own hover
 * transforms (e.g. card lifts) without conflict.
 */
export function Rise({ index = 0, className, children }: RiseProps) {
  return (
    <div className={cn('anim-rise', className)} style={{ '--rise-index': index } as CSSProperties}>
      {children}
    </div>
  );
}
