import { useEffect, useState } from 'react';

/**
 * Returns `true` only after the component has mounted on the client. Useful to
 * avoid hydration mismatches when rendering theme- or window-dependent UI.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
