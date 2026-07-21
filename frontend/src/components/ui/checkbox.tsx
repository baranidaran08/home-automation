'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Checkbox built on a native `<input type="checkbox">` (kept visually hidden but
 * interactive), with a styled box + check overlay driven by the `peer` state.
 * Native input = free accessibility: keyboard, focus, and label association all
 * work, and it participates in forms. Styled to match the app's inputs/theme.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <span className={cn('relative inline-flex h-4 w-4 shrink-0', className)}>
      <input
        type="checkbox"
        ref={ref}
        className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0"
        {...props}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[4px] border border-input bg-transparent transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      />
      <Check
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
      />
    </span>
  )
);
Checkbox.displayName = 'Checkbox';
