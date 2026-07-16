'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';
import { XenField } from './xen-field';
import { XenButton } from './xen-button';
import { useForgotPasswordMutation } from '../hooks/use-forgot-password-mutation';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema';
import type { NormalizedApiError } from '@/lib/axios';

/**
 * Forgot-password form. Submits the email, then shows a generic confirmation that
 * deliberately does not reveal whether the account exists (enumeration-safe). The
 * confirmation is shown regardless of whether the email is registered.
 */
export function ForgotPasswordForm() {
  const forgot = useForgotPasswordMutation();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgot.mutateAsync({ email: values.email });
      setSubmittedEmail(values.email);
    } catch (err) {
      const message =
        (err as NormalizedApiError)?.message ?? 'Something went wrong. Please try again.';
      toast.error(message);
    }
  };

  const enter = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 1.75, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
      };

  if (submittedEmail) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5 text-center"
      >
        <div
          className="xen-anim-pulse mx-auto grid h-14 w-14 place-items-center rounded-2xl"
          style={{
            ['--xen-dur' as string]: '4s',
            background: `hsl(var(--xen-accent) / 0.12)`,
            color: `hsl(var(--xen-accent))`,
            boxShadow: `0 0 40px hsl(var(--xen-glow) / 0.35)`,
          }}
        >
          <MailCheck className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold" style={{ color: `hsl(var(--xen-ink))` }}>
            Check your inbox
          </p>
          <p className="text-sm" style={{ color: `hsl(var(--xen-muted))` }}>
            If an account exists for{' '}
            <span className="font-medium" style={{ color: `hsl(var(--xen-ink))` }}>
              {submittedEmail}
            </span>
            , a password reset link has been sent. The link expires in 15 minutes.
          </p>
        </div>
        <Link
          href={ROUTES.auth.login}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl border text-[15px] font-semibold transition-colors"
          style={{
            borderColor: `hsl(var(--xen-line))`,
            background: `hsl(var(--xen-card))`,
            color: `hsl(var(--xen-ink))`,
          }}
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <motion.div {...enter}>
        <XenField
          label="Email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1.5 pl-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </motion.div>

      <motion.div {...enter} className="space-y-3 pt-1">
        <XenButton type="submit" loading={isSubmitting} loadingText="Sending…">
          Send Reset Link
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
