'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';
import type { CreateUserInput, UpdateUserInput } from '@/types/rbac';

const errorMessage = (err: unknown, fallback: string) =>
  (err as NormalizedApiError)?.message ?? fallback;

/**
 * Create/update/delete user mutations. Each invalidates the user list on
 * success and surfaces toasts, keeping this concern out of the UI components.
 */
export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

  const create = useMutation({
    mutationFn: (input: CreateUserInput) => userService.create(input),
    onSuccess: () => {
      toast.success('User created');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to create user')),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      userService.update(id, input),
    onSuccess: () => {
      toast.success('User updated');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update user')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      toast.success('User deleted');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to delete user')),
  });

  return { create, update, remove };
}
