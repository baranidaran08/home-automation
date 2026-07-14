'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { roleFormSchema, roleFormDefaults, type RoleFormValues } from '../schemas/role.schema';
import { useRoleMutations } from '../hooks/use-role-mutations';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import {
  enableWithDependencies,
  disableWithDependents,
  resolvePermissionDependencies,
  DASHBOARD_READ,
} from '@/lib/permission-dependencies';
import type { Role } from '@/types/rbac';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Passing a role switches the form into edit mode. */
  role?: Role | null;
}

/**
 * Add/Edit role modal. Name + description use RHF/Zod; the permission set is a
 * "module × action" checkbox matrix driven by the seeded permission catalogue.
 * System roles keep their name locked; a Super Admin role shows all-access and
 * disables the matrix (its permissions are a wildcard, not an editable list).
 */
export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEditing = Boolean(role);
  const isSystem = Boolean(role?.isSystem);
  const isSuperAdmin = Boolean(role?.isSuperAdmin);
  const { create, update } = useRoleMutations();
  const isSubmitting = create.isPending || update.isPending;

  const { groups, data: permissions = [], isLoading: loadingPerms } = usePermissionCatalog();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Permission id ⇄ key maps (dependencies are expressed in keys; the API and
  // the selected set use ids).
  const keyById = useMemo(() => new Map(permissions.map((p) => [p._id, p.key])), [permissions]);
  const idByKey = useMemo(() => new Map(permissions.map((p) => [p.key, p._id])), [permissions]);

  const selectedKeys = useMemo(
    () => [...selected].map((id) => keyById.get(id)).filter(Boolean) as string[],
    [selected, keyById]
  );

  // Apply a computed set of KEYS back into the selected set of IDS.
  const applyKeys = (keys: string[]) => {
    const ids = keys.map((k) => idByKey.get(k)).filter(Boolean) as string[];
    setSelected(new Set(ids));
  };

  // dashboard:read is a baseline — it must stay checked while any other
  // permission is selected, so its checkbox is locked in that case.
  const hasNonDashboardSelected = selectedKeys.some((k) => k !== DASHBOARD_READ);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: roleFormDefaults,
  });

  // Sync fields + selected permissions whenever the dialog opens / target changes.
  useEffect(() => {
    if (!open) return;
    if (role) {
      reset({ name: role.name, description: role.description ?? '' });
      setSelected(new Set(role.permissions.map((p) => p._id)));
    } else {
      reset(roleFormDefaults);
      setSelected(new Set());
    }
  }, [open, role, reset]);

  // Toggling a permission runs the dependency engine so prerequisites are
  // auto-enabled and dependents cascade-off — the UI can never hold an invalid
  // combination.
  const togglePermission = (id: string) => {
    const key = keyById.get(id);
    if (!key) return;
    const next = selected.has(id)
      ? disableWithDependents(selectedKeys, key)
      : enableWithDependencies(selectedKeys, key);
    applyKeys(next);
  };

  const toggleModule = (ids: string[], allSelected: boolean) => {
    const moduleKeys = ids.map((id) => keyById.get(id)).filter(Boolean) as string[];
    let next = selectedKeys;
    for (const k of moduleKeys) {
      next = allSelected ? disableWithDependents(next, k) : enableWithDependencies(next, k);
    }
    applyKeys(next);
  };

  const selectedCount = selected.size;
  const totalCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.permissions.length, 0),
    [groups]
  );

  const onSubmit = async (values: RoleFormValues) => {
    // Normalize to the full dependency closure before saving — the payload is
    // always valid regardless of how the boxes were toggled (and it also repairs
    // any legacy role that predates the dependency rules). The backend validates
    // this independently and rejects anything incomplete.
    const finalKeys = resolvePermissionDependencies(selectedKeys);
    const finalIds = finalKeys.map((k) => idByKey.get(k)).filter(Boolean) as string[];
    const input = {
      name: values.name,
      description: values.description ?? '',
      permissions: finalIds,
    };
    try {
      if (isEditing && role) {
        // System role: name is locked server-side, so omit it from the payload.
        const payload = isSystem ? { description: input.description, permissions: input.permissions } : input;
        await update.mutateAsync({ id: role._id, input: payload });
      } else {
        await create.mutateAsync(input);
      }
      onOpenChange(false);
    } catch {
      // Errors surfaced via toast in the mutation hooks; keep dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Add Role'}</DialogTitle>
          <DialogDescription>
            {isSuperAdmin
              ? 'The Super Admin role has unrestricted access to every module.'
              : 'Name the role and choose exactly which actions it can perform.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              placeholder="e.g. Sales Executive"
              aria-invalid={!!errors.name}
              disabled={isSubmitting || isSystem}
              {...register('name')}
            />
            {isSystem && (
              <p className="text-xs text-muted-foreground">
                This is a system role — its name cannot be changed.
              </p>
            )}
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              placeholder="What can this role do? (optional)"
              aria-invalid={!!errors.description}
              disabled={isSubmitting}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Permissions</Label>
              {!isSuperAdmin && (
                <span className="text-xs text-muted-foreground">
                  {selectedCount} / {totalCount} selected
                </span>
              )}
            </div>

            {isSuperAdmin ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                Full access to all current and future modules.
              </div>
            ) : loadingPerms ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {groups.map((group) => {
                  const ids = group.permissions.map((p) => p._id);
                  const allSelected = ids.every((id) => selected.has(id));
                  return (
                    <div key={group.module} className="p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{group.module}</span>
                        <button
                          type="button"
                          onClick={() => toggleModule(ids, allSelected)}
                          className="text-xs text-primary hover:underline"
                        >
                          {allSelected ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {group.permissions.map((p) => {
                          // Dashboard read is locked on while any other access exists.
                          const locked = p.key === DASHBOARD_READ && hasNonDashboardSelected;
                          return (
                            <label
                              key={p._id}
                              className="flex cursor-pointer items-center gap-2 text-sm capitalize"
                              title={locked ? 'Always required when any access is granted' : undefined}
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={selected.has(p._id)}
                                onChange={() => togglePermission(p._id)}
                                disabled={isSubmitting || locked}
                              />
                              {p.action}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isSuperAdmin && (
              <p className="text-xs text-muted-foreground">
                Dependencies are enforced automatically: enabling Create, Update or Delete also
                enables that module’s Read, quotations require Products, Categories and Templates
                Read, and Dashboard access is always included.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
