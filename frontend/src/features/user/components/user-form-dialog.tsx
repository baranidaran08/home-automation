'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userFormSchema, userFormDefaults, type UserFormValues } from '../schemas/user.schema';
import { useUserMutations } from '../hooks/use-user-mutations';
import { useRoleOptions } from '../hooks/use-role-options';
import type { User, CreateUserInput, UpdateUserInput } from '@/types/rbac';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Passing a user switches the form into edit mode. */
  user?: User | null;
}

/**
 * Add/Edit user modal. Creates an account (name/email/password) and assigns a
 * Role via a `<Select>` populated from the Roles API. On edit, the password is
 * optional (blank keeps the existing one).
 */
export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = Boolean(user);
  // The Root Super Admin's role is locked (backend rejects any change).
  const isRoot = Boolean(user?.isRoot);
  const { create, update } = useUserMutations();
  const { data: roleOptions = [], isLoading: loadingRoles } = useRoleOptions();
  const isSubmitting = create.isPending || update.isPending;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: userFormDefaults,
  });

  const roleValue = watch('role');

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({ name: user.name, email: user.email, password: '', role: user.role?._id ?? '' });
    } else {
      reset(userFormDefaults);
    }
    setShowPassword(false);
  }, [open, user, reset]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && user) {
        // Only send the password when the admin actually entered a new one.
        const input: UpdateUserInput = {
          name: values.name,
          email: values.email,
          role: values.role,
        };
        if (values.password) input.password = values.password;
        await update.mutateAsync({ id: user._id, input });
      } else {
        // No password on create — the backend generates a secure temporary one
        // and emails it to the new user.
        const input: CreateUserInput = {
          name: values.name,
          email: values.email,
          role: values.role,
        };
        await create.mutateAsync(input);
      }
      onOpenChange(false);
    } catch {
      // Errors surfaced via toast in the mutation hooks; keep dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update this account and its assigned role.'
              : 'Create a new account and assign it a role.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              placeholder="e.g. Priya Sharma"
              aria-invalid={!!errors.name}
              disabled={isSubmitting}
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              autoComplete="off"
              placeholder="user@company.com"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password <span className="text-muted-foreground">(leave blank to keep)</span>
              </Label>
              <div className="relative">
                <Input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  disabled={isSubmitting}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          ) : (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              A secure temporary password will be generated and emailed to the user. They&apos;ll be
              asked to set their own password on first login.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select
              value={roleValue}
              onValueChange={(v) => setValue('role', v, { shouldValidate: true })}
              disabled={isSubmitting || loadingRoles || isRoot}
            >
              <SelectTrigger id="user-role" aria-invalid={!!errors.role}>
                <SelectValue placeholder={loadingRoles ? 'Loading roles…' : 'Select a role'} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isRoot && (
              <p className="text-xs text-muted-foreground">
                This is the Root Super Admin — its role is locked and cannot be changed.
              </p>
            )}
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
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
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
