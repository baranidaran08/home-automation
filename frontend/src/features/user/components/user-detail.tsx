'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Rise } from '@/components/shared/rise';
import { AvatarUploader } from '@/components/shared/avatar-uploader';
import { AccountInfoCard } from '@/components/shared/account-info-card';
import { FormActionBar } from '@/components/shared/form-action-bar';
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb';
import { profileFormSchema, type ProfileFormValues } from '@/features/profile';
import { useUser } from '../hooks/use-user';
import { useUserMutations } from '../hooks/use-user-mutations';
import { useRoleOptions } from '../hooks/use-role-options';

/**
 * User Details page (admin). Same layout as My Profile, but the System
 * Administrator may edit every user field — picture, name, email, phone, and
 * role — while Invitation Status, Created and Last Login stay read-only. All
 * fields come from the single user record, so saving here is reflected wherever
 * that user is shown. Root Super Admin's role stays locked (backend-enforced).
 */
export function UserDetail({ id }: { id: string }) {
  const { data: user, isLoading, isError } = useUser(id);
  const { updateForm } = useUserMutations();
  const { data: roleOptions = [], isLoading: loadingRoles } = useRoleOptions();
  const isPending = updateForm.isPending;
  const isRoot = Boolean(user?.isRoot);

  useBreadcrumbLabel(user?.name);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [role, setRole] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  // Re-seed the non-RHF state (role + staged avatar) whenever the loaded user
  // changes (initial load or post-save refresh).
  useEffect(() => {
    setRole(user?.role?._id ?? '');
    setAvatarFile(null);
    setAvatarRemoved(false);
  }, [user?._id, user?.role?._id, user?.avatarUrl]);

  // Reveal the action bar when any editable value (fields, picture, or role)
  // differs from its original. We compare the live field values against the
  // loaded user EXPLICITLY rather than relying on RHF's `isDirty`, which is
  // unreliable here because the user data arrives asynchronously (the values
  // prop changes after mount) — that mismatch made the bar show with no edits.
  // Returning a value to its original hides the bar again.
  const current = watch();
  const fieldsChanged =
    current.name !== (user?.name ?? '') ||
    current.email !== (user?.email ?? '') ||
    current.phone !== (user?.phone ?? '');
  const avatarChanged = avatarFile !== null || avatarRemoved;
  // `Boolean(role)` guards the brief pre-init window where role state is still
  // empty (seeded by the effect after load), so it never counts as a change.
  const roleChanged = Boolean(role) && role !== (user?.role?._id ?? '');
  const hasChanges = fieldsChanged || avatarChanged || roleChanged;

  const onSubmit = async (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    if (role) formData.append('role', role);
    if (avatarFile) formData.append('avatar', avatarFile);
    else if (avatarRemoved) formData.append('removeAvatar', 'true');

    try {
      await updateForm.mutateAsync({ id, formData });
      setAvatarFile(null);
      setAvatarRemoved(false);
    } catch {
      // Error toast handled in the mutation hook.
    }
  };

  const handleCancel = () => {
    reset();
    setRole(user?.role?._id ?? '');
    setAvatarFile(null);
    setAvatarRemoved(false);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
        <p className="text-base font-medium text-foreground">User not found</p>
        <p className="text-sm">This account may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Rise index={0}>
        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
        <p className="text-sm text-muted-foreground">
          View and manage this user&apos;s account information.
        </p>
      </Rise>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Header — picture + identity. */}
        <Rise index={1}>
          <Card>
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
              <AvatarUploader
                src={user.avatarUrl}
                name={user.name}
                file={avatarFile}
                removed={avatarRemoved}
                onFileSelect={(f) => {
                  setAvatarFile(f);
                  if (f) setAvatarRemoved(false);
                }}
                onRemove={() => setAvatarRemoved(true)}
                disabled={isPending}
              />
              <div className="sm:text-right">
                <p className="text-lg font-semibold text-foreground">{user.name}</p>
                <Badge
                  variant={user.role?.isSuperAdmin ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {user.role?.name ?? '—'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Rise>

        {/* Editable personal information + role. */}
        <Rise index={2}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    aria-invalid={!!errors.name}
                    disabled={isPending}
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    autoComplete="off"
                    aria-invalid={!!errors.email}
                    disabled={isPending}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-phone">
                    Phone Number <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="user-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    aria-invalid={!!errors.phone}
                    disabled={isPending}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Role</Label>
                  {/* Re-mount once the options arrive so the trigger shows the
                      seeded role label instead of the placeholder (Radix Select
                      doesn't display a value set before its items existed). */}
                  <Select
                    key={`role-${roleOptions.length}`}
                    value={role}
                    onValueChange={setRole}
                    disabled={isPending || loadingRoles || isRoot}
                  >
                    <SelectTrigger id="user-role">
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
                      The Root Super Admin&apos;s role is locked.
                    </p>
                  )}
                </div>
              </div>

              <FormActionBar visible={hasChanges} saving={isPending} onCancel={handleCancel} />
            </CardContent>
          </Card>
        </Rise>

        {/* Read-only account information (+ invitation status). */}
        <Rise index={3}>
          <AccountInfoCard
            roleName={user.role?.name}
            isSuperAdmin={user.role?.isSuperAdmin}
            createdAt={user.createdAt}
            lastLoginAt={user.lastLoginAt}
            invitationPending={Boolean(user.mustChangePassword)}
          />
        </Rise>
      </form>
    </div>
  );
}
