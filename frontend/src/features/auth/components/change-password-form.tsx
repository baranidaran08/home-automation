'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schemas/change-password.schema';
import type { NormalizedApiError } from '@/lib/axios';

/**
 * Forced-first-login password change. Collects the current (temporary) password,
 * a new password and its confirmation, posts to /auth/change-password, then
 * refreshes the session store with the returned user (now `mustChangePassword:
 * false`) and sends them into the dashboard. The store update is what lets the
 * guards stop redirecting back here.
 */
export function ChangePasswordForm() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [visible, setVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setFormError(null);
    try {
      const { user } = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setAuthenticated(user); // lock lifted (mustChangePassword: false)
      toast.success('Password changed successfully');
      router.replace(ROUTES.dashboard.root);
    } catch (err) {
      const message =
        (err as NormalizedApiError)?.message ?? 'Could not change your password. Please try again.';
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Temporary Password</Label>
        <Input
          id="currentPassword"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.currentPassword}
          disabled={isSubmitting}
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={visible ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pr-10"
            aria-invalid={!!errors.newPassword}
            disabled={isSubmitting}
            {...register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? 'Hide passwords' : 'Show passwords'}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          aria-invalid={!!errors.confirmPassword}
          disabled={isSubmitting}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
