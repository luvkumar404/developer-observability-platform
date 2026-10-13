import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { z } from "zod";
import * as schema from "./schema/index.js";

export const dbEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (url) => url.startsWith("postgresql://") || url.startsWith("postgres://"),
      "DATABASE_URL must be a valid PostgreSQL connection string",
    ),
  MIGRATION_DATABASE_URL: z
    .string()
    .refine(
      (url) => url.startsWith("postgresql://") || url.startsWith("postgres://"),
      "MIGRATION_DATABASE_URL must be a valid PostgreSQL connection string",
    )
    .optional(),
});

export type DbEnv = z.infer<typeof dbEnvSchema>;
export type Schema = typeof schema;
export type Database = NeonHttpDatabase<Schema>;
export type TransactionDatabase = NeonDatabase<Schema>;

/**
 * Resolves the connection string from parameter or process.env without throwing at import time.
 */
function resolveConnectionString(overrideUrl?: string): string {
  const url = overrideUrl ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Database connection string is required. Provide it as an argument or set DATABASE_URL.",
    );
  }
  const parsed = dbEnvSchema.shape.DATABASE_URL.safeParse(url);
  if (!parsed.success) {
    throw new Error(
      `Invalid DATABASE_URL: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    );
  }
  return parsed.data;
}

// Cached instances to avoid unnecessary connection creation
let cachedHttpDb: Database | null = null;
let cachedHttpUrl: string | null = null;

let cachedWsDb: TransactionDatabase | null = null;
let cachedWsPool: Pool | null = null;
let cachedWsUrl: string | null = null;

/**
 * Create a stateless Neon HTTP client (ideal for simple serverless queries).
 * Does not support interactive transactions.
 */
export function createHttpClient(connectionString?: string): Database {
  const url = resolveConnectionString(connectionString);
  const sql = neon(url);
  return drizzleHttp(sql, { schema });
}

/**
 * Get the cached HTTP client singleton or create one.
 * Avoids connecting at module import time and reuses connections.
 */
export function getDb(connectionString?: string): Database {
  const url = resolveConnectionString(connectionString);
  if (!cachedHttpDb || cachedHttpUrl !== url) {
    cachedHttpDb = createHttpClient(url);
    cachedHttpUrl = url;
  }
  return cachedHttpDb;
}

/**
 * Create a WebSocket-based Neon client with session support and interactive transaction capability.
 */
export function createTransactionClient(connectionString?: string): {
  db: TransactionDatabase;
  pool: Pool;
} {
  const url = resolveConnectionString(connectionString);
  const pool = new Pool({ connectionString: url });
  const db = drizzleWs(pool, { schema });
  return { db, pool };
}

/**
 * Get the cached WebSocket / transaction-capable client singleton or create one.
 */
export function getTransactionDb(connectionString?: string): TransactionDatabase {
  const url = resolveConnectionString(connectionString);
  if (!cachedWsDb || cachedWsUrl !== url) {
    if (cachedWsPool) {
      void cachedWsPool.end();
    }
    const { db, pool } = createTransactionClient(url);
    cachedWsDb = db;
    cachedWsPool = pool;
    cachedWsUrl = url;
  }
  return cachedWsDb;
}

/**
 * Cleanly closes any open connection pools. Useful during application shutdown and in test suites.
 */
export async function closeDb(): Promise<void> {
  if (cachedWsPool) {
    await cachedWsPool.end();
    cachedWsPool = null;
    cachedWsDb = null;
    cachedWsUrl = null;
  }
  cachedHttpDb = null;
  cachedHttpUrl = null;
}
