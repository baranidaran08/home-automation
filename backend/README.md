# Home Automation — Backend API

Production-ready Express + MongoDB API foundation for the Home Automation
Quotation Management System. Built with an MVC + service-layer clean
architecture. **No business modules are implemented yet** — this is the
scaffolding only.

## Tech Stack

Node.js · Express · MongoDB · Mongoose · JWT · Multer (memory storage) ·
Cloudinary · Helmet · Compression · CORS · Morgan · Zod

## Getting Started

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values
npm run dev            # http://localhost:5000
```

A local MongoDB must be running (or set `MONGODB_URI` to an Atlas cluster).

### Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start with nodemon (auto-reload)     |
| `npm start`       | Start in production mode             |
| `npm run lint`    | Run ESLint                           |
| `npm run lint:fix`| Fix lint issues                      |
| `npm run format`  | Format with Prettier                 |

## API

Base URL: `http://localhost:5000/api`

| Method | Endpoint       | Auth   | Description                          |
| ------ | -------------- | ------ | ------------------------------------ |
| GET    | `/health`      | Public | Health check                         |
| POST   | `/auth/login`  | Public | Log in; sets httpOnly JWT cookie     |
| POST   | `/auth/logout` | Public | Clears the auth cookie               |
| GET    | `/auth/me`     | Admin  | Current authenticated admin          |

### Seeder

The app has a single admin (no registration). Credentials come from
`ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars — never hardcoded.

```bash
npm run seed          # run all seeders
npm run seed:admin    # seed only the default admin (idempotent)
```

The seeder inserts the admin only if one with that email does not already
exist; re-running never overwrites an existing account.

## Project Structure

```
backend/
├── src/
│   ├── config/         # env, database, cloudinary, multer
│   ├── constants/      # http status codes, messages
│   ├── controllers/    # request handlers (thin)
│   ├── middleware/      # error handler, notFound, validate
│   ├── models/         # Mongoose schemas (empty)
│   ├── routes/         # versioned routers (/api)
│   │   └── v1/
│   ├── services/       # business logic (empty)
│   ├── utils/          # ApiError, ApiResponse, asyncHandler, logger
│   ├── validations/    # Zod schemas (empty)
│   ├── app.js          # Express app factory
│   └── server.js       # bootstrap (db connect + listen)
├── .env.example
└── package.json
```

## Upload Flow (configured, not yet exposed)

```
Frontend → Express → Multer (memory) → Cloudinary → MongoDB
```

Multer holds files in memory (`req.file.buffer`); a future service streams the
buffer to Cloudinary and persists the returned URL/publicId in MongoDB.
