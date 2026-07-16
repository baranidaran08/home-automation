'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { useTransitionOverlayStore } from '@/store/transition.store';
import { XenField } from './xen-field';
import { XenButton } from './xen-button';
import { useResetPasswordMutation } from '../hooks/use-reset-password-mutation';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/reset-password.schema';
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
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated');
  const playTransition = useTransitionOverlayStore((s) => s.start);
  const [visible, setVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const reduce = useReducedMotion();

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
      <div className="space-y-5 text-center">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive"
          style={{ boxShadow: `0 0 40px hsl(var(--destructive) / 0.25)` }}
        >
          <TriangleAlert className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold" style={{ color: `hsl(var(--xen-ink))` }}>
            Invalid reset link
          </p>
          <p className="text-sm" style={{ color: `hsl(var(--xen-muted))` }}>
            This password reset link is missing or malformed. Please request a new one.
          </p>
        </div>
        <Link
          href={ROUTES.auth.forgotPassword}
          className="flex h-14 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, hsl(var(--xen-accent)), hsl(var(--xen-accent-soft)))`,
            boxShadow: `0 10px 30px -8px hsl(var(--xen-glow) / 0.6)`,
          }}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      await reset.mutateAsync({ token, newPassword: values.newPassword });
      // The redirect target is /login either way; where the user actually LANDS
      // depends on their session. With a live session GuestGuard bounces them
      // straight into the dashboard — cover that with the brand transition (no
      // toast over it). Without one they really do land on the login form, so
      // the "please sign in" toast is the feedback that matters.
      if (isAuthenticated) {
        playTransition();
      } else {
        toast.success('Password reset successfully. Please sign in.');
      }
      router.replace(ROUTES.auth.login);
    } catch (err) {
      const message =
        (err as NormalizedApiError)?.message ?? 'Could not reset your password. Please try again.';
      setFormError(message);
      toast.error(message);
    }
  };

  const enter = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 1.75 + i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
        };

  const toggle = (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      className="grid h-9 w-9 place-items-center rounded-xl text-[hsl(var(--xen-muted))] transition-colors hover:bg-[hsl(var(--xen-accent)/0.1)] hover:text-[hsl(var(--xen-accent))]"
      aria-label={visible ? 'Hide passwords' : 'Show passwords'}
      tabIndex={-1}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && (
        <motion.div
          role="alert"
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </motion.div>
      )}

      <motion.div {...enter(0)}>
        <XenField
          label="New Password"
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          invalid={!!errors.newPassword}
          disabled={isSubmitting}
          trailing={toggle}
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="mt-1.5 pl-1 text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </motion.div>

      <motion.div {...enter(1)}>
        <XenField
          label="Confirm Password"
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          invalid={!!errors.confirmPassword}
          disabled={isSubmitting}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1.5 pl-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </motion.div>

      <motion.div {...enter(2)} className="space-y-3 pt-1">
        <XenButton type="submit" loading={isSubmitting} loadingText="Resetting…">
          Reset Password
        </XenButton>

        <Link
          href={ROUTES.auth.login}
          className="group flex items-center justify-center gap-1.5 text-sm font-medium"
          style={{ color: `hsl(var(--xen-muted))` }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to sign in
        </Link>
      </motion.div>
    </form>
  );
}
