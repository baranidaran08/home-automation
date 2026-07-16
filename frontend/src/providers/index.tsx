'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/components/ui/sonner';

// Client-only and code-split: the overlay (and Framer Motion with it) loads
// off the critical path after hydration instead of inflating every route's
// First Load JS. It renders null until a feature starts a transition.
const TransitionOverlay = dynamic(
  () => import('@/components/shared/transition-overlay').then((m) => m.TransitionOverlay),
  { ssr: false }
);

/**
 * Single composition point for all client-side providers. Mounted once in the
 * root layout so nested layouts/pages stay clean. Add new providers here.
 *
 * TransitionOverlay lives here (not in a page) so it survives route changes —
 * it plays over the login → dashboard navigation and must outlive both screens.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
        <TransitionOverlay />
        <Toaster richColors closeButton position="bottom-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
