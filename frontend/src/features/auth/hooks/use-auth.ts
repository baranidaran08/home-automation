'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import type { LoginCredentials } from '@/types/auth';

/**
 * Primary auth hook. Exposes the current session (from the Zustand store) plus
 * `login` / `logout` actions that keep the store in sync. The initial session
 * hydration happens once in `AuthProvider`.
 */
export function useAuth() {
  const router = useRouter();
  const { user, status, isAuthenticated, setAuthenticated, setUnauthenticated } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { user: loggedInUser } = await authService.login(credentials);
      setAuthenticated(loggedInUser);
      return loggedInUser;
    },
    [setAuthenticated]
  );

  const googleLogin = useCallback(
    async (idToken: string) => {
      const { user: loggedInUser } = await authService.googleLogin({ idToken });
      setAuthenticated(loggedInUser);
      return loggedInUser;
    },
    [setAuthenticated]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Clear local state even if the network call fails.
      setUnauthenticated();
      router.replace(ROUTES.auth.login);
    }
  }, [router, setUnauthenticated]);

  return { user, status, isAuthenticated, login, googleLogin, logout };
}
