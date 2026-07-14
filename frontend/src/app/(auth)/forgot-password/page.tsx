import type { Metadata } from 'next';
import { KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForgotPasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Forgot password',
};

/**
 * Forgot-password page. Wrapped by the (auth) layout's GuestGuard. Collects the
 * account email and triggers the reset-link email.
 */
export default function ForgotPasswordPage() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <KeyRound className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset it.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
