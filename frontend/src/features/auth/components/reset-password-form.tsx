'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useResetPasswordMutation } from '../hooks/use-reset-password-mutation';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/reset-password.schema';
import type { NormalizedApiError } from '@/lib/axios';

interface ResetPasswordFormProps {
  /** One-time token read from the `?token=` query param by the page. */
  token: string | null;
}

/**
 * Reset-password form. The token is read from the URL by the page and passed in.
 * A missing token renders an error state immediately; an invalid/expired token is
 * reported by the backend on submit. On success we toast and redirect to login.
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const reset = useResetPasswordMutation();
  const [visible, setVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // No token in the URL → the link is malformed; don't even show the form.
  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Invalid reset link</p>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing or malformed. Please request a new one.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={ROUTES.auth.forgotPassword}>Request a new link</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      await reset.mutateAsync({ token, newPassword: values.newPassword });
      toast.success('Password reset successfully. Please sign in.');
      router.replace(ROUTES.auth.login);
    } catch (err) {
      const message =
        (err as NormalizedApiError)?.message ??
        'Could not reset your password. Please try again.';
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
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
        {isSubmitting ? 'Resetting…' : 'Reset Password'}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href={ROUTES.auth.login}>
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </Button>
    </form>
  );
}
