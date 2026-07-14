import { httpService } from './http.service';
import type {
  AuthUser,
  AuthPayload,
  LoginCredentials,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/types/auth';

/**
 * Auth API calls. The JWT is handled entirely via an httpOnly cookie set by
 * the backend (axios is configured with `withCredentials`), so no token is
 * read or stored in JS here.
 */
export const authService = {
  login: (credentials: LoginCredentials) =>
    httpService.post<AuthPayload, LoginCredentials>('/auth/login', credentials),

  logout: () => httpService.post<null>('/auth/logout'),

  getCurrentUser: () => httpService.get<AuthPayload>('/auth/me'),

  changePassword: (input: ChangePasswordInput) =>
    httpService.post<AuthPayload, ChangePasswordInput>('/auth/change-password', input),

  forgotPassword: (input: ForgotPasswordInput) =>
    httpService.post<null, ForgotPasswordInput>('/auth/forgot-password', input),

  resetPassword: (input: ResetPasswordInput) =>
    httpService.post<null, ResetPasswordInput>('/auth/reset-password', input),
};

export type { AuthUser, LoginCredentials };
