# Home Automation — Frontend (Admin Panel)

Production-ready Next.js 15 admin panel foundation for the Home Automation
Quotation Management System. **No business modules are implemented yet** — this
is the scaffolding only.

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Axios ·
TanStack Query · Zustand · React Hook Form · Zod · next-themes · sonner

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env.local   # adjust if the API runs elsewhere
npm run dev                  # http://localhost:3000
```

The backend should be running at the URL in `NEXT_PUBLIC_API_BASE_URL`
(default `http://localhost:5000/api/v1`).

### Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the dev server              |
| `npm run build`     | Production build                  |
| `npm start`         | Serve the production build        |
| `npm run lint`      | Run ESLint                        |
| `npm run type-check`| TypeScript check (no emit)        |
| `npm run format`    | Format with Prettier              |

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # App Router
│   │   ├── (auth)/          # auth route group + layout placeholder
│   │   ├── (dashboard)/     # dashboard route group + layout placeholder
│   │   ├── layout.tsx       # root layout (mounts AppProviders)
│   │   ├── page.tsx         # landing page
│   │   └── globals.css      # Tailwind + shadcn CSS variables
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   └── shared/          # composed reusable components
│   ├── features/            # feature-first business modules (empty)
│   ├── hooks/               # reusable hooks
│   ├── lib/                 # axios client, query client, cn()
│   ├── providers/           # Theme, Query, Toast providers (composed)
│   ├── services/            # typed API services (httpService)
│   ├── store/               # Zustand stores
│   ├── styles/              # global styles
│   ├── types/               # shared TypeScript types
│   ├── utils/               # pure helper functions
│   └── constants/           # env, routes, query keys
├── components.json          # shadcn/ui config
├── tailwind.config.ts
└── package.json
```

## Architecture Notes

- **Path alias:** `@/*` → `src/*`.
- **Data fetching:** Components → feature hooks → `httpService` → `apiClient`
  (Axios). Server cache handled by TanStack Query.
- **Client vs server state:** server data lives in TanStack Query; only UI
  state lives in Zustand.
- **Providers:** all client providers are composed once in `src/providers`
  and mounted in the root layout.
- **Adding a shadcn component:** `npx shadcn@latest add <component>` (config is
  in `components.json`).
