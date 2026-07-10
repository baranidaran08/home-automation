import { QueryClient } from '@tanstack/react-query';

/**
 * Factory for the TanStack Query client. A factory (rather than a shared
 * singleton) avoids leaking cache between requests during SSR.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
