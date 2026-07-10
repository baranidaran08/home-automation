/**
 * Centralised TanStack Query keys. Using a factory keeps keys consistent and
 * makes cache invalidation predictable across modules.
 *
 * Example (future):
 *   useQuery({ queryKey: queryKeys.products.list(filters), queryFn: ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
 */
export const queryKeys = {
  health: ['health'] as const,
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params: unknown) => ['categories', 'list', params] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    options: ['categories', 'options'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: unknown) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    brands: ['products', 'brands'] as const,
  },
  templates: {
    all: ['templates'] as const,
    list: (params: unknown) => ['templates', 'list', params] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
  },
  quotations: {
    all: ['quotations'] as const,
    list: (params: unknown) => ['quotations', 'list', params] as const,
    detail: (id: string) => ['quotations', 'detail', id] as const,
  },
} as const;
