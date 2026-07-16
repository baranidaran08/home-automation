'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface XenAuthPanelProps {
  children: ReactNode;
  /**
   * Heading for secondary flows (forgot / reset / change password). Omit it on
   * login, where the wordmark + platform subtitle are the header.
   */
  title?: string;
  description?: string;
}

/**
 * The XEN auth card: wordmark, heading, and the form.
 *
 * The card fades + slides + scales in as one object; the wordmark lands slightly
 * ahead of it (1.4s) so the brand reads first and the panel follows — the same
 * beat order as the hero's build-up.
 */
export function XenAuthPanel({ children, title, description }: XenAuthPanelProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-[28px] border p-7 sm:p-9"
      style={{
        background: `hsl(var(--xen-card))`,
        borderColor: `hsl(var(--xen-line))`,
        boxShadow: `0 1px 2px hsl(var(--xen-ink) / 0.04), 0 30px 70px -24px hsl(var(--xen-glow) / 0.35)`,
        willChange: 'transform, opacity',
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="relative inline-block">
          {/* Slow glow pulse behind the wordmark. */}
          <span
            aria-hidden
            className="xen-anim-pulse absolute -inset-x-4 -inset-y-3 rounded-full blur-2xl"
            style={{
              ['--xen-dur' as string]: '5s',
              background: `radial-gradient(circle, hsl(var(--xen-glow) / 0.28), transparent 70%)`,
            }}
          />
          <h1 className="relative text-[28px] font-bold leading-none tracking-tight sm:text-[32px]">
            <span style={{ color: `hsl(var(--xen-accent))` }}>XEN</span>{' '}
            <span style={{ color: `hsl(var(--xen-ink))` }}>Automation</span>
          </h1>
        </div>

        {title ? (
          <div className="mt-6">
            <h2
              className="text-lg font-semibold tracking-tight"
              style={{ color: `hsl(var(--xen-ink))` }}
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-[13px]" style={{ color: `hsl(var(--xen-muted))` }}>
                {description}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-[13px] font-medium" style={{ color: `hsl(var(--xen-muted))` }}>
            Smart Home Quotation Management Platform
          </p>
        )}
      </motion.div>

      {children}
    </motion.div>
  );
}
