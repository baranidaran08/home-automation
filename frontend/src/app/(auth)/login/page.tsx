import type { Metadata } from 'next';
import { Home } from 'lucide-react';
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
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-3 text-center">
        {/* Company logo placeholder */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Home className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Home Automation</CardTitle>
          <CardDescription>Quotation Management System — Admin Sign in</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
