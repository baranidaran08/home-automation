'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/components/ui/sonner';

/**
 * Single composition point for all client-side providers. Mounted once in the
 * root layout so nested layouts/pages stay clean. Add new providers here.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors closeButton position="bottom-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
