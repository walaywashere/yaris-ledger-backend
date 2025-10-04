# Yaris Sales Ledger Backend (Rewrite)

## Overview

Node.js + TypeScript service powered by Express and Prisma. The backend enforces Manila timezone-aware business rules, JWT authentication, and the one-entry-per-day-per-customer constraint described in the rewrite plan.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with automatic reloads via `tsx`. |
| `npm run build` | Compile TypeScript into the `dist/` directory. |
| `npm start` | Run the compiled server from `dist/`. |
| `npm run lint` | Lint the codebase using ESLint. |
| `npm run format` | Format files with Prettier. |
| `npm run check` | Type-check the project without emitting JavaScript. |
| `npm run prisma:generate` | Regenerate the Prisma client after updating the schema. |

## Directory Structure

```
src/
  config/         # Environment handling, Prisma client factory
  middleware/     # Auth, validation, logging, error helpers
  routes/         # API route definitions
  controllers/    # Request/response orchestration
  services/       # Business logic and data access wrappers
  prisma/         # Prisma schema and migration helpers
  utils/          # Shared helpers (timezone, pricing, logger)
```

## Environment Variables

Duplicate `.env.example` into `.env` and update the values for your local setup. All timestamps must be handled using the Asia/Manila timezone.

## Next Steps

- Model the Prisma schema for users, customers, locations, sales entries, settings, and refresh tokens.
- Implement authentication middleware wired to JWT access + refresh tokens.
- Flesh out route/controller/service implementations according to Phase 2 of the rewrite plan.