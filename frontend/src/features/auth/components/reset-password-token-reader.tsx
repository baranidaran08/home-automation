'use client';

import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from './reset-password-form';

/**
 * Reads the one-time `?token=` param from the URL and hands it to the reset form.
 * `useSearchParams` requires a Suspense boundary, which the page provides.
 */
export function ResetPasswordTokenReader() {
  const token = useSearchParams().get('token');
  return <ResetPasswordForm token={token} />;
}
