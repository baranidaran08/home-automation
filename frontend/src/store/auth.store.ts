import { create } from 'zustand';
import type { Admin } from '@/types/auth';

/**
 * Auth session state.
 *
 * - `status: 'loading'` while the initial `/auth/me` check is in flight — route
 *   guards wait for this to resolve before deciding to redirect.
 * - The JWT itself is never stored here (it lives in an httpOnly cookie); this
 *   store only tracks the resolved admin profile + status.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  admin: Admin | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  setAuthenticated: (admin: Admin) => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  status: 'loading',
  isAuthenticated: false,
  setAuthenticated: (admin) => set({ admin, status: 'authenticated', isAuthenticated: true }),
  setUnauthenticated: () =>
    set({ admin: null, status: 'unauthenticated', isAuthenticated: false }),
}));
