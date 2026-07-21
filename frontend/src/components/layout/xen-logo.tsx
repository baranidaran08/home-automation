import { cn } from '@/lib/utils';

/**
 * The Xen Automation brand logo (full lockup image served from /public).
 * Size is controlled by the caller via `className` (e.g. `w-64`, `h-auto` is
 * applied by default so aspect ratio is preserved). Swap the file at
 * `public/xen-logo.png` to update the artwork everywhere it's used.
 */
export function XenLogo({ className }: { className?: string }) {
  return (
    // Static brand asset in /public; next/image adds no value here and would
    // need explicit dimensions for a variable-size logo.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/xen-logo.png"
      alt="Xen Automation"
      className={cn('h-auto w-auto select-none', className)}
    />
  );
}
