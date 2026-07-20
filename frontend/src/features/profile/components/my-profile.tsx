'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rise } from '@/components/shared/rise';
import { AvatarUploader } from '@/components/shared/avatar-uploader';
import { AccountInfoCard } from '@/components/shared/account-info-card';
import { FormActionBar } from '@/components/shared/form-action-bar';
import { useAuth } from '@/features/auth';
import { profileFormSchema, type ProfileFormValues } from '../schemas/profile.schema';
import { useUpdateProfile } from '../hooks/use-update-profile';

/**
 * My Profile screen. One cohesive form: the profile picture (header) and the
 * personal-information fields are saved together by a single "Save Changes"
 * button, which is enabled only when something has actually changed. The
 * Account Information card below is read-only. All data comes from the one
 * session user record, so edits here propagate everywhere it's shown.
 */
export function MyProfile() {
  const { user } = useAuth();
  const { mutateAsync, isPending } = useUpdateProfile();

  // Pending avatar change (staged until Save). `removed` clears an existing one.
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  // Keep the pending avatar state in sync when the underlying user changes
  // (initial load or after a successful save refreshes the store).
  useEffect(() => {
    setAvatarFile(null);
    setAvatarRemoved(false);
  }, [user?.avatarUrl]);

  // The action bar appears whenever any editable value differs from its original
  // (RHF `isDirty` flips back to false if a field is returned to its start value,
  // which hides the bar again). Kept independent of `isPending` so the bar stays
  // visible while saving.
  const avatarChanged = avatarFile !== null || avatarRemoved;
  const hasChanges = isDirty || avatarChanged;

  const onSubmit = async (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    if (avatarFile) formData.append('avatar', avatarFile);
    else if (avatarRemoved) formData.append('removeAvatar', 'true');

    try {
      await mutateAsync(formData);
      // Store refresh (via the mutation) re-seeds the form through `values`;
      // just clear the staged avatar change.
      setAvatarFile(null);
      setAvatarRemoved(false);
    } catch {
      // Error toast handled in the mutation hook; keep edits for another try.
    }
  };

  const handleCancel = () => {
    reset();
    setAvatarFile(null);
    setAvatarRemoved(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Rise index={0}>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal account information.
        </p>
      </Rise>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Section 1 — profile header: picture + identity. */}
        <Rise index={1}>
          <Card>
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
              <AvatarUploader
                src={user?.avatarUrl}
                name={user?.name}
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
                <p className="text-lg font-semibold text-foreground">{user?.name}</p>
                {user?.role?.name && (
                  <Badge
                    variant={user.role.isSuperAdmin ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {user.role.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Rise>

        {/* Section 2 — editable personal information. */}
        <Rise index={2}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    disabled={isPending}
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={!!errors.email}
                    disabled={isPending}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="profile-phone">
                    Phone Number <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    aria-invalid={!!errors.phone}
                    disabled={isPending}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <FormActionBar visible={hasChanges} saving={isPending} onCancel={handleCancel} />
            </CardContent>
          </Card>
        </Rise>

        {/* Section 3 — read-only account information. */}
        <Rise index={3}>
          <AccountInfoCard
            roleName={user?.role?.name}
            isSuperAdmin={user?.role?.isSuperAdmin}
            createdAt={user?.createdAt}
            lastLoginAt={user?.lastLoginAt}
          />
        </Rise>
      </form>
    </div>
  );
}
