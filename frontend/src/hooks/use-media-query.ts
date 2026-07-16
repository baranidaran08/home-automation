'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query from JS.
 *
 * Use this only when a breakpoint must change WHAT RENDERS (e.g. skipping a
 * heavy decorative subtree on phones so its chunk is never fetched and its
 * animation loops never run). For purely visual differences prefer Tailwind's
 * responsive classes — CSS needs no JS and no re-render.
 *
 * Starts `false` and resolves after mount, since the server has no viewport.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange(); // sync with the real viewport on mount
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
