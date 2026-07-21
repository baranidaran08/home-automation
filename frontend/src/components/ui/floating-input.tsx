'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FloatingInputProps extends React.ComponentProps<'input'> {
  label: string;
  /** Rendered inside the field on the right (e.g. a show/hide password toggle). */
  trailing?: React.ReactNode;
  invalid?: boolean;
}

/**
 * Premium floating-label input. The label sits centred while the field is empty
 * and unfocused, then floats up on focus/entry — a CSS-only effect via
 * `:placeholder-shown` (no JS, and it stays correct when autofilled). Styled with
 * the app's own tokens (not a separate palette), so it matches the rest of the UI
 * while giving the login form a more refined feel than a plain input.
 */
export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, trailing, invalid, className, id, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;

    return (
      <div className="relative">
        <input
          id={fieldId}
          ref={ref}
          // A single space keeps :placeholder-shown meaningful while showing nothing.
          placeholder=" "
          aria-invalid={invalid || undefined}
          className={cn(
            'peer h-14 w-full rounded-2xl border border-input bg-secondary/50 px-4 pb-1 pt-6 text-[15px] text-foreground outline-none transition-all',
            'placeholder:text-transparent',
            'hover:border-primary/40',
            'focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15',
            trailing && 'pr-12',
            className
          )}
          {...props}
        />

        <label
          htmlFor={fieldId}
          className={cn(
            // Rest state = floated (small, up-top).
            'pointer-events-none absolute left-4 top-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-all duration-200 ease-out',
            // Drops back to centre only while empty AND unfocused.
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal',
            // Floats up + brand-tints on focus.
            'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-primary'
          )}
        >
          {label}
        </label>

        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';
