'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Initials for the image-less fallback: first letter for a single-word name
 * ("Sarah" → "S"), first + last initial for multi-word names ("John Doe" → "JD",
 * "Barani Daran" → "BD", "John Michael Doe" → "JD").
 */
export function initialsOf(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return 'U';
  const first = parts[0]?.[0] ?? '';
  if (parts.length === 1) return first.toUpperCase() || 'U';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase() || 'U';
}

interface AvatarProps {
  /** Picture URL. When absent or it fails to load, initials are shown instead. */
  src?: string | null;
  /** Used for the alt text and the initials fallback. */
  name?: string | null;
  className?: string;
}

/**
 * Circular avatar with a graceful initials fallback. Intentionally dependency-free
 * (a plain `<img>` + state) — Radix Avatar isn't needed for this simple case. Size
 * and text size come from `className` (e.g. `h-10 w-10 text-sm`), so one component
 * covers the topbar chip and the large profile header alike.
 */
export function Avatar({ src, name, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  // Reset the error state when the source changes (e.g. after an upload) so a new
  // URL gets a fresh chance to load rather than staying stuck on the fallback.
  useEffect(() => setFailed(false), [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        // Solid brand background so the initials fallback stays legible and
        // on-brand; when an image is shown it covers the fill entirely.
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold uppercase text-primary-foreground',
        className
      )}
      aria-hidden={false}
    >
      {showImage ? (
        // Remote Cloudinary avatars of arbitrary origin; next/image adds no value
        // for a small chip and would need per-host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={name ? `${name}'s profile picture` : 'Profile picture'}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initialsOf(name)}</span>
      )}
    </span>
  );
}
