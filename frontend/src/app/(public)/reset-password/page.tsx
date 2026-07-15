import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordTokenReader } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Reset password',
};

/**
 * Reset-password page. Public (no GuestGuard) so it ALWAYS opens from an email
 * link — even when the user already has a live session — instead of being
 * redirected to the dashboard. The token is read from the `?token=` query param
 * inside a Suspense boundary (required by `useSearchParams`) and passed to the
 * reset form, which then lets the backend validate/expire it.
 */
export default function ResetPasswordPage() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <CardDescription>Choose a strong password you haven&apos;t used before.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div className="flex justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          }
        >
          <ResetPasswordTokenReader />
        </Suspense>
      </CardContent>
    </Card>
  );
}
