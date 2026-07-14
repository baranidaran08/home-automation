import type { RoleSummary } from './rbac';

/**
 * The authenticated session user (returned by /auth/login and /auth/me). Unlike
 * the managed `User` (types/rbac.ts) used in the Users table, this carries the
 * flat `permissions` key list the frontend gates UI with.
 */
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: RoleSummary;
  permissions: string[];
  /** True while the user still holds a temporary password (first-login lock). */
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Login form / request payload. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** POST /auth/change-password payload. */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/** POST /auth/forgot-password payload. */
export interface ForgotPasswordInput {
  email: string;
}

/** POST /auth/reset-password payload (token comes from the email link). */
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

/** `data` payload of the login, /me and change-password endpoints. */
export interface AuthPayload {
  user: AuthUser;
}
