import { XenLogo } from '@/components/layout/xen-logo';

/**
 * Welcome-screen left slot: the framed Xen Automation logo over a soft brand
 * glow. Fills its slot so it can slide as one unit. Presentational only.
 */
export function WelcomeBrand() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-primary/15 blur-2xl"
        />
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-border/70 shadow-2xl">
          <XenLogo className="block w-60 max-w-full" />
        </div>
      </div>
    </div>
  );
}
