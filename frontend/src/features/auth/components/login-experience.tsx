'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMounted } from '@/hooks/use-mounted';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WelcomeBrand } from './welcome-brand';
import { WelcomeIntro } from './welcome-intro';
import { LoginPanel } from './login-panel';
import { BrandPanel } from './brand-panel';

type Phase = 'welcome' | 'login';

/**
 * Orchestrates the login experience as a two-slot sliding swap.
 *
 * Desktop/tablet: the welcome screen (logo on the left, intro on the right)
 * slides into the login layout when "Sign In" is clicked — each column is a slot
 * that clips its content:
 *   - LEFT slot:  the logo slides RIGHT out while the login form slides in from the LEFT.
 *   - RIGHT slot: the intro slides LEFT out while the brand panel slides in from the RIGHT.
 * A subtle scale on the card completes the motion; the email field is focused
 * once the entrance finishes. A Back button reverses the whole slide.
 *
 * Mobile: no welcome screen and no slide — the login form appears immediately
 * with a subtle fade + slide-up.
 *
 * Purely presentational: all authentication lives in <LoginPanel/>.
 */
export function LoginExperience() {
  const mounted = useMounted();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('welcome');
  const emailRef = useRef<HTMLInputElement | null>(null);

  const goToLogin = useCallback(() => setPhase('login'), []);
  const goToWelcome = useCallback(() => setPhase('welcome'), []);

  // Avoid committing to a layout branch until we know the viewport (prevents a
  // welcome-screen flash on mobile / hydration mismatch).
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const dur = reduce ? 0 : 0.6;
  const ease = 'easeInOut' as const;
  const slide = { duration: dur, ease };

  // Mobile: a compact card with the form immediately — only a subtle fade + slide-up.
  if (!isDesktop) {
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div aria-hidden className="dashboard-canvas pointer-events-none fixed inset-0 -z-10" />
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8"
        >
          <LoginPanel emailRef={emailRef} />
        </motion.div>
      </div>
    );
  }

  const inLogin = phase === 'login';

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <div aria-hidden className="dashboard-canvas pointer-events-none fixed inset-0 -z-10" />

      {/* Contained card. The subtle scale completes the sliding motion. */}
      <motion.div
        className="relative h-[min(88vh,780px)] w-full max-w-6xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
        initial={false}
        animate={{ scale: inLogin ? 1 : 0.98 }}
        transition={slide}
      >
        <div className="grid h-full grid-cols-2">
          {/* LEFT slot: logo (welcome) slides right out ↔ login form slides in from left. */}
          <div className="relative h-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-card"
              initial={false}
              animate={{ x: inLogin ? '100%' : '0%' }}
              transition={slide}
            >
              <WelcomeBrand />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-card px-8 py-12 lg:px-16"
              initial={false}
              animate={{ x: inLogin ? '0%' : '-100%' }}
              transition={slide}
              onAnimationComplete={() => {
                if (inLogin) emailRef.current?.focus();
              }}
            >
              <LoginPanel emailRef={emailRef} onBack={goToWelcome} />
            </motion.div>
          </div>

          {/* RIGHT slot: intro (welcome) slides left out ↔ brand panel slides in from right. */}
          <div className="relative h-full overflow-hidden border-l border-border">
            <motion.div
              className="absolute inset-0 bg-card"
              initial={false}
              animate={{ x: inLogin ? '-100%' : '0%' }}
              transition={slide}
            >
              <WelcomeIntro onSignIn={goToLogin} />
            </motion.div>

            <motion.div
              className="absolute inset-0 bg-card"
              initial={false}
              animate={{ x: inLogin ? '0%' : '100%' }}
              transition={slide}
            >
              <BrandPanel active={inLogin} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
