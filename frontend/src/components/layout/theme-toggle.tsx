'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Light/dark switch for the topbar.
 *
 * Reads `resolvedTheme` rather than `theme` so it reflects the mode actually in
 * effect when the stored preference is "system".
 *
 * Rendering is deferred until mount: the server can't know the visitor's stored
 * or system preference, so painting an icon during SSR would risk a hydration
 * mismatch and a flash of the wrong icon. A same-size invisible placeholder holds
 * the space so the topbar doesn't shift when it appears.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="outline" size="icon" className="invisible" aria-hidden tabIndex={-1} />;
  }

  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
    >
      {/* Both icons are stacked; the `.dark` class on <html> cross-fades them by
          rotating/scaling one out and the other in for a smooth swap. */}
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      </span>
    </Button>
  );
}
