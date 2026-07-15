import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign in',
};

/**
 * Admin login page. Wrapped by the (auth) layout's GuestGuard, so authenticated
 * admins are redirected away and never land here.
 */
export default function LoginPage() {
  return (
    <Card className="w-full p-2">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Quotation Management workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
