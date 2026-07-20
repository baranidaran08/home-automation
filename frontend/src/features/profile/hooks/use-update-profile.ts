'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';

const errorMessage = (err: unknown, fallback: string) =>
  (err as NormalizedApiError)?.message ?? fallback;

/**
 * Self-service profile update. On success it writes the refreshed user straight
 * into the auth store — so the topbar avatar/name update instantly — and
 * invalidates the users list so the System Administrator's Users table reflects
 * the change (single source of truth: the one user record).
 */
export function useUpdateProfile() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => authService.updateProfile(formData),
    onSuccess: ({ user }) => {
      setAuthenticated(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update profile')),
  });
}
