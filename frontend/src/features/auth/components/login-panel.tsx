'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../hooks/use-auth';
import { GoogleSignInButton } from './google-sign-in-button';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useTransitionOverlayStore } from '@/store/transition.store';
import { ROUTES } from '@/constants/routes';
import { env } from '@/constants/env';
import type { AuthUser } from '@/types/auth';
import type { NormalizedApiError } from '@/lib/axios';

interface LoginPanelProps {
  /** Focused by the parent once the entrance transition completes. */
  emailRef?: React.RefObject<HTMLInputElement | null>;
  /** When provided, renders a "Back" control (used to return to the welcome screen). */
  onBack?: () => void;
}

/**
 * The login form, restyled with the app's standard shadcn components. The auth
 * behaviour is UNCHANGED and fully reused: RHF + the existing `loginSchema`, the
 * `useAuth().login` call, the shared post-authentication path (first-login →
 * change-password, otherwise the brand transition into the dashboard), and the
 * existing Google Sign-In button. "Remember me" is presentational only — it does
 * not touch session handling.
 */
export function LoginPanel({ emailRef, onBack }: LoginPanelProps) {
  const router = useRouter();
  const { login } = useAuth();
  const playTransition = useTransitionOverlayStore((s) => s.start);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Safety net: clear any leaked Radix `pointer-events: none` body lock (e.g.
  // from the logout confirmation) so the login page is interactive on arrival.
  useEffect(() => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = '';
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Merge RHF's ref with the parent's emailRef so the field can be auto-focused
  // after the transition without RHF losing its own registration.
  const { ref: emailFieldRef, ...emailReg } = register('email');

  // Shared post-authentication path for BOTH email/password and Google (unchanged).
  const handleAuthenticated = (user: AuthUser) => {
    if (user.mustChangePassword) {
      toast.success('Please set a new password to continue');
      router.replace(ROUTES.changePassword);
    } else {
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

  return (
    <div className="w-full max-w-md">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your Xen Automation dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <div className="space-y-1.5">
          <FloatingInput
            label="Email Address"
            type="email"
            autoComplete="email"
            invalid={!!errors.email}
            disabled={isSubmitting}
            {...emailReg}
            ref={(el) => {
              emailFieldRef(el);
              if (emailRef) emailRef.current = el;
            }}
          />
          {errors.email && <p className="pl-1 text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <FloatingInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            invalid={!!errors.password}
            disabled={isSubmitting}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
          />
          {errors.password && (
            <p className="pl-1 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isSubmitting}
            />
            Remember me
          </label>
          <Link
            href={ROUTES.auth.forgotPassword}
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Divider + Google Sign-In (button unchanged). Hidden when Google isn't configured. */}
      {env.googleClientId && (
        <>
          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          <GoogleSignInButton onAuthenticated={handleAuthenticated} disabled={isSubmitting} />
        </>
      )}
    </div>
  );
}
