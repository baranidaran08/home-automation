'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { XenLogo } from '@/components/layout/xen-logo';

const FEATURES = [
  'Professional Quotations',
  'Product Management',
  'Template Library',
  'Customer Projects',
  'Secure Dashboard',
] as const;

interface BrandPanelProps {
  /** Start the reveal once the panel has slid into place. */
  active?: boolean;
}

/**
 * Right-hand branding panel shown alongside the login form. On activation the
 * heading and description fade in and the feature highlights cascade one after
 * another. Uses only the app's tokens — no gradients or glass — so it reads as a
 * calm, on-brand surface next to the form.
 */
export function BrandPanel({ active = true }: BrandPanelProps) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.1 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={active ? 'show' : 'hidden'}
      className="relative flex h-full w-full flex-col justify-center gap-8 overflow-hidden bg-card px-10 py-12 lg:px-14"
    >
      {/* Subtle depth: soft brand washes in the corners so the panel isn't flat. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <motion.div variants={item} className="relative">
        {/* Framed logo tile (matches the welcome screen). */}
        <div className="relative inline-block">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-2xl bg-primary/10 blur-xl"
          />
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-border/70 shadow-xl">
            <XenLogo className="block w-40" />
          </div>
        </div>
      </motion.div>

      <motion.h2
        variants={item}
        className="relative max-w-md text-2xl font-bold leading-snug tracking-tight text-foreground lg:text-3xl"
      >
        Everything you need to manage your smart home business.
      </motion.h2>

      <motion.p
        variants={item}
        className="relative max-w-md text-sm leading-relaxed text-muted-foreground"
      >
        Generate quotations, organize templates, manage products, monitor projects, and securely
        access your dashboard from one place.
      </motion.p>

      <ul className="relative space-y-3">
        {FEATURES.map((feature) => (
          <motion.li key={feature} variants={item} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium text-foreground">{feature}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
