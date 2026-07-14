'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleService } from '@/services/role.service';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';
import type { CreateRoleInput, UpdateRoleInput } from '@/types/rbac';

const errorMessage = (err: unknown, fallback: string) =>
  (err as NormalizedApiError)?.message ?? fallback;

/**
 * Create/update/delete role mutations. Each invalidates the role list (and the
 * role options used by the User form) on success and surfaces toasts.
 */
export function useRoleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.roles.options });
  };

  const create = useMutation({
    mutationFn: (input: CreateRoleInput) => roleService.create(input),
    onSuccess: () => {
      toast.success('Role created');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to create role')),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      roleService.update(id, input),
    onSuccess: () => {
      toast.success('Role updated');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update role')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => {
      toast.success('Role deleted');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to delete role')),
  });

  return { create, update, remove };
}
