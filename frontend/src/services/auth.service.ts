import { httpService } from './http.service';
import type { Admin, AuthPayload, LoginCredentials } from '@/types/auth';

/**
 * Auth API calls. The JWT is handled entirely via an httpOnly cookie set by
 * the backend (axios is configured with `withCredentials`), so no token is
 * read or stored in JS here.
 */
export const authService = {
  login: (credentials: LoginCredentials) =>
    httpService.post<AuthPayload, LoginCredentials>('/auth/login', credentials),

  logout: () => httpService.post<null>('/auth/logout'),

  getCurrentAdmin: () => httpService.get<AuthPayload>('/auth/me'),
};

export type { Admin, LoginCredentials };
