'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button for the XEN auth experience — the primary variant carries the brand
 * gradient, glow and hover-lift; `subtle` is the quiet secondary action.
 *
 * Presentational only: it forwards every native button prop, so `type="submit"`,
 * `disabled` and click handlers behave exactly as a plain <button>.
 */
// `children` is re-declared as plain ReactNode: Framer widens it to also accept
// MotionValue, which we never render here and which isn't a valid ReactNode.
interface XenButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'subtle';
  /** Swaps the label for a spinner and blocks interaction. */
  loading?: boolean;
  loadingText?: string;
}

export const XenButton = React.forwardRef<HTMLButtonElement, XenButtonProps>(
  (
    { variant = 'primary', loading, loadingText, disabled, className, children, ...props },
    ref
  ) => {
    const reduce = useReducedMotion();
    const isPrimary = variant === 'primary';
    const isBlocked = disabled || loading;

    return (
      <motion.button
        ref={ref}
        disabled={isBlocked}
        whileHover={reduce || isBlocked ? undefined : { y: -2 }}
        whileTap={reduce || isBlocked ? undefined : { y: 0, scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl',
          'text-[15px] font-semibold transition-shadow duration-300',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--xen-accent)/0.35)]',
          isPrimary
            ? 'text-white'
            : 'border border-[hsl(var(--xen-line))] bg-[hsl(var(--xen-card))] text-[hsl(var(--xen-ink))] hover:border-[hsl(var(--xen-accent)/0.45)]',
          className
        )}
        style={
          isPrimary
            ? {
                background: `linear-gradient(135deg, hsl(var(--xen-accent)), hsl(var(--xen-accent-soft)))`,
                boxShadow: `0 10px 30px -8px hsl(var(--xen-glow) / 0.6)`,
              }
            : undefined
        }
        {...props}
      >
        {/* Sheen that sweeps across on hover. */}
        {isPrimary && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText ?? 'Please wait…'}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
XenButton.displayName = 'XenButton';
