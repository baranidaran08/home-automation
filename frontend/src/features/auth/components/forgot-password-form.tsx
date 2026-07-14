'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
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

  if (submittedEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="font-medium">{submittedEmail}</span>, a
            password reset link has been sent. The link expires in 15 minutes.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.auth.login}>
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Sending…' : 'Send Reset Link'}
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
