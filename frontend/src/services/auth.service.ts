import { httpService } from './http.service';
import type {
  AuthUser,
  AuthPayload,
  LoginCredentials,
  GoogleLoginInput,
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

  /** Authenticate a pre-invited user with a Google ID token (credential). */
  googleLogin: (input: GoogleLoginInput) =>
    httpService.post<AuthPayload, GoogleLoginInput>('/auth/google', input),

  logout: () => httpService.post<null>('/auth/logout'),

  getCurrentUser: () => httpService.get<AuthPayload>('/auth/me'),

  changePassword: (input: ChangePasswordInput) =>
    httpService.post<AuthPayload, ChangePasswordInput>('/auth/change-password', input),

  /**
   * Update the signed-in user's own profile (name/email/phone/picture). Sent as
   * multipart so the same call covers text-only edits and avatar upload/remove;
   * returns the refreshed session user for the auth store.
   */
  updateProfile: (formData: FormData) => httpService.patchForm<AuthPayload>('/profile', formData),

  forgotPassword: (input: ForgotPasswordInput) =>
    httpService.post<null, ForgotPasswordInput>('/auth/forgot-password', input),

  resetPassword: (input: ResetPasswordInput) =>
    httpService.post<null, ResetPasswordInput>('/auth/reset-password', input),
};

export type { AuthUser, LoginCredentials };
