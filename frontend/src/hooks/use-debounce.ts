import { useEffect, useState } from 'react';

/**
 * Debounce a rapidly-changing value (e.g. a search input) so downstream
 * effects/queries only run after the value settles.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
