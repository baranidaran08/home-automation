'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { ResetPasswordInput } from '@/types/auth';

/**
 * Completes a password reset using the one-time token from the email link plus
 * the new password. On failure the token is invalid/expired/used and the caller
 * surfaces the backend message.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });
}
