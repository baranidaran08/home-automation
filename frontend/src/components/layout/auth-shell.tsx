import type { ReactNode } from 'react';
import { BrandLogo } from './brand-logo';

/**
 * Centered shell shared by every out-of-app page (login, forgot/reset password,
 * first-login change password): decorative backdrop + wordmark + a narrow content
 * column. The route groups differ only in which guard wraps this, so the visual
 * shell lives here once instead of being duplicated three times.
 *
 * The backdrop is built from theme tokens (`--border`, `--primary`), so it
 * re-tints itself for light/dark with no per-theme markup. It is pure CSS — no
 * images, no extra requests.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      {/* Decorative only — hidden from assistive tech and never intercepts clicks. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 auth-grid opacity-70" />

        {/* Indigo aurora bloom behind the card. Slightly stronger in dark mode,
            where a diffuse glow reads as depth rather than haze. */}
        <div className="absolute left-1/2 top-[-12%] h-[520px] w-[820px] max-w-[150vw] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px] dark:bg-primary/25" />

        {/* Off-centre secondary bloom so the composition isn't perfectly symmetric. */}
        <div className="absolute bottom-[-18%] right-[2%] h-[400px] w-[560px] max-w-[110vw] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
      </div>

      <div className="relative z-10 mb-8 text-center">
        <BrandLogo href={null} />
      </div>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
