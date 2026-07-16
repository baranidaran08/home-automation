'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTransitionOverlayStore } from '@/store/transition.store';

/**
 * Fullscreen XEN brand transition, played over a screen change (today: after a
 * successful login, while the guards navigate to the dashboard underneath).
 *
 * Sequence: overlay fades in → glowing "X" → "EN" joins to form XEN → the line
 * recentres as "Automation" appears → an energy sweep crosses the text → the
 * tagline lands → short hold → the logo shrinks toward the top-left while the
 * backdrop fades, revealing whatever is now rendered behind it.
 *
 * Deliberately PURELY VISUAL: it never navigates, touches auth state, or delays
 * an API call. The screen change it masks happens underneath on its own
 * schedule; this component only controls what the user sees. Trigger it with
 * `useTransitionOverlayStore.start()` after the masked action has succeeded.
 *
 * Total runtime ~4.0s (~1.7s with prefers-reduced-motion, which swaps the
 * choreography for a plain crossfade of the static wordmark).
 */

/** Entrance beats (seconds). */
const T = {
  x: 0.2,
  e: 0.62,
  n: 0.74,
  word: 0.98,
  sweep: 1.35,
  tagline: 1.45,
} as const;

/**
 * When the exit (shrink + reveal) begins / the overlay unmounts (ms).
 *
 * The gap between the tagline settling (~2.0s) and EXIT_MS is the READING
 * time for the full lockup — this is the number to tune if the tagline
 * vanishes before it can be read, not the letter timings above.
 */
const EXIT_MS = 3300;
const DONE_MS = 3950;

/** Reduced motion: simple crossfade timings (ms). */
const REDUCED_EXIT_MS = 1300;
const REDUCED_DONE_MS = 1700;

const EASE = [0.16, 1, 0.3, 1] as const;

export function TransitionOverlay() {
  const active = useTransitionOverlayStore((s) => s.active);
  const finish = useTransitionOverlayStore((s) => s.finish);
  const reduce = useReducedMotion();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!active) return;
    setExiting(false);

    const exitAt = reduce ? REDUCED_EXIT_MS : EXIT_MS;
    const doneAt = reduce ? REDUCED_DONE_MS : DONE_MS;
    const exitTimer = setTimeout(() => setExiting(true), exitAt);
    const doneTimer = setTimeout(finish, doneAt);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [active, reduce, finish]);

  if (!active) return null;

  // Reduced motion: no transforms at all — fade the static wordmark in and out.
  if (reduce) {
    return (
      <div aria-hidden className="fixed inset-0 z-[100]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 grid place-items-center bg-background"
        >
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight">
              <span className="text-primary">XEN</span> Automation
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Smart Home Automation Platform</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div aria-hidden className="fixed inset-0 z-[100]">
      {/* Backdrop — theme-aware via tokens. Fading it out during exit is what
          "fades the dashboard in": the dashboard is already mounted behind. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: exiting ? 0.6 : 0.2 }}
        className="absolute inset-0 bg-background"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 45%, hsl(var(--primary) / 0.12), transparent 60%)`,
          }}
        />
      </motion.div>

      {/* Logo group: forms in the centre, then shrinks toward the top-left
          (where the sidebar wordmark lives) as the backdrop clears. */}
      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          animate={
            exiting
              ? { x: '-36vw', y: '-40vh', scale: 0.3, opacity: 0 }
              : { x: '0vw', y: '0vh', scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* The line starts shifted right so the lone "X" reads as centred,
              then recentres as the remaining words appear. */}
          <motion.p
            initial={{ x: '34%' }}
            animate={{ x: '0%' }}
            transition={{ delay: T.word, duration: 0.6, ease: EASE }}
            className="relative -mx-4 -my-3 overflow-hidden px-4 py-3 text-5xl font-bold tracking-tight sm:text-6xl"
          >
            <span className="relative inline-block text-primary">
              {/* Glow behind the X (a blurred disc, not text-shadow: Framer can't
                  interpolate shadows containing CSS variables). */}
              <motion.span
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0.6], scale: [0.4, 1.25, 1] }}
                transition={{ delay: T.x, duration: 0.85, ease: 'easeOut' }}
                className="absolute -inset-4 rounded-full blur-xl"
                style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.55), transparent 70%)` }}
              />
              <motion.span
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: T.x, duration: 0.6, ease: EASE }}
                className="relative inline-block"
              >
                X
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: T.e, duration: 0.5, ease: EASE }}
                className="relative inline-block"
              >
                E
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: T.n, duration: 0.5, ease: EASE }}
                className="relative inline-block"
              >
                N
              </motion.span>
            </span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: T.word, duration: 0.6, ease: EASE }}
              className="inline-block"
            >
              &nbsp;Automation
            </motion.span>

            {/* Energy sweep across the finished wordmark. */}
            <motion.span
              initial={{ x: '-150%', opacity: 0 }}
              animate={{ x: '520%', opacity: [0, 1, 1, 0] }}
              transition={{ delay: T.sweep, duration: 0.65, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-y-0 w-24 -skew-x-12"
              style={{
                background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.35), transparent)`,
                filter: 'blur(6px)',
              }}
            />
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: T.tagline, duration: 0.55, ease: EASE }}
            className="mt-3 text-sm font-medium text-muted-foreground sm:text-base"
          >
            Smart Home Automation Platform
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
