'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../hooks/use-auth';
import { useTransitionOverlayStore } from '@/store/transition.store';
import { XenField } from './xen-field';
import { XenButton } from './xen-button';
import { GoogleSignInButton } from './google-sign-in-button';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { ROUTES } from '@/constants/routes';
import { env } from '@/constants/env';
import type { AuthUser } from '@/types/auth';
import type { NormalizedApiError } from '@/lib/axios';

/**
 * Login form: RHF + Zod validation, show/hide password, submit loading state,
 * inline field errors, and a form-level error banner for failed credentials.
 *
 * The auth behaviour here is unchanged — only the presentation is XEN-styled.
 */
export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const playTransition = useTransitionOverlayStore((s) => s.start);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Shared post-authentication path for BOTH email/password and Google sign-in.
  // Google users are already activated, so they never hit the change-password
  // branch — but the check is kept for the password temp-password case.
  const handleAuthenticated = (user: AuthUser) => {
    if (user.mustChangePassword) {
      toast.success('Please set a new password to continue');
      router.replace(ROUTES.changePassword);
    } else {
      // Cover the guard-driven navigation with the brand transition. Purely
      // visual: auth state is already set and the redirect below (plus
      // GuestGuard's own) proceed underneath it. The transition IS the success
      // feedback — no toast, it would pop over the brand moment.
      playTransition();
      router.replace(ROUTES.dashboard.root);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const user = await login(values);
      handleAuthenticated(user);
    } catch (err) {
      const message = (err as NormalizedApiError)?.message ?? 'Login failed. Please try again.';
      setFormError(message);
      toast.error(message);
    }
  };

  // Fields cascade in after the panel has landed.
  const item = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 1.75 + i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="space-y-4">
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

      <motion.div {...item(0)}>
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

      <motion.div {...item(1)}>
        <XenField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          invalid={!!errors.password}
          disabled={isSubmitting}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-xl text-[hsl(var(--xen-muted))] transition-colors hover:bg-[hsl(var(--xen-accent)/0.1)] hover:text-[hsl(var(--xen-accent))]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1.5 pl-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </motion.div>

      <motion.div {...item(2)} className="flex justify-end pb-1">
        {/* Link with an underline that wipes in from the left on hover. */}
        <Link
          href={ROUTES.auth.forgotPassword}
          className="group relative text-sm font-medium text-[hsl(var(--xen-accent))]"
        >
          Forgot password?
          <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[hsl(var(--xen-accent))] transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </Link>
      </motion.div>

        <motion.div {...item(3)}>
          <XenButton type="submit" loading={isSubmitting} loadingText="Signing in…">
            Sign in
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </XenButton>
        </motion.div>
      </form>

      {/* Divider + Google Sign-In. The button self-hides when Google isn't
          configured, in which case the divider is hidden too. */}
      {env.googleClientId && (
        <>
          <motion.div {...item(4)} className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[hsl(var(--xen-line))]" />
            <span className="text-xs font-medium text-[hsl(var(--xen-muted))]">OR</span>
            <span className="h-px flex-1 bg-[hsl(var(--xen-line))]" />
          </motion.div>

          <motion.div {...item(5)}>
            <GoogleSignInButton onAuthenticated={handleAuthenticated} disabled={isSubmitting} />
          </motion.div>
        </>
      )}
    </div>
  );
}
