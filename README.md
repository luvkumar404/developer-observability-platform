# Developer Observability Platform

TypeScript monorepo for a developer observability platform.

- **Phase 1**: Workspace foundation and an operational Express.js API with health checks.
- **Phase 2**: Neon PostgreSQL, Drizzle ORM schemas, database client, and shared Zod contracts.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io) 12.11.2 (configured via `packageManager`)

## Workspace

| Package                      | Name                               | Status      | Description                                       |
| ---------------------------- | ---------------------------------- | ----------- | ------------------------------------------------- |
| `apps/api`                   | `@observability/api`               | Operational | Express API with health checks and env validation |
| `apps/worker`                | `@observability/worker`            | Placeholder | Background worker                                 |
| `apps/web`                   | `@observability/web`               | Placeholder | Dashboard application                             |
| `packages/contracts`         | `@observability/contracts`         | Operational | Shared Zod validation schemas & TypeScript types  |
| `packages/db`                | `@observability/db`                | Operational | Neon PostgreSQL schemas, Drizzle ORM & migrations |
| `packages/typescript-config` | `@observability/typescript-config` | Operational | Shared TSConfig                                   |
| `packages/logger`            | `@observability/logger`            | Placeholder | Shared logging package                            |
| `packages/sdk`               | `@observability/sdk`               | Placeholder | Telemetry SDK                                     |
| `packages/eslint-config`     | `@observability/eslint-config`     | Placeholder | Shared ESLint configuration                       |

## Neon PostgreSQL Setup

1. Sign up or log into [Neon Console](https://console.neon.tech).
2. Create a new Neon project (e.g. `observability-platform`).
3. In your project dashboard, find the **Connection Details** section.
4. **Application Query Connection (Pooled)**:
   - Check the **"Pooled connection"** checkbox.
   - Copy the connection string (it contains `-pooler` in the host).
   - Set as `DATABASE_URL` in `.env`.
5. **Migration Connection (Direct)**:
   - Uncheck the **"Pooled connection"** checkbox.
   - Copy the direct connection string.
   - Set as `MIGRATION_DATABASE_URL` in `.env`.

> **Why two connection strings?**
> Neon's connection pooler operates in transaction pooling mode (PgBouncer), which is ideal for stateless application queries and serverless environments. However, DDL migration commands and advisory locks require a direct, session-level connection to PostgreSQL.

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable                 | Description                                             | Default                                 |
| ------------------------ | ------------------------------------------------------- | --------------------------------------- |
| `NODE_ENV`               | Environment (`development`, `test`, `production`)       | `development`                           |
| `PORT`                   | API listen port                                         | `4000`                                  |
| `DATABASE_URL`           | Neon pooled PostgreSQL connection string                | _None (optional in unit tests)_         |
| `MIGRATION_DATABASE_URL` | Neon direct PostgreSQL connection string                | _Optional (falls back to DATABASE_URL)_ |
| `TEST_DATABASE_URL`      | Isolated test PostgreSQL instance for integration tests | _Optional_                              |

_Note: The Express app does not open database connections during module imports and unit tests do not require an active Neon database._

## Database Migrations

Run these commands from repository root:

```bash
# Generate SQL migrations after schema changes
pnpm --filter @observability/db run db:generate

# Apply migrations using direct connection
pnpm --filter @observability/db run db:migrate

# Open Drizzle Studio to inspect database records
pnpm --filter @observability/db run db:studio
```

Generated SQL migration files are tracked in `packages/db/drizzle/`.

## Commands

Run these from the repository root:

| Command          | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| `pnpm dev`       | Start development processes (`@observability/api` via `tsx watch`). |
| `pnpm build`     | Build all packages (`contracts`, `db`, `api`) via `tsc`.            |
| `pnpm test`      | Run all test suites (unit tests for contracts, db, and API).        |
| `pnpm typecheck` | Type-check all packages (`tsc --noEmit`).                           |
| `pnpm lint`      | Lint code with ESLint.                                              |
| `pnpm format`    | Format code with Prettier.                                          |

## API Endpoints (Phase 1 preserved)

- `GET http://localhost:4000/health`
- `GET http://localhost:4000/api/v1/health`

Both return JSON:

```json
{
  "status": "ok",
  "service": "observability-api",
  "timestamp": "2026-10-13T07:30:00.000Z"
}
```

Unknown routes return JSON `404`. Malformed JSON request bodies return JSON `400`.
