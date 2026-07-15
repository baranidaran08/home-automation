import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface BrandLogoProps {
  /** Render as a link to the dashboard (sidebar) vs. plain text (auth pages). */
  href?: string | null;
  /** Show the small "ENTERPRISE" eyebrow under the wordmark. */
  showEyebrow?: boolean;
  className?: string;
}

/**
 * Xen Automation text-based wordmark. "Xen" carries the indigo brand weight and
 * "Automation" recedes, with a small letter-spaced ENTERPRISE eyebrow beneath —
 * the same premium two-tone treatment used across the app (sidebar, auth pages).
 * Purely presentational; no logic.
 */
export function BrandLogo({ href = ROUTES.dashboard.root, showEyebrow = true, className }: BrandLogoProps) {
  const mark = (
    <span className="block text-[19px] font-bold leading-none tracking-tight">
      <span className="text-primary">Xen</span>
      <span className="text-foreground"> Automation</span>
    </span>
  );

  const content = (
    <span className={cn('block select-none', className)}>
      {mark}
      {showEyebrow && (
        <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Enterprise
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
