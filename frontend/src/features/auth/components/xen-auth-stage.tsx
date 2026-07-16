'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * The XEN login stage: auth panel on the left, Automation Core hero on the
 * right, split evenly at 50/50 on desktop.
 *
 * The hero is code-split and client-only — it is a purely decorative animated
 * canvas, so rendering it on the server buys nothing and keeping it out of the
 * initial bundle lets the panel (the part users actually need) paint first.
 */
const AutomationCore = dynamic(
  () => import('./automation-core').then((m) => m.AutomationCore),
  { ssr: false }
);

export function XenAuthStage({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  // Gate the hero on a real media query rather than only hiding it with CSS:
  // `hidden md:block` would still mount the component, fetch its chunk and run
  // its animation loops on phones — invisibly burning battery. Below `md` it is
  // never mounted. The wrapper still uses CSS classes for the layout itself, so
  // there is no width flash on desktop.
  const showHero = useMediaQuery('(min-width: 768px)');

  return (
    // `xen-auth` scopes the login's own canvas/illustration tokens; they never
    // leak into the dashboard.
    <div className="xen-auth relative min-h-screen bg-[hsl(var(--xen-bg))] text-[hsl(var(--xen-ink))]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Panel — half the viewport on desktop. Slides in from the left at 1.6s. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex w-full flex-1 items-center justify-center p-6 sm:p-10 lg:w-1/2 lg:flex-none"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Mobile/tablet: the hero is hidden, so a soft animated wash stands in
              behind the card rather than a flat fill. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
            <div
              className="xen-anim-drift absolute left-1/2 top-1/4 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full blur-[100px]"
              style={{
                background: `radial-gradient(circle, hsl(var(--xen-glow) / var(--xen-glow-strength)), transparent 70%)`,
              }}
            />
            <div
              className="xen-anim-drift absolute bottom-0 right-[-10%] h-[20rem] w-[20rem] rounded-full blur-[90px]"
              style={{
                background: `radial-gradient(circle, hsl(var(--xen-accent-soft) / 0.16), transparent 70%)`,
                animationDelay: '-11s',
              }}
            />
          </div>

          <div className="relative w-full max-w-[26rem]">{children}</div>
        </motion.div>

        {/* Hero — the other half on desktop, stacked on tablet, hidden on mobile. */}
        <div className="relative hidden overflow-hidden md:block lg:w-1/2 lg:flex-none">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(140deg, hsl(var(--xen-bg)), hsl(var(--xen-card)))`,
            }}
          />
          {/* Hairline seam between panel and stage. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-px"
            style={{ background: `hsl(var(--xen-line))` }}
          />
          <div className="relative h-full min-h-[22rem] md:min-h-[26rem] lg:min-h-screen">
            {showHero && <AutomationCore />}
          </div>
        </div>
      </div>
    </div>
  );
}
