'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../hooks/use-auth';
import { env } from '@/constants/env';
import type { AuthUser } from '@/types/auth';
import type { NormalizedApiError } from '@/lib/axios';

interface GoogleSignInButtonProps {
  /** Called with the authenticated user after a successful Google sign-in. */
  onAuthenticated: (user: AuthUser) => void;
  disabled?: boolean;
}

/**
 * Google Sign-In using Google's official button (Google Identity Services),
 * which yields a verifiable ID token — the backend verifies it and issues the
 * app's own JWT. Renders nothing when Google isn't configured (no client id),
 * so the login page degrades gracefully to email + password only.
 *
 * This component performs NO navigation: it hands the authenticated user back
 * to the parent via `onAuthenticated`, so the password and Google flows share
 * one post-login path.
 */
export function GoogleSignInButton({ onAuthenticated, disabled }: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const { resolvedTheme } = useTheme();
  const [busy, setBusy] = useState(false);

  // No client id → Google Sign-In isn't set up; render nothing.
  if (!env.googleClientId) return null;

  const handleCredential = async (idToken: string) => {
    setBusy(true);
    try {
      const user = await googleLogin(idToken);
      onAuthenticated(user);
    } catch (err) {
      const message =
        (err as NormalizedApiError)?.message ?? 'Google sign-in failed. Please try again.';
      toast.error(message);
      setBusy(false); // leave the button usable to retry (no reset on success — we navigate away)
    }
  };

  return (
    <div className="relative">
      {/* While exchanging the credential with our backend, cover the Google
          button with a spinner so it can't be clicked twice. */}
      {busy && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-[hsl(var(--xen-card)/0.7)]">
          <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--xen-accent))]" />
        </div>
      )}
      <div className="flex justify-center [color-scheme:light]">
        <GoogleLogin
          onSuccess={(res) => {
            if (res.credential) handleCredential(res.credential);
            else toast.error('Google did not return a credential. Please try again.');
          }}
          onError={() => toast.error('Google sign-in was cancelled or failed.')}
          theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
          shape="pill"
          text="continue_with"
          width="320"
          useOneTap={false}
          {...(disabled ? { containerProps: { style: { pointerEvents: 'none', opacity: 0.6 } } } : {})}
        />
      </div>
    </div>
  );
}
