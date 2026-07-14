import type { Metadata } from 'next';
import { KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Change password',
};

/**
 * Forced first-login password change. Reached automatically after a new user logs
 * in with their temporary password (guards redirect here while `mustChangePassword`
 * is true). Wrapped by the (onboarding) layout's ChangePasswordGuard.
 */
export default function ChangePasswordPage() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <KeyRound className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Set your password</CardTitle>
          <CardDescription>
            For your security, please replace the temporary password you received by email.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
}
