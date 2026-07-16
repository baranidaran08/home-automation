'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Cpu, Lightbulb, Lock, Thermometer, Video, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * XEN "Automation Core" — the identity object of the login experience.
 *
 * An original scene built from CSS geometry (no stock art, no image requests):
 * a matte shell split into two halves, a glowing energy core, independently
 * rotating orbital rings, smart-device nodes wired by thin light traces, and
 * drifting particles.
 *
 * Motion is split deliberately:
 *  - Framer Motion drives the one-shot ENTRANCE timeline (it needs sequencing).
 *  - CSS keyframes drive the perpetual IDLE loop, so the compositor runs it on
 *    the GPU with zero per-frame React work.
 * Everything animates transform/opacity only — never layout-triggering props.
 *
 * Purely decorative: `aria-hidden`, no interactive content, no app state.
 */

/** Entrance beats (seconds) — the story the page tells on load. */
const T = {
  ambient: 0.2,
  shell: 0.5,
  core: 0.8,
  rings: 1.0,
  nodes: 1.2,
} as const;

/**
 * Smart-home nodes placed around the core; `angle` is degrees on the orbit and
 * `radius` is % of the stage from centre. The radii sit slightly inside the
 * rings so the enlarged tiles don't clip the stage edge on wide screens.
 */
const NODES = [
  { icon: Lightbulb, angle: -90, radius: 41, delay: 0 },
  { icon: Video, angle: -25, radius: 44, delay: 0.6 },
  { icon: Thermometer, angle: 40, radius: 40, delay: 1.2 },
  { icon: Lock, angle: 118, radius: 43, delay: 0.3 },
  { icon: Wifi, angle: 195, radius: 41, delay: 0.9 },
  { icon: Cpu, angle: 250, radius: 44, delay: 1.5 },
] as const;

/** Convert a polar position (% radius from centre) into CSS left/top percentages. */
const polar = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(rad) * radius}%`,
    top: `${50 + Math.sin(rad) * radius}%`,
  };
};

export function AutomationCore({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  // --- Mouse parallax -------------------------------------------------------
  // Normalised -0.5..0.5 pointer position, smoothed by a spring so the scene
  // eases rather than snapping. Springs are cheap: they drive transforms only.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 55, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring);
  const shiftX = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), spring);
  const shiftY = useSpring(useTransform(py, [-0.5, 0.5], [-10, 10]), spring);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  // With reduced motion we still compose the full scene — just statically.
  const enter = (delay: number, extra: Record<string, unknown> = {}) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, ...extra },
          animate: { opacity: 1, scale: 1, rotate: 0, y: 0 },
          transition: { delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-hidden
      className={cn('relative isolate h-full w-full overflow-hidden', className)}
    >
      {/* 0.2s — ambient brand light wash, slowly drifting. */}
      <motion.div
        {...enter(T.ambient)}
        className="pointer-events-none absolute inset-0"
        style={{ willChange: 'opacity' }}
      >
        <div
          className="xen-anim-drift absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
          style={{
            background: `radial-gradient(circle, hsl(var(--xen-glow) / var(--xen-glow-strength)), transparent 70%)`,
          }}
        />
        <div
          className="xen-anim-drift absolute left-[18%] top-[70%] h-[42%] w-[42%] rounded-full blur-[100px]"
          style={{
            background: `radial-gradient(circle, hsl(var(--xen-accent-soft) / 0.18), transparent 70%)`,
            animationDelay: '-8s',
          }}
        />
      </motion.div>

      {/* Parallax stage. `perspective` gives the rings real depth on tilt. */}
      <motion.div
        style={{ rotateX, rotateY, x: shiftX, y: shiftY, perspective: 1200 }}
        className="absolute inset-0 grid place-items-center"
      >
        <div className="relative aspect-square w-[min(78%,34rem)]">
          {/* 1.0s — orbital rings, each rotating independently. */}
          {[
            { size: 100, dur: '46s', tilt: 'rotateX(74deg)', rev: false, op: 0.55 },
            { size: 84, dur: '34s', tilt: 'rotateX(66deg) rotateZ(28deg)', rev: true, op: 0.45 },
            { size: 116, dur: '62s', tilt: 'rotateX(80deg) rotateZ(-16deg)', rev: false, op: 0.3 },
          ].map((ring, i) => (
            <motion.div
              key={i}
              {...enter(T.rings + i * 0.12, { scale: 0.7, rotate: -25 })}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: `${ring.size}%`, height: `${ring.size}%`, transformStyle: 'preserve-3d' }}
            >
              <div className="h-full w-full" style={{ transform: ring.tilt }}>
                <div
                  className={cn('h-full w-full rounded-full', ring.rev ? 'xen-anim-spin-reverse' : 'xen-anim-spin')}
                  style={{
                    ['--xen-dur' as string]: ring.dur,
                    opacity: ring.op,
                    border: '1px solid hsl(var(--xen-accent) / 0.5)',
                    boxShadow: `0 0 24px hsl(var(--xen-glow) / 0.25), inset 0 0 24px hsl(var(--xen-glow) / 0.15)`,
                    willChange: 'transform',
                  }}
                />
              </div>
            </motion.div>
          ))}

          {/* 0.5s — matte shell, split into two halves that part to reveal the core. */}
          <motion.div
            {...enter(T.shell, { scale: 0.82, rotate: -12 })}
            className="absolute inset-[16%]"
          >
            {/* Upper hemisphere */}
            <motion.div
              initial={reduce ? false : { y: '18%' }}
              animate={{ y: 0 }}
              transition={{ delay: T.shell + 0.35, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-0 h-1/2 overflow-hidden"
              style={{ willChange: 'transform' }}
            >
              <div
                className="h-[200%] w-full rounded-full"
                style={{
                  background: `linear-gradient(160deg, hsl(var(--xen-shell-a)), hsl(var(--xen-shell-b)))`,
                  boxShadow: `inset 0 2px 30px hsl(var(--xen-glow) / 0.25), 0 24px 60px -12px hsl(var(--xen-glow) / 0.35)`,
                  border: '1px solid hsl(var(--xen-accent) / 0.22)',
                }}
              />
            </motion.div>

            {/* Lower hemisphere */}
            <motion.div
              initial={reduce ? false : { y: '-18%' }}
              animate={{ y: 0 }}
              transition={{ delay: T.shell + 0.35, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden"
              style={{ willChange: 'transform' }}
            >
              <div
                className="absolute bottom-0 h-[200%] w-full rounded-full"
                style={{
                  background: `linear-gradient(20deg, hsl(var(--xen-shell-b)), hsl(var(--xen-shell-a)))`,
                  boxShadow: `inset 0 -2px 30px hsl(var(--xen-glow) / 0.25), 0 -18px 50px -12px hsl(var(--xen-glow) / 0.3)`,
                  border: '1px solid hsl(var(--xen-accent) / 0.22)',
                }}
              />
            </motion.div>
          </motion.div>

          {/* 0.8s — the energy core in the gap between the halves. */}
          <motion.div
            {...enter(T.core, { scale: 0.3 })}
            className="absolute inset-[34%] grid place-items-center"
          >
            <div
              className="xen-anim-pulse h-full w-full rounded-full"
              style={{
                background: `radial-gradient(circle at 38% 34%, hsl(var(--xen-accent-soft)), hsl(var(--xen-accent)) 55%, hsl(var(--xen-accent) / 0.25) 100%)`,
                boxShadow: `0 0 60px hsl(var(--xen-glow) / 0.75), 0 0 120px hsl(var(--xen-glow) / 0.4)`,
                willChange: 'transform, opacity',
              }}
            />
          </motion.div>

          {/* 1.2s — smart nodes + the light traces wiring them to the core. */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
            {NODES.map((n, i) => {
              const rad = (n.angle * Math.PI) / 180;
              return (
                <motion.line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + Math.cos(rad) * n.radius}
                  y2={50 + Math.sin(rad) * n.radius}
                  stroke="hsl(var(--xen-accent))"
                  strokeWidth="0.22"
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ delay: T.nodes + i * 0.08, duration: 0.9, ease: 'easeOut' }}
                />
              );
            })}
          </svg>

          {NODES.map((n, i) => {
            const Icon = n.icon;
            return (
              <motion.div
                key={i}
                {...enter(T.nodes + i * 0.08, { scale: 0.4 })}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={polar(n.angle, n.radius)}
              >
                <div
                  className="xen-anim-float grid h-12 w-12 place-items-center rounded-2xl backdrop-blur-sm sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                  style={{
                    ['--xen-dur' as string]: `${5.5 + i * 0.4}s`,
                    animationDelay: `${n.delay}s`,
                    background: `hsl(var(--xen-card) / 0.75)`,
                    border: '1px solid hsl(var(--xen-accent) / 0.3)',
                    boxShadow: `0 8px 24px -6px hsl(var(--xen-glow) / 0.45)`,
                    willChange: 'transform',
                  }}
                >
                  <Icon
                    className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                    strokeWidth={1.75}
                    style={{ color: `hsl(var(--xen-accent))` }}
                  />
                </div>
              </motion.div>
            );
          })}

          {/* Drifting light particles. */}
          {!reduce &&
            Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 14) * 360;
              const r = 52 + ((i * 37) % 22);
              return (
                <motion.span
                  key={i}
                  className="xen-anim-float absolute h-1 w-1 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.15, 0.7, 0.15] }}
                  transition={{
                    delay: T.nodes + (i % 5) * 0.2,
                    duration: 3 + (i % 4),
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    ...polar(a, r),
                    ['--xen-dur' as string]: `${6 + (i % 5)}s`,
                    animationDelay: `${i * 0.35}s`,
                    background: `hsl(var(--xen-accent-soft))`,
                    boxShadow: `0 0 8px hsl(var(--xen-glow) / 0.9)`,
                  }}
                />
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
