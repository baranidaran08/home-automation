import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';

/**
 * Auth session state.
 *
 * - `status: 'loading'` while the initial `/auth/me` check is in flight — route
 *   guards wait for this to resolve before deciding to redirect.
 * - The JWT itself is never stored here (it lives in an httpOnly cookie); this
 *   store only tracks the resolved user profile + status. The user carries its
 *   role and the flat `permissions` key list used to gate the UI.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  setAuthenticated: (user: AuthUser) => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  isAuthenticated: false,
  setAuthenticated: (user) => set({ user, status: 'authenticated', isAuthenticated: true }),
  setUnauthenticated: () =>
    set({ user: null, status: 'unauthenticated', isAuthenticated: false }),
}));
