'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

/**
 * Hydrates the auth session once on app load by calling `GET /auth/me` (the
 * httpOnly cookie is sent automatically). Populates the auth store so route
 * guards can make redirect decisions. Renders children immediately — guards,
 * not this provider, decide what to show while `status === 'loading'`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  const hydrated = useRef(false);

  useEffect(() => {
    // Guard against double-invocation in React StrictMode (dev).
    if (hydrated.current) return;
    hydrated.current = true;

    let active = true;
    authService
      .getCurrentUser()
      .then(({ user }) => {
        if (active) setAuthenticated(user);
      })
      .catch(() => {
        if (active) setUnauthenticated();
      });

    return () => {
      active = false;
    };
  }, [setAuthenticated, setUnauthenticated]);

  return <>{children}</>;
}
