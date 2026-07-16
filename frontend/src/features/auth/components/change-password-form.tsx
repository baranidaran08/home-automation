'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useTransitionOverlayStore } from '@/store/transition.store';
import { ROUTES } from '@/constants/routes';
import { XenField } from './xen-field';
import { XenButton } from './xen-button';
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
  const playTransition = useTransitionOverlayStore((s) => s.start);
  const [visible, setVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const reduce = useReducedMotion();

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
      // Cover the entry into the app with the brand transition (same treatment
      // as login — and like there, the transition IS the success feedback, so
      // no toast popping over it).
      playTransition();
      setAuthenticated(user); // lock lifted (mustChangePassword: false)
      router.replace(ROUTES.dashboard.root);
    } catch (err) {
      const message =
        (err as NormalizedApiError)?.message ?? 'Could not change your password. Please try again.';
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
          label="Current Temporary Password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          invalid={!!errors.currentPassword}
          disabled={isSubmitting}
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="mt-1.5 pl-1 text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </motion.div>

      <motion.div {...enter(1)}>
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

      <motion.div {...enter(2)}>
        <XenField
          label="Confirm New Password"
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

      <motion.div {...enter(3)} className="pt-1">
        <XenButton type="submit" loading={isSubmitting} loadingText="Updating…">
          Update password
        </XenButton>
      </motion.div>
    </form>
  );
}
