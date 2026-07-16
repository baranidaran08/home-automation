'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Floating-label field for the XEN login experience.
 *
 * Purely presentational: it forwards the ref and every native prop straight
 * through, so React Hook Form's `register()` (onChange/onBlur/name/ref) keeps
 * working exactly as before — this component never owns or inspects form state.
 *
 * The label floats using the CSS-only `:placeholder-shown` technique rather than
 * tracking focus/value in React: no re-renders, and it stays correct even when
 * the field is autofilled by a password manager (a JS `value` listener misses
 * autofill in some browsers).
 */
interface XenFieldProps extends React.ComponentProps<'input'> {
  label: string;
  /** Rendered inside the field on the right (e.g. a show/hide password toggle). */
  trailing?: React.ReactNode;
  invalid?: boolean;
}

export const XenField = React.forwardRef<HTMLInputElement, XenFieldProps>(
  ({ label, trailing, invalid, className, id, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;

    return (
      <div className="relative">
        <input
          id={fieldId}
          ref={ref}
          // A space keeps :placeholder-shown meaningful while showing nothing.
          placeholder=" "
          aria-invalid={invalid || undefined}
          className={cn(
            'peer h-14 w-full rounded-2xl border px-4 pb-1 pt-6 text-[15px] outline-none transition-all duration-300',
            'text-[hsl(var(--xen-ink))] [color-scheme:normal]',
            'bg-[hsl(var(--xen-card))] border-[hsl(var(--xen-line))]',
            'shadow-[0_1px_2px_hsl(var(--xen-ink)/0.04)]',
            'hover:border-[hsl(var(--xen-accent)/0.45)]',
            'focus:border-[hsl(var(--xen-accent))] focus:shadow-[0_0_0_4px_hsl(var(--xen-accent)/0.15),0_8px_24px_-8px_hsl(var(--xen-glow)/0.5)]',
            invalid &&
              'border-destructive focus:border-destructive focus:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]',
            trailing && 'pr-12',
            className
          )}
          {...props}
        />

        <label
          htmlFor={fieldId}
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium',
            'text-[hsl(var(--xen-muted))] transition-all duration-200 ease-out',
            // Rest state = floated. It drops back down only while the field is
            // empty AND unfocused, which is exactly `:placeholder-shown`.
            'top-2 translate-y-0 text-[11px] uppercase tracking-wider',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal',
            'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider',
            'peer-focus:text-[hsl(var(--xen-accent))]'
          )}
        >
          {label}
        </label>

        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    );
  }
);
XenField.displayName = 'XenField';
