import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

loadDotenv();

/**
 * Runs Drizzle migrations against the database.
 * Uses a direct Neon connection (MIGRATION_DATABASE_URL or DATABASE_URL).
 */
export async function runMigrations(connectionString?: string): Promise<void> {
  const url = connectionString ?? process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Migration connection string is required. Provide it as an argument or set MIGRATION_DATABASE_URL / DATABASE_URL.",
    );
  }

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // In source tree migrations are at ../drizzle, in dist they might be at ../../drizzle or ../drizzle
  const migrationsFolder = path.resolve(__dirname, "../drizzle");

  console.log("Applying migrations from:", migrationsFolder);
  try {
    await migrate(db, { migrationsFolder });
    console.log("Migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

// Allow direct CLI invocation: tsx src/migrate.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runMigrations().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}
