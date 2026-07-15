# Home Automation — Quotation Management System

Admin panel for managing home automation products, brochure templates (PDFs),
inventory, and generating professional quotation PDFs.

This repository contains two independent projects:

| Folder      | Stack                                                    | Dev URL                 |
| ----------- | -------------------------------------------------------- | ----------------------- |
| `frontend/` | Next.js 15, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand | http://localhost:3000   |
| `backend/`  | Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary, Multer         | http://localhost:5000   |

> **Status:** Project foundation only. No business modules (auth, dashboard,
> categories, products, templates, quotations) are implemented yet.

## Quick Start

Run each project in its own terminal.

**Backend**

```bash
cd backend
npm install
cp .env.example .env      # fill in MongoDB + Cloudinary values
npm run dev               # http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

Verify the API is up: `GET http://localhost:5000/api/health`.

## Prerequisites

- Node.js 18.18+ (tested on Node 22)
- A MongoDB instance (local or MongoDB Atlas)
- A Cloudinary account (for image/PDF uploads — configured, used by future modules)

See [`frontend/README.md`](./frontend/README.md) and
[`backend/README.md`](./backend/README.md) for details.
