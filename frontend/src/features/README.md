# Features

Feature-first modules live here. Each business domain is **self-contained** so
it can be added or removed without touching unrelated code.

Recommended structure per feature:

```
features/
└── products/
    ├── components/      # UI specific to this feature
    ├── hooks/           # e.g. useProducts (wraps TanStack Query)
    ├── services/        # e.g. product.service.ts (wraps httpService)
    ├── schemas/         # Zod form/validation schemas
    ├── types/           # feature-local types
    └── store/           # optional Zustand slice
```

Shared/reusable building blocks stay in the top-level `components/`, `hooks/`,
`services/`, `lib/`, and `utils/` folders. No features are implemented yet.
