import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { env } from '@/constants/env';
import type { ApiErrorResponse } from '@/types';

/**
 * Pre-configured Axios instance for talking to the backend API.
 *
 * - Base URL points at the versioned API (`/api`).
 * - A request interceptor attaches the auth token (wired up when the auth
 *   module lands).
 * - A response interceptor unwraps errors into a predictable shape.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Placeholder token accessor — swapped for the real auth store later.
let authTokenGetter: () => string | null = () => null;

/** Register how the axios client should obtain the current auth token. */
export const setAuthTokenGetter = (getter: () => string | null) => {
  authTokenGetter = getter;
};

apiClient.interceptors.request.use((config) => {
  const token = authTokenGetter();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Normalise to a consistent, throwable error object for callers/UI.
    const normalized: NormalizedApiError = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.message ??
        error.message ??
        'An unexpected error occurred. Please try again.',
      errors: error.response?.data?.errors,
    };
    return Promise.reject(normalized);
  }
);

export interface NormalizedApiError {
  status: number;
  message: string;
  errors?: { path: string; message: string }[];
}
