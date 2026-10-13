# Developer Observability Platform

TypeScript monorepo for a developer observability platform. Phase 1 provides the workspace foundation and an operational Express.js API with health checks.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io) 12.11.2 (configured via `packageManager`)

## Workspace

| Package                      | Name                               | Phase 1          |
| ---------------------------- | ---------------------------------- | ---------------- |
| `apps/api`                   | `@observability/api`               | Express API      |
| `apps/worker`                | `@observability/worker`            | Placeholder      |
| `apps/web`                   | `@observability/web`               | Placeholder      |
| `packages/contracts`         | `@observability/contracts`         | Shared API types |
| `packages/typescript-config` | `@observability/typescript-config` | Shared TSConfig  |
| `packages/db`                | `@observability/db`                | Placeholder      |
| `packages/logger`            | `@observability/logger`            | Placeholder      |
| `packages/sdk`               | `@observability/sdk`               | Placeholder      |
| `packages/eslint-config`     | `@observability/eslint-config`     | Placeholder      |

Placeholder packages exist so pnpm and Turborepo can discover the full workspace. They do not implement database access, queues, the SDK, or the dashboard yet.

## Setup

```bash
pnpm install
cp .env.example apps/api/.env
```

Environment variables (see `.env.example`):

- `NODE_ENV` — `development`, `test`, or `production` (default: `development`)
- `PORT` — API listen port (default: `4000`)

## Commands

Run these from the repository root. Turborepo executes package tasks and skips packages that do not define a given script.

| Command          | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`       | Start development processes. Currently this is the API (`tsx watch`).               |
| `pnpm build`     | Build packages that compile TypeScript (`contracts`, `api`) to `dist/`.             |
| `pnpm test`      | Run API integration tests (Supertest against the Express app, no network listener). |
| `pnpm typecheck` | Type-check compiling packages.                                                      |
| `pnpm lint`      | Lint packages that define a `lint` script (currently `api` and `contracts`).        |
| `pnpm format`    | Format the repository with Prettier.                                                |

API-only commands:

```bash
pnpm --filter @observability/api dev
pnpm --filter @observability/api start
```

`pnpm --filter @observability/api start` requires a prior `pnpm build`.

## API

After `pnpm dev`:

- `GET http://localhost:4000/health`
- `GET http://localhost:4000/api/v1/health`

Both return JSON with `status`, `service`, and `timestamp`. Unknown routes return JSON `404`. Malformed JSON bodies return JSON `400`.
