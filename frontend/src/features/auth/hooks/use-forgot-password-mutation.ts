'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { ForgotPasswordInput } from '@/types/auth';

/**
 * Requests a password-reset link. The backend always responds success (it never
 * reveals whether the email exists), so the UI shows the same confirmation either
 * way. Errors here only reflect network/validation failures.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
}
